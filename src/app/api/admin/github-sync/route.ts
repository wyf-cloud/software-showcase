import { spawn, spawnSync } from "node:child_process";
import net from "node:net";
import { NextResponse } from "next/server";
import { getAdminToken } from "@/lib/site-settings";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type SyncEvent = {
  type: "progress" | "log" | "complete";
  percent: number;
  message: string;
  detail?: string;
  success?: boolean;
  branch?: string;
  commit?: string;
};

type GitResult = {
  code: number;
  stdout: string;
  stderr: string;
};

let syncInProgress = false;

function isAuthorized(request: Request) {
  const expected = getAdminToken();
  return Boolean(expected) && request.headers.get("x-admin-token") === expected;
}

function isLocalRequest(request: Request) {
  const url = new URL(request.url);
  const hostname = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  const isLoopback = hostname === "localhost" || hostname.endsWith(".localhost") || hostname === "127.0.0.1" || hostname === "::1";
  const origin = request.headers.get("origin");
  return isLoopback && origin === url.origin;
}

function sanitize(value: string) {
  return value
    .replace(/\u001b\[[0-9;]*m/g, "")
    .replace(/(https?:\/\/)[^/@\s]+@/gi, "$1[credentials]@")
    .trim()
    .slice(-500);
}

function isSensitivePath(filePath: string) {
  const normalized = filePath.replace(/\\/g, "/");
  if (/(^|\/)\.env(?:$|\.(?!example(?:$|\.)))/i.test(normalized)) return true;
  if (/(^|\/)(?:id_rsa|id_ed25519|credentials?\.json|secrets?\.json)$/i.test(normalized)) return true;
  return /\.(?:pem|p12|pfx|key)$/i.test(normalized);
}

/**
 * 读取 Windows 系统代理（HKCU Internet Settings）。
 * 返回类似 "http://127.0.0.1:12450" 的地址；未启用或读取失败时返回 null。
 * 浏览器能访问 GitHub 而 git 连不上 443，通常就是系统代理开着但 git 没走代理，
 * 这里自动检测并注入，保证两者行为一致。
 */
function readWindowsSystemProxy(): string | null {
  if (process.platform !== "win32") return null;
  try {
    const key = "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings";
    const enabled = spawnSync("reg", ["query", key, "/v", "ProxyEnable"], { encoding: "utf8", windowsHide: true, timeout: 3000 });
    if (enabled.status !== 0 || !/ProxyEnable\s+REG_DWORD\s+0x1/i.test(enabled.stdout)) return null;
    const server = spawnSync("reg", ["query", key, "/v", "ProxyServer"], { encoding: "utf8", windowsHide: true, timeout: 3000 });
    const match = server.stdout.match(/ProxyServer\s+REG_SZ\s+(\S+)/i);
    if (!match) return null;
    let value = match[1];
    // 支持 "http=host:port;https=host:port" 这种分协议格式，优先取 https
    if (value.includes("=")) {
      const entries = Object.fromEntries(value.split(";").map((part) => part.split("=", 2) as [string, string]));
      value = entries.https || entries.http || Object.values(entries)[0] || "";
    }
    if (!value) return null;
    return /^https?:\/\//i.test(value) ? value : `http://${value}`;
  } catch {
    return null;
  }
}

/** 快速探测代理端口是否可连（代理软件可能已关闭），超时 1.5 秒视为不可用。 */
function isProxyReachable(proxyUrl: string): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const { hostname, port } = new URL(proxyUrl);
      const socket = net.connect({ host: hostname, port: Number(port) || 80, timeout: 1500 });
      socket.once("connect", () => { socket.destroy(); resolve(true); });
      socket.once("timeout", () => { socket.destroy(); resolve(false); });
      socket.once("error", () => { socket.destroy(); resolve(false); });
    } catch {
      resolve(false);
    }
  });
}

/**
 * 构造 git 命令行：检测到可用系统代理时用 -c 显式指定 http(s).proxy，
 * 代理不可用时显式清空，避免全局 git config 里的过期代理把直连也拖垮。
 * 命令行 -c 优先级高于全局配置，保证每次推送都按"当下"的网络环境执行。
 */
async function buildGitArgs(args: string[]): Promise<string[]> {
  if (process.platform !== "win32") return args;
  const proxy = readWindowsSystemProxy();
  const reachable = proxy ? await isProxyReachable(proxy) : false;
  const value = reachable && proxy ? proxy : "";
  return ["-c", `http.proxy=${value}`, "-c", `https.proxy=${value}`, ...args];
}

function runGit(args: string[], onOutput?: (stream: "stdout" | "stderr", text: string) => void) {
  return new Promise<GitResult>((resolve, reject) => {
    void (async () => {
      const gitArgs = await buildGitArgs(args);
      const child = spawn("git", gitArgs, {
        cwd: process.cwd(),
        env: {
          ...process.env,
          GIT_TERMINAL_PROMPT: "0",
          GCM_INTERACTIVE: "auto",
          GCM_GUI_PROMPT: "true",
          GCM_PROVIDER: "github",
          GCM_GITHUB_AUTHMODES: "browser",
        },
        windowsHide: true,
      });
      bindChild(child, resolve, onOutput);
    })().catch(reject);
  });
}

function bindChild(
  child: ReturnType<typeof spawn>,
  resolve: (result: GitResult) => void,
  onOutput?: (stream: "stdout" | "stderr", text: string) => void,
) {
  let stdout = "";
  let stderr = "";

  child.stdout?.on("data", (chunk: Buffer) => {
    const text = chunk.toString();
    stdout += text;
    onOutput?.("stdout", text);
  });
  child.stderr?.on("data", (chunk: Buffer) => {
    const text = chunk.toString();
    stderr += text;
    onOutput?.("stderr", text);
  });
  child.on("error", (error) => resolve({ code: 1, stdout, stderr: String(error) }));
  child.on("close", (code) => resolve({ code: code ?? 1, stdout, stderr }));
}

function getOutputMessage(result: GitResult) {
  return sanitize((result.stderr || result.stdout).trim().split(/\r?\n/).filter(Boolean).slice(-1)[0] || "命令已完成");
}

export async function POST(request: Request) {
  if (!isLocalRequest(request)) {
    return NextResponse.json({ error: "此同步接口仅供本机后台使用" }, { status: 403 });
  }
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "管理员口令不正确" }, { status: 401 });
  }
  if (syncInProgress) {
    return NextResponse.json({ error: "已有一个 GitHub 更新任务正在执行" }, { status: 409 });
  }

  syncInProgress = true;
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (event: SyncEvent) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };
      let currentPercent = 0;
      const progress = (percent: number, message: string, detail?: string) => {
        currentPercent = Math.max(currentPercent, Math.min(100, percent));
        send({ type: "progress", percent: currentPercent, message, detail });
      };
      const logOutput = (percent: number, streamName: "stdout" | "stderr", text: string) => {
        const lines = text.replace(/\r/g, "").split("\n").map((line) => line.trim()).filter(Boolean);
        for (const line of lines.slice(-3)) {
          send({ type: "log", percent, message: streamName === "stderr" ? "Git 输出" : "命令输出", detail: sanitize(line) });
        }
      };
      const fail = (message: string, detail?: string) => {
        send({ type: "complete", percent: Math.min(currentPercent, 99), message, detail, success: false });
      };
      const getPushFailureMessage = (output: string) => {
        if (/could not resolve host|could not connect|failed to connect|connection (?:was )?reset|connection timed out|timed out|network is unreachable|ssl connection/i.test(output)) {
          return "连接 GitHub 失败（网络、代理或防火墙问题），请求尚未进入凭证验证阶段。";
        }
        if (/authentication failed|could not read (?:username|password)|terminal prompts disabled|http basic: access denied|bad credentials|invalid username or password/i.test(output)) {
          return "GitHub 凭证验证未通过。已启用 Git Credential Manager 浏览器登录；如未弹出浏览器，请检查 GCM 安装和系统默认浏览器。";
        }
        if (/permission to .* denied|write access to repository not granted|protected branch|403/i.test(output)) {
          return "GitHub 已响应，但当前账号可能没有此仓库或分支的推送权限。";
        }
        return "推送到 GitHub 失败，请检查下方 Git 错误详情。";
      };

      void (async () => {
        try {
          progress(5, "正在检查本地 Git 仓库…");
          const repository = await runGit(["rev-parse", "--show-toplevel"]);
          if (repository.code !== 0) {
            fail("当前目录不是 Git 仓库。", getOutputMessage(repository));
            return;
          }

          const branchResult = await runGit(["branch", "--show-current"]);
          const branch = branchResult.stdout.trim();
          if (branchResult.code !== 0 || !branch) {
            fail("无法确定当前 Git 分支。", getOutputMessage(branchResult));
            return;
          }

          const remoteResult = await runGit(["remote", "get-url", "origin"]);
          if (remoteResult.code !== 0) {
            fail("未找到 origin 远程仓库，请先配置 GitHub 远程地址。", getOutputMessage(remoteResult));
            return;
          }
          const remoteUrl = remoteResult.stdout.trim();
          if (!/^https:\/\/github\.com\//i.test(remoteUrl) && !/^git@github\.com:/i.test(remoteUrl)) {
            fail("origin 远程地址不是 GitHub 仓库，已停止推送。", "请检查本地 Git 的 origin 地址。");
            return;
          }

          progress(15, `已连接 GitHub 远程仓库，当前分支：${branch}`);
          const beforeResult = await runGit(["status", "--short"]);
          if (beforeResult.code !== 0) {
            fail("读取文件变更失败。", getOutputMessage(beforeResult));
            return;
          }
          const beforeFiles = beforeResult.stdout.trim().split(/\r?\n/).filter(Boolean);
          progress(25, `发现 ${beforeFiles.length} 项未提交变更，准备同步全部未忽略文件。`);

          progress(40, "正在暂存全部变更…");
          const addResult = await runGit(["add", "-A"]);
          if (addResult.code !== 0) {
            fail("暂存文件失败。", getOutputMessage(addResult));
            return;
          }

          const stagedResult = await runGit(["diff", "--cached", "--name-only", "-z"]);
          if (stagedResult.code !== 0) {
            fail("读取暂存文件失败。", getOutputMessage(stagedResult));
            return;
          }
          const stagedFiles = stagedResult.stdout.split("\0").filter(Boolean);
          const sensitiveFiles = stagedFiles.filter(isSensitivePath);
          if (sensitiveFiles.length > 0) {
            fail("检测到疑似密钥或环境配置文件，已停止提交和推送。", `请先移出暂存区并检查：${sensitiveFiles.slice(0, 5).join("、")}`);
            return;
          }

          if (stagedFiles.length > 0) {
            progress(50, `已暂存 ${stagedFiles.length} 个文件，正在检查并创建提交…`);
            const whitespaceResult = await runGit(["diff", "--cached", "--check"]);
            if (whitespaceResult.code !== 0) {
              fail("提交检查发现空白字符错误，已停止推送。", getOutputMessage(whitespaceResult));
              return;
            }
            progress(58, `文件检查通过，正在提交 ${stagedFiles.length} 个文件…`);
            const commitResult = await runGit(["commit", "-m", "chore: update website from admin"], (streamName, text) => logOutput(55, streamName, text));
            if (commitResult.code !== 0) {
              fail("创建 Git 提交失败。", getOutputMessage(commitResult));
              return;
            }
            progress(68, "本地提交已创建，准备推送到 GitHub。", getOutputMessage(commitResult));
          } else {
            progress(55, "没有新的未忽略文件变更，检查远程分支是否需要推送。", "当前工作区已是干净状态");
          }

          progress(76, `正在推送 ${branch} 分支到 GitHub…`);
          let lastPushPercent = -1;
          const pushResult = await runGit(["push", "--progress", "origin", branch], (streamName, output) => {
            logOutput(80, streamName, output);
            for (const match of output.matchAll(/(\d{1,3})%/g)) {
              const value = Math.min(100, Number(match[1]));
              if (value > lastPushPercent) {
                lastPushPercent = value;
                progress(76 + Math.round(value * 0.2), `正在推送 Git 对象… ${value}%`);
              }
            }
          });
          if (pushResult.code !== 0) {
            const pushOutput = `${pushResult.stderr}\n${pushResult.stdout}`;
            fail(getPushFailureMessage(pushOutput), getOutputMessage(pushResult));
            return;
          }

          const commitResult = await runGit(["rev-parse", "--short", "HEAD"]);
          progress(100, "网站代码已成功更新到 GitHub。", `分支：${branch} · 提交：${commitResult.stdout.trim() || "最新提交"}`);
          send({ type: "complete", percent: 100, message: "网站代码已成功更新到 GitHub。", success: true, branch, commit: commitResult.stdout.trim() });
        } catch (error) {
          const message = error instanceof Error ? error.message : "执行 Git 同步时发生未知错误";
          fail("GitHub 更新失败。", message);
        } finally {
          syncInProgress = false;
          controller.close();
        }
      })();
    },
  });

  return new Response(stream, {
    headers: {
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Content-Type": "text/event-stream; charset=utf-8",
    },
  });
}
