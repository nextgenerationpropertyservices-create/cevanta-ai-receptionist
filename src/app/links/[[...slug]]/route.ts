// Branded share-link gateway. Porkbun may append the requested URI to /links.
// Destinations are fixed: never accept a caller-supplied redirect URL or host.
const appOrigin = "https://cevanta-ai-receptionist.vercel.app";
const destinations = new Map([
  ["", "https://cevanta.base44.app/"],
  ["freetools", `${appOrigin}/free-tools`],
  ["free-tools", `${appOrigin}/free-tools`],
  ["checkup", `${appOrigin}/missed-call-checkup`],
  ["missed-call-checkup", `${appOrigin}/missed-call-checkup`],
  ["demo", `${appOrigin}/demo-dashboard`],
  ["demo-dashboard", `${appOrigin}/demo-dashboard`],
  ["dashboard", `${appOrigin}/workspaces`],
  ["pricing", "https://cevanta.base44.app/pricing"],
  ["how-it-works", "https://cevanta.base44.app/how-it-works"],
  ["community", "https://www.facebook.com/groups/2285911738856668/"],
]);
const attributionKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
const headers = {
  "Cache-Control": "private, no-store, max-age=0",
  "CDN-Cache-Control": "no-store",
  "Referrer-Policy": "no-referrer",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "X-Content-Type-Options": "nosniff",
};
type Context = { params: Promise<{ slug?: string[] }> };

export async function GET(request: Request, context: Context) {
  const { slug = [] } = await context.params;
  const destination = slug.length <= 1 ? destinations.get(slug[0]?.toLowerCase() ?? "") : undefined;
  if (!destination) return new Response("This shortcut is not available.", { status: 404, headers });

  const target = new URL(destination);
  const query = new URL(request.url).searchParams;
  for (const key of attributionKeys) {
    const values = query.getAll(key);
    if (values.length === 1 && /^[a-zA-Z0-9_-]{1,100}$/.test(values[0])) target.searchParams.set(key, values[0]);
  }
  return new Response(null, { status: 302, headers: { ...headers, Location: target.toString() } });
}

export async function HEAD(request: Request, context: Context) {
  const response = await GET(request, context);
  return new Response(null, { status: response.status, headers: response.headers });
}
