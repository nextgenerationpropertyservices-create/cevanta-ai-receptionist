export const invitationBootstrapSource = String.raw`
(() => {
  "use strict";
  const entryPath = "/invite";
  const continuePath = "/invite/continue";
  const exchangePath = "/api/invitations/continuations";
  const rawFragment = window.location.hash;
  window.history.replaceState(null, "", entryPath);
  delete document.documentElement.dataset.cevantaInviteState;

  const showUnavailable = () => {
    document.documentElement.dataset.cevantaInviteState = "unavailable";
  };

  const canonicalToken = (value) => {
    if (!/^[A-Za-z0-9_-]{43}$/.test(value)) return false;
    try {
      const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "=";
      const decoded = window.atob(padded);
      if (decoded.length !== 32) return false;
      const encoded = window.btoa(decoded).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
      return encoded === value;
    } catch {
      return false;
    }
  };

  let payload = null;
  try {
    if (!rawFragment.startsWith("#")) throw new Error("invalid");
    const fields = new URLSearchParams(rawFragment.slice(1));
    const keys = Array.from(fields.keys()).sort();
    if (keys.length !== 3 || keys[0] !== "r" || keys[1] !== "t" || keys[2] !== "v") throw new Error("invalid");
    const version = fields.get("v");
    const request = fields.get("r") || "";
    const token = fields.get("t") || "";
    if (version !== "1" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(request) || !canonicalToken(token)) {
      throw new Error("invalid");
    }
    payload = { version: 1, request_id: request, token };
  } catch {
    showUnavailable();
    return;
  }

  const body = JSON.stringify(payload);
  if (new TextEncoder().encode(body).byteLength > 1024) {
    showUnavailable();
    return;
  }

  window.fetch(exchangePath, {
    method: "POST",
    credentials: "same-origin",
    cache: "no-store",
    redirect: "error",
    referrerPolicy: "no-referrer",
    headers: { "Content-Type": "application/json" },
    body,
  }).then(async (response) => {
    if (!response.ok) throw new Error("unavailable");
    const result = await response.json();
    if (!result || result.status !== "ready" || Object.keys(result).length !== 1) throw new Error("unavailable");
    window.location.replace(continuePath);
  }).catch(showUnavailable);
})();`;

export function InvitationBootstrap({ nonce }: { nonce: string }) {
  return <script nonce={nonce} dangerouslySetInnerHTML={{ __html: invitationBootstrapSource }} />;
}

