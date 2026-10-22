import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const apiSource = path.join(root, "src", "app", "api");
const apiBackup = path.join(root, ".github-pages-api-backup");
const nextBuild = path.join(root, ".next");
const routeFiles = [
  path.join(root, "src", "app", "layout.tsx"),
  path.join(root, "src", "app", "sitemap.ts"),
  path.join(root, "src", "app", "software", "[slug]", "page.tsx"),
];
const dynamicLine = 'export const dynamic = "force-dynamic";';
const staticLine = 'export const dynamic = "force-static";';
const originalFiles = new Map(routeFiles.map((file) => [file, readFileSync(file, "utf8")]));

if (existsSync(apiBackup)) rmSync(apiBackup, { recursive: true, force: true });
if (existsSync(apiSource)) renameSync(apiSource, apiBackup);
if (existsSync(nextBuild)) rmSync(nextBuild, { recursive: true, force: true });
for (const file of routeFiles) {
  writeFileSync(file, readFileSync(file, "utf8").replace(dynamicLine, staticLine), "utf8");
}

const env = {
  ...process.env,
  NEXT_PUBLIC_STATIC_EXPORT: "true",
  NEXT_PUBLIC_BASE_PATH: "/software-showcase",
  NEXT_PUBLIC_SITE_URL: "https://wyf-cloud.github.io/software-showcase",
};
let exitCode = 1;
try {
  const command = process.platform === "win32" ? "npx.cmd" : "npx";
  const result = spawnSync(command, ["next", "build", "--webpack"], {
    cwd: root,
    env,
    shell: process.platform === "win32",
    stdio: "inherit",
  });
  if (result.error) console.error(result.error);
  exitCode = result.status ?? 1;
} finally {
  for (const [file, source] of originalFiles) writeFileSync(file, source, "utf8");
  if (existsSync(apiSource)) rmSync(apiSource, { recursive: true, force: true });
  if (existsSync(apiBackup)) renameSync(apiBackup, apiSource);
}
process.exit(exitCode);
