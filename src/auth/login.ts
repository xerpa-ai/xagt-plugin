import { loginWithDeviceCode } from "./device.js";
import { loginWithLoopback } from "./loopback.js";
import { loginWithPasteCode } from "./paste.js";
import type { SavedCredentials } from "./credentials.js";

export type AuthMode = "paste" | "loopback" | "device";

export async function runLogin(input: {
  authMode: AuthMode;
  baseUrl: string;
  frontendBase: string;
  version: string;
}): Promise<SavedCredentials> {
  if (input.authMode === "device") {
    return loginWithDeviceCode({ baseUrl: input.baseUrl, clientVersion: input.version });
  }
  if (input.authMode === "loopback") {
    return loginWithLoopback({
      baseUrl: input.baseUrl,
      clientVersion: input.version,
      openBrowser: true
    });
  }
  return loginWithPasteCode({
    baseUrl: input.baseUrl,
    frontendBase: input.frontendBase,
    clientVersion: input.version,
    openBrowser: true
  });
}
