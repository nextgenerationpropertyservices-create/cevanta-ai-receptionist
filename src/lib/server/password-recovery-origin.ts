import "server-only";

export function passwordRecoveryOrigin(): string {
  const configured = process.env.APP_ORIGIN;
  if (!configured) {
    if (process.env.NODE_ENV === "development") return "http://127.0.0.1:3000";
    throw new Error("Recovery origin is unavailable.");
  }
  const url = new URL(configured);
  const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (url.username || url.password || url.pathname !== "/" || url.search || url.hash
    || !(url.protocol === "https:" || (process.env.NODE_ENV === "development" && loopback && url.protocol === "http:"))) {
    throw new Error("Recovery origin is invalid.");
  }
  return url.origin;
}
