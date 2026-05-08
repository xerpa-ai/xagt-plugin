import { execFile } from "node:child_process";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { exchangeLoopbackCode, initLoopbackAuth } from "./exchange.js";
import type { SavedCredentials } from "./credentials.js";

export async function loginWithPasteCode(input: {
  baseUrl: string;
  frontendBase: string;
  clientVersion: string;
  openBrowser: boolean;
}): Promise<SavedCredentials> {
  const redirectUri = `${input.frontendBase.replace(/\/$/, "")}/oauth/code/callback`;
  const init = await initLoopbackAuth({
    baseUrl: input.baseUrl,
    clientVersion: input.clientVersion,
    redirectUri
  });

  process.stdout.write("\n  Open this URL to log in to XAgent:\n\n");
  process.stdout.write(`    ${init.loginUrl}\n\n`);
  if (input.openBrowser) {
    process.stdout.write("  Opening your default browser...\n");
    await openBrowser(init.loginUrl).catch(() => undefined);
  }

  process.stdout.write("\n  After login, the page shows an authentication code.\n");
  process.stdout.write("  Click \"Copy Code\" and paste it below.\n\n");

  const pasted = await promptForCode();
  const { code, state } = parsePastedCode(pasted);
  if (state !== init.state) {
    throw new Error("state mismatch — the pasted code is from a different login session");
  }

  return exchangeLoopbackCode({
    baseUrl: input.baseUrl,
    sessionId: init.sessionId,
    state,
    code
  });
}

export function parsePastedCode(raw: string): { code: string; state: string } {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error("no code pasted");
  }
  const hash = trimmed.indexOf("#");
  if (hash === -1) {
    throw new Error("expected code#state — no '#' found in paste");
  }
  const code = trimmed.slice(0, hash);
  const state = trimmed.slice(hash + 1);
  if (!code || !state) {
    throw new Error("paste is missing code or state segment");
  }
  return { code, state };
}

async function promptForCode(): Promise<string> {
  const rl = createInterface({ input, output });
  try {
    const answer = await rl.question("  Paste code here: ");
    const trimmed = answer.trim();
    if (!trimmed) {
      throw new Error("no code pasted");
    }
    return trimmed;
  } finally {
    rl.close();
  }
}

async function openBrowser(url: string): Promise<void> {
  let cmd = "xdg-open";
  let args = [url];
  if (process.platform === "darwin") {
    cmd = "open";
  }
  if (process.platform === "win32") {
    cmd = "cmd";
    args = ["/c", "start", "", url];
  }
  await new Promise<void>((resolve, reject) => {
    execFile(cmd, args, (err) => (err ? reject(err) : resolve()));
  });
}
