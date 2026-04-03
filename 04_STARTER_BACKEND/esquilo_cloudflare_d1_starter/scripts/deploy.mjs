import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const envName = process.argv[2];
if (!envName) {
  console.error("Uso: node scripts/deploy.mjs <local|hml|production>");
  process.exit(1);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workerDir = path.resolve(__dirname, "..");

run("npm", ["run", "build:web"], { cwd: workerDir });
run("npm", ["run", "sync:web"], { cwd: workerDir });

// Build gate: se build/sync falhar, nao chega aqui.
run("npx", ["wrangler", "deploy", "--env", envName], { cwd: workerDir });

function run(bin, args, options) {
  const cmd =
    process.platform === "win32" && bin === "npm"
      ? "npm.cmd"
      : process.platform === "win32" && bin === "npx"
        ? "npx.cmd"
        : bin;
  const result = spawnSync(cmd, args, { stdio: "inherit", env: process.env, ...options });
  if ((result.status ?? 1) !== 0) process.exit(result.status ?? 1);
}
