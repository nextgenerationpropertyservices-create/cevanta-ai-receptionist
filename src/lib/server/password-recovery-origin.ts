import "server-only";

export function passwordRecoveryOrigin(): string {
  // Preview deployments need a stable callback origin even when APP_ORIGIN has
  // not yet been added to the Vercel project. Vercel provides the deployment
  // hostname through VERCEL_URL; production still requires an explicit,
  // reviewed APP_ORIGIN so a deployment cannot silently change callback hosts.
  const configured = process.env.APP_ORIGIN || (
    process.env.VERCEL_ENV !== "production" && process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : undefined
  );
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
