import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { unlink } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getAdminToken } from "@/lib/site-settings";
import { isAdvertisementImagePath, readAdvertisements } from "@/lib/advertisements";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const configPath = "data/advertisements.json";
const maxAssets = 50;
type GitResult = { code: number; stdout: string; stderr: string };
type PublishEvent = { type: "progress" | "log" | "complete"; percent: number; message: string; detail?: string; success?: boolean; commit?: string };
let publishInProgress = false;

function isAuthorized(request: Request) {
  const expected = getAdminToken();
  return Boolean(expected) && request.headers.get("x-admin-token") === expected;
}

function isLocalRequest(request: Request) {
  const url = new URL(request.url);
  const hostname = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  const loopback = hostname === "localhost" || hostname.endsWith(".localhost") || hostname === "127.0.0.1" || hostname === "::1";
  return loopback && request.headers.get("origin") === url.origin;
}

function sanitize(value: string) {
  return value.replace(/\u001b\[[0-9;]*m/g, "").replace(/(https?:\/\/)[^/@\s]+@/gi, "$1[credentials]@").trim().slice(-400);
}

function runGit(args: string[], env: Partial<NodeJS.ProcessEnv>, onOutput?: (stream: "stdout" | "stderr", text: string) => void): Promise<GitResult> {
  return new Promise((resolve, reject) => {
    const child = spawn("git", args, {
      cwd: process.cwd(),
      env: { ...process.env, ...env, GIT_TERMINAL_PROMPT: "0", GCM_INTERACTIVE: "auto", GCM_GUI_PROMPT: "true", GCM_PROVIDER: "github", GCM_GITHUB_AUTHMODES: "browser" },
      windowsHide: true,
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk: Buffer) => { const text = chunk.toString(); stdout += text; onOutput?.("stdout", text); });
    child.stderr.on("data", (chunk: Buffer) => { const text = chunk.toString(); stderr += text; onOutput?.("stderr", text); });
    child.on("error", reject);
    child.on("close", (code) => resolve({ code: code ?? 1, stdout, stderr }));
  });
}

function lastOutput(result: GitResult) {
  return sanitize((result.stderr || result.stdout).trim().split(/\r?\n/).filter(Boolean).slice(-1)[0] || "Git 命令已完成");
}

export async function POST(request: Request) {
  if (!isLocalRequest(request)) return NextResponse.json({ error: "广告发布仅在本机后台运行" }, { status: 403 });
  if (!isAuthorized(request)) return NextResponse.json({ error: "管理员口令不正确" }, { status: 401 });
  if (publishInProgress) return NextResponse.json({ error: "已有广告发布任务正在执行" }, { status: 409 });
  publishInProgress = true;

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let percent = 0;
      let closed = false;
      const send = (event: PublishEvent) => { if (!closed) controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`)); };
      const progress = (next: number, message: string, detail?: string) => { percent = Math.max(percent, Math.min(100, next)); send({ type: "progress", percent, message, detail }); };
      const fail = (message: string, detail?: string) => send({ type: "complete", percent: Math.min(percent, 99), message, detail, success: false });
      const log = (streamName: "stdout" | "stderr", text: string) => {
        for (const line of text.replace(/\r/g, "").split("\n").map((part) => part.trim()).filter(Boolean).slice(-2)) {
          send({ type: "log", percent, message: streamName === "stderr" ? "Git 输出" : "命令输出", detail: sanitize(line) });
        }
      };

      void (async () => {
        let indexPath = "";
        try {
          progress(3, "正在读取广告配置与本机 Git 仓库…");
          const advertisements = await readAdvertisements();
          const assetPaths = [...new Set(advertisements.ads.map((ad) => ad.imageUrl).filter(Boolean))];
          if (assetPaths.length > maxAssets || assetPaths.some((item) => !isAdvertisementImagePath(item))) {
            fail("广告素材清单校验失败。", "请检查后台上传的广告图片路径。");
            return;
          }
          const absoluteAssets = assetPaths.map((item) => path.join(process.cwd(), "public", item.slice(1).replaceAll("/", path.sep)));
          if (absoluteAssets.some((item) => !existsSync(item))) {
            fail("有广告图片在本机缺失，配置已保留。", "请重新上传缺失图片后重试发布。");
            return;
          }

          const repo = await runGit(["rev-parse", "--show-toplevel"], {});
          if (repo.code !== 0 || path.resolve(repo.stdout.trim()) !== path.resolve(/*turbopackIgnore: true*/ process.cwd())) {
            fail("当前目录不是项目 Git 仓库根目录。", lastOutput(repo));
            return;
          }
          const branchResult = await runGit(["branch", "--show-current"], {});
          const branch = branchResult.stdout.trim();
          if (branchResult.code !== 0 || !branch) { fail("无法确定当前 Git 分支。", lastOutput(branchResult)); return; }
          const remote = await runGit(["remote", "get-url", "origin"], {});
          if (remote.code !== 0 || (!/^https:\/\/github\.com\//i.test(remote.stdout.trim()) && !/^git@github\.com:/i.test(remote.stdout.trim()))) {
            fail("未找到可用的 GitHub origin 远程地址。", lastOutput(remote));
            return;
          }

          progress(12, "正在确认 GitHub 分支最新状态…", `当前分支：${branch}`);
          const fetch = await runGit(["fetch", "origin", `+refs/heads/${branch}:refs/remotes/origin/${branch}`], {} , (name, text) => log(name, text));
          if (fetch.code !== 0) { fail("读取 GitHub 分支状态失败，广告配置仍保存在本机。", lastOutput(fetch)); return; }
          const remoteHeadResult = await runGit(["rev-parse", `refs/remotes/origin/${branch}`], {});
          const localHeadResult = await runGit(["rev-parse", "HEAD"], {});
          if (remoteHeadResult.code !== 0 || localHeadResult.code !== 0) { fail("无法比较本地与远程分支。", lastOutput(remoteHeadResult)); return; }
          const remoteHead = remoteHeadResult.stdout.trim();
          const localHead = localHeadResult.stdout.trim();
          const ancestor = await runGit(["merge-base", "--is-ancestor", remoteHead, localHead], {});
          if (ancestor.code !== 0) { fail("本地分支与 GitHub 分支不一致，已停止发布。", "请先在常规 GitHub 同步中对齐分支后重试广告发布。"); return; }

          const allowed = new Set([configPath, ...assetPaths.map((item) => `public${item}`)]);
          const aheadResult = await runGit(["rev-list", "--reverse", "--parents", `${remoteHead}..${localHead}`], {});
          if (aheadResult.code !== 0) { fail("检查待推送提交失败。", lastOutput(aheadResult)); return; }
          const aheadCommits = aheadResult.stdout.trim().split(/\r?\n/).filter(Boolean).map((line) => line.trim().split(/\s+/));
          for (const commit of aheadCommits) {
            if (commit.length !== 2) { fail("发现非广告专用的待推送提交，已停止以免推送其他改动。", commit[0]?.slice(0, 12)); return; }
            const changed = await runGit(["diff-tree", "--no-commit-id", "--name-only", "-r", commit[0]], {});
            const paths = changed.stdout.split(/\r?\n/).filter(Boolean);
            if (changed.code !== 0 || paths.some((item) => !allowed.has(item))) {
              fail("发现包含其他项目文件的待推送提交，已停止以免混合发布。", lastOutput(changed));
              return;
            }
          }

          indexPath = path.join(os.tmpdir(), `ads-index-${process.pid}-${randomUUID()}`);
          const gitEnv = { GIT_INDEX_FILE: indexPath };
          progress(32, "正在建立广告专用暂存区…", "不会改动工作区中其他已暂存文件");
          const readTree = await runGit(["read-tree", "HEAD"], gitEnv);
          if (readTree.code !== 0) { fail("建立广告专用暂存区失败。", lastOutput(readTree)); return; }
          const pathsToStage = [configPath, ...[...new Set(absoluteAssets)].map((item) => path.relative(process.cwd(), item).replaceAll("\\", "/"))];
          const add = await runGit(["add", "--", ...pathsToStage], gitEnv);
          if (add.code !== 0) { fail("暂存广告配置或素材失败，配置仍保留在本机。", lastOutput(add)); return; }
          const staged = await runGit(["diff", "--cached", "--name-only", "-z"], gitEnv);
          const stagedPaths = staged.stdout.split("\0").filter(Boolean);
          if (staged.code !== 0 || stagedPaths.some((item) => !allowed.has(item))) {
            fail("广告暂存内容超出允许范围，已中止发布。", stagedPaths.join("、"));
            return;
          }
          if (stagedPaths.length > 0) {
            const check = await runGit(["diff", "--cached", "--check"], gitEnv);
            if (check.code !== 0) { fail("广告配置提交检查未通过。", lastOutput(check)); return; }
            progress(50, "广告配置与素材检查通过，正在创建专用提交…", `仅包含 ${stagedPaths.length} 个广告文件`);
            const commit = await runGit(["commit", "-m", "chore: publish advertisements"], gitEnv, (name, text) => log(name, text));
            if (commit.code !== 0) { fail("广告专用提交失败，配置仍保留在本机。", lastOutput(commit)); return; }
          } else if (localHead === remoteHead) {
            progress(100, "广告配置与线上版本一致，无需推送。", "配置和素材均无新变更");
            send({ type: "complete", percent: 100, message: "广告配置与线上版本一致。", success: true, commit: localHead.slice(0, 7) });
            return;
          }

          progress(72, "正在推送广告专用提交到 GitHub…", "只包含广告配置及其引用的上传图片");
          const push = await runGit(["push", "origin", `HEAD:refs/heads/${branch}`], {}, (name, text) => log(name, text));
          if (push.code !== 0) {
            const output = `${push.stderr}\n${push.stdout}`;
            const message = /authentication failed|could not read (?:username|password)|terminal prompts disabled|bad credentials/i.test(output)
              ? "GitHub 登录验证未完成，广告配置已保存，可登录后重试。"
              : /permission to .* denied|write access.*not granted|protected branch|403/i.test(output)
                ? "GitHub 拒绝了推送请求，广告配置已保存，可检查仓库权限后重试。"
                : "推送失败，广告配置仍保存在本机，可修复网络后重试。";
            fail(message, lastOutput(push));
            return;
          }
          const commit = await runGit(["rev-parse", "--short", "HEAD"], {});
          progress(100, "广告配置已推送，GitHub Actions 将开始部署。", `分支：${branch} · 提交：${commit.stdout.trim()}`);
          send({ type: "complete", percent: 100, message: "广告配置已推送，等待 GitHub Actions 部署完成。", success: true, commit: commit.stdout.trim() });
        } catch (error) {
          fail("广告发布未完成，已保存的本机配置会保留。", error instanceof Error ? sanitize(error.message) : "未知错误");
        } finally {
          publishInProgress = false;
          if (indexPath) await unlink(indexPath).catch(() => undefined);
          if (!closed) { closed = true; controller.close(); }
        }
      })();
    },
  });

  return new Response(stream, {
    headers: { "Cache-Control": "no-cache, no-transform", Connection: "keep-alive", "Content-Type": "text/event-stream; charset=utf-8" },
  });
}
