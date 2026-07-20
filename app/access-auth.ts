import { createHash, timingSafeEqual } from "node:crypto";

export const accessCookieName = "jotform_quote_access";

export function configuredAccessPassword() {
  return process.env.QUOTE_ACCESS_PASSWORD?.trim() || "";
}

export function isAccessProtectionEnabled() {
  return configuredAccessPassword().length > 0;
}

export function accessToken() {
  return createHash("sha256")
    .update(`jotform-quote-access:${configuredAccessPassword()}`)
    .digest("hex");
}

export function isValidAccessPassword(value: string) {
  return safeEqual(value, configuredAccessPassword());
}

export function isValidAccessToken(value = "") {
  return safeEqual(value, accessToken());
}

function safeEqual(left: string, right: string) {
  if (!left || !right) return false;

  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) return false;

  return timingSafeEqual(leftBuffer, rightBuffer);
}
