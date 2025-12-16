import { spawn } from "bun";
import path from "path";

type Step = { name: string; cmd: string[]; cwd: string };

const repoRoot = path.resolve(import.meta.dir, "..");

const steps: Step[] = [
  { name: "shared", cmd: ["bun", "install"], cwd: path.join(repoRoot, "shared") },
  { name: "backend", cmd: ["bun", "install"], cwd: path.join(repoRoot, "backend") },
  { name: "frontend", cmd: ["bun", "install"], cwd: path.join(repoRoot, "frontend") },
  { name: "frontend-core", cmd: ["bun", "install"], cwd: path.join(repoRoot, "frontend", "packages", "core") },
  { name: "frontend-vue", cmd: ["bun", "install"], cwd: path.join(repoRoot, "frontend", "packages", "vue") },
  { name: "frontend-react", cmd: ["bun", "install"], cwd: path.join(repoRoot, "frontend", "packages", "react") },
  { name: "desktop", cmd: ["bun", "install"], cwd: path.join(repoRoot, "desktop") },
];

async function runStep(step: Step) {
  console.log(`\n==> Installing ${step.name} (${step.cwd})`);
  const proc = spawn({
    cmd: step.cmd,
    cwd: step.cwd,
    stdout: "inherit",
    stderr: "inherit",
  });
  const code = await proc.exited;
  if (code !== 0) {
    throw new Error(`Step "${step.name}" failed with code ${code}`);
  }
}

async function main() {
  for (const step of steps) {
    await runStep(step);
  }
  console.log("\nAll dependencies installed.");
}

main().catch((err) => {
  console.error(err?.message ?? err);
  process.exit(1);
});
