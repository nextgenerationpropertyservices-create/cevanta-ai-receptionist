const baseUrlArgument = process.argv[2];

if (!baseUrlArgument) {
  console.error("Usage: node scripts/verify-invitation-response-policy.mjs <base-url>");
  process.exit(2);
}

const baseUrl = new URL(baseUrlArgument);
const expectedPrivacyHeaders = {
  "cache-control": "private, no-store, max-age=0",
  "cdn-cache-control": "no-store",
  "vercel-cdn-cache-control": "no-store",
  "pragma": "no-cache",
  expires: "0",
  "referrer-policy": "no-referrer",
  "x-robots-tag": "noindex, nofollow, noarchive",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "permissions-policy": "camera=(), microphone=(), geolocation=()",
};
const apiCsp = "default-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; sandbox";
const sharedCacheDirective = /(?:^|[,;\s])(?:public|s-maxage|stale-while-revalidate|immutable)(?:[=,;\s]|$)/i;

function fail(message) {
  throw new Error(message);
}

function verifyPrivacyHeaders(response, label) {
  for (const [name, expected] of Object.entries(expectedPrivacyHeaders)) {
    const actual = response.headers.get(name);
    if (actual !== expected) fail(`${label}: ${name} was ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`);
  }

  const cacheControl = response.headers.get("cache-control") ?? "";
  if (sharedCacheDirective.test(cacheControl)) fail(`${label}: cache-control permits shared or persistent caching`);
  if (response.headers.get("access-control-allow-origin")) fail(`${label}: CORS allow-origin must not be emitted`);
}

function verifyDocumentCsp(response, label) {
  const csp = response.headers.get("content-security-policy") ?? "";
  const nonce = csp.match(/(?:^|;\s*)script-src[^;]*'nonce-([^']+)'/)?.[1];
  if (!nonce) fail(`${label}: script nonce is missing`);
  const nonceBytes = Buffer.from(nonce, "base64");
  if (nonceBytes.length < 16 || nonceBytes.toString("base64") !== nonce) fail(`${label}: script nonce is not canonical base64 with at least 128 bits`);

  const scriptDirective = csp.match(/(?:^|;\s*)script-src\s+([^;]+)/)?.[1] ?? "";
  if (scriptDirective.includes("'unsafe-inline'")) fail(`${label}: production script-src contains unsafe-inline`);
  if (!scriptDirective.includes("'strict-dynamic'")) fail(`${label}: production script-src is missing strict-dynamic`);
  if (/https?:\/\//i.test(csp)) fail(`${label}: CSP contains a third-party origin`);
  return csp;
}

async function fetchChecked(path, init, { allowServerError = false } = {}) {
  const response = await fetch(new URL(path, baseUrl), { ...init, redirect: "manual" });
  if (!allowServerError && response.status >= 500) fail(`${path}: server returned ${response.status}`);
  return response;
}

try {
  const invite = await fetchChecked("/invite");
  verifyPrivacyHeaders(invite, "/invite");
  const inviteCsp = verifyDocumentCsp(invite, "/invite");

  const nested = await fetchChecked("/invite/continue");
  verifyPrivacyHeaders(nested, "/invite/continue");
  const nestedCsp = verifyDocumentCsp(nested, "/invite/continue");
  if (nestedCsp === inviteCsp) fail("Invitation document requests reused the same CSP nonce");

  const api = await fetchChecked("/api/invitations/continuations", {
    method: "POST",
    headers: { "content-type": "application/json", origin: baseUrl.origin },
    body: "{}",
  }, { allowServerError: true });
  verifyPrivacyHeaders(api, "/api/invitations/continuations");
  if (api.headers.get("content-security-policy") !== apiCsp) fail("Exchange API CSP does not match the fixed deny-all policy");

  console.log(JSON.stringify({
    status: "pass",
    documents: [invite.status, nested.status],
    exchange: api.status,
  }));
} catch (error) {
  console.error(error instanceof Error ? error.message : "Invitation response verification failed");
  process.exit(1);
}
