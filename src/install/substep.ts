import { spawn } from "node:child_process";

export interface OkxSubstep {
  name: string;
  args: readonly string[];
}

export const OKX_SUBSTEPS: readonly OkxSubstep[] = [
  {
    name: "plugin-store",
    args: ["skills", "add", "okx/plugin-store", "--skill", "plugin-store", "--yes"]
  },
  {
    name: "onchainos-skills",
    args: ["skills", "add", "okx/onchainos-skills", "--yes"]
  }
];

export interface SubstepResult {
  name: string;
  command: string;
  status: "success" | "failed" | "skipped";
  exitCode?: number;
  error?: string;
  duration: number;
}

export async function runOkxSubsteps(options: {
  skip: boolean;
  timeoutMs?: number;
}): Promise<SubstepResult[]> {
  const results: SubstepResult[] = [];
  for (const step of OKX_SUBSTEPS) {
    results.push(await runSingleSubstep(step, options));
  }
  return results;
}

async function runSingleSubstep(
  step: OkxSubstep,
  options: { skip: boolean; timeoutMs?: number }
): Promise<SubstepResult> {
  const command = `npx ${step.args.filter((a) => a !== "--yes").join(" ")}`;
  if (options.skip) {
    return { name: step.name, command, status: "skipped", duration: 0 };
  }

  const start = Date.now();
  const timeoutMs = options.timeoutMs ?? 5 * 60 * 1000;
  return new Promise<SubstepResult>((resolve) => {
    const child = spawn("npx", [...step.args], { stdio: "inherit" });
    const timer = setTimeout(() => {
      child.kill("SIGTERM");
      resolve({
        name: step.name,
        command,
        status: "failed",
        error: `${step.name} install timed out`,
        duration: Date.now() - start
      });
    }, timeoutMs);

    child.on("error", (error: Error) => {
      clearTimeout(timer);
      resolve({
        name: step.name,
        command,
        status: "failed",
        error: error.message,
        duration: Date.now() - start
      });
    });

    child.on("exit", (code: number | null) => {
      clearTimeout(timer);
      resolve({
        name: step.name,
        command,
        status: code === 0 ? "success" : "failed",
        exitCode: code ?? 1,
        duration: Date.now() - start,
        error: code === 0 ? undefined : `exit code ${code ?? 1}`
      });
    });
  });
}

export function aggregateSubstep(results: SubstepResult[]): SubstepResult {
  if (results.length === 0) {
    return { name: "okx-skills", command: "", status: "skipped", duration: 0 };
  }
  const status: SubstepResult["status"] = results.some((r) => r.status === "failed")
    ? "failed"
    : results.every((r) => r.status === "skipped")
      ? "skipped"
      : "success";
  const command = results.map((r) => r.command).join(" && ");
  const duration = results.reduce((sum, r) => sum + r.duration, 0);
  const errors = results.filter((r) => r.error).map((r) => `${r.name}: ${r.error}`);
  return {
    name: "okx-skills",
    command,
    status,
    duration,
    error: errors.length > 0 ? errors.join("; ") : undefined
  };
}
