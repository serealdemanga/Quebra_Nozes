import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const webDir = path.resolve(repoRoot, "apps", "web", "app");

const result = spawnSync(process.platform === "win32" ? "npm.cmd" : "npm", ["run", "build"], {
  cwd: webDir,
  stdio: "inherit",
  env: process.env,
});

process.exit(result.status ?? 1);
