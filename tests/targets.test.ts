import { describe, expect, it } from "vitest";
import { planInstallTargets } from "../src/targets.js";

describe("targets", () => {
  it("expands all to every supported target", () => {
    expect(planInstallTargets("all").map((item) => item.id)).toEqual([
      "cursor",
      "claude-code",
      "codex",
      "opencode",
      "generic"
    ]);
  });

  it("places codex skill under ~/.codex and opencode under ~/.config/opencode", () => {
    const codex = planInstallTargets("codex")[0];
    const opencode = planInstallTargets("opencode")[0];
    expect(codex.skillDirectory).toBe(".codex/skills/xagt-setup");
    expect(opencode.skillDirectory).toBe(".config/opencode/skills/xagt-setup");
  });

  it("does not include openclaw paths", () => {
    const directories = planInstallTargets("all").map((item) => item.skillDirectory);
    expect(directories.some((dir) => dir.includes(".openclaw"))).toBe(false);
  });
});
