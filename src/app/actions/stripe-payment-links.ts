"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import type { ActionState } from "@/lib/server/action-state";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { requireMembership } from "@/lib/server/authorization";

const paymentRequestSchema = z.object({
  operatorTenantId: z.uuid(),
  clientTenantId: z.uuid(),
  paymentType: z.enum(["setup", "monthly"]),
  setupAmountDollars: z.string().trim(),
  monthlyAmountDollars: z.string().trim(),
  requestId: z.uuid(),
});

const stripeObjectSchema = z.object({ id: z.string().min(1) });
const stripeLinkSchema = z.object({ url: z.string().url() });

function parseUsdAmount(value: string) {
  if (!/^\d{1,7}(?:\.\d{1,2})?$/.test(value)) return null;
  const amount = Math.round(Number(value) * 100);
  return Number.isSafeInteger(amount) && amount >= 100 && amount <= 100_000_000 ? amount : null;
}

async function stripeRequest(path: string, body: URLSearchParams, idempotencyKey: string) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return { ok: false as const, message: "Add STRIPE_SECRET_KEY to the server environment before creating payment links." };
  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Idempotency-Key": idempotencyKey,
    },
    body,
    cache: "no-store",
  });
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    console.warn("[stripe.paymentLink]", { path, status: response.status });
    return { ok: false as const, message: "Stripe could not create this payment request. Check the Stripe account and try again." };
  }
  return { ok: true as const, payload };
}

export async function createStripePaymentRequest(_previous: ActionState, form: FormData): Promise<ActionState> {
  const parsed = paymentRequestSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { status: "error", message: "Choose a client and payment type before creating the request." };
  if (!isSupabaseConfigured()) return { status: "error", message: "Supabase is not configured." };
  const amount = parsed.data.paymentType === "setup" ? parseUsdAmount(parsed.data.setupAmountDollars) : parseUsdAmount(parsed.data.monthlyAmountDollars);
  if (amount === null) return { status: "error", message: "Enter a valid amount from $1.00 to $1,000,000.00." };

  let destination: string | null = null;
  try {
    const { client, role } = await requireMembership(parsed.data.operatorTenantId, ["owner", "admin"]);
    const operator = await client.from("tenants").select("id,account_type").eq("id", parsed.data.operatorTenantId).single();
    if (operator.error || operator.data?.account_type !== "internal") return { status: "error", message: "Only the internal Cevanta owner dashboard can create payment requests." };

    const relation = await client.from("managed_client_workspaces").select("client_tenant_id").eq("operator_tenant_id", parsed.data.operatorTenantId).eq("client_tenant_id", parsed.data.clientTenantId).maybeSingle();
    if (relation.error || !relation.data) return { status: "error", message: "That client is not connected to this Cevanta workspace." };

    const tenant = await client.from("tenants").select("name").eq("id", parsed.data.clientTenantId).single();
    if (tenant.error || !tenant.data) return { status: "error", message: "The client workspace could not be found." };

    const label = parsed.data.paymentType === "setup" ? "Setup fee" : "Managed pilot — first month";
    const suffix = parsed.data.paymentType === "setup" ? "setup" : "monthly";
    const requestKey = parsed.data.requestId;

    const productBody = new URLSearchParams({
      name: `Cevanta ${label} — ${tenant.data.name}`,
      "metadata[tenant_id]": parsed.data.clientTenantId,
      "metadata[created_by_role]": role,
    });
    const productResult = await stripeRequest("products", productBody, `${requestKey}-product-${suffix}`);
    if (!productResult.ok) return { status: "error", message: productResult.message };
    const product = stripeObjectSchema.safeParse(productResult.payload);
    if (!product.success) return { status: "error", message: "Stripe returned an unexpected product response." };

    const priceBody = new URLSearchParams({ currency: "usd", unit_amount: String(amount), product: product.data.id });
    if (parsed.data.paymentType === "monthly") priceBody.set("recurring[interval]", "month");
    const priceResult = await stripeRequest("prices", priceBody, `${requestKey}-price-${suffix}`);
    if (!priceResult.ok) return { status: "error", message: priceResult.message };
    const price = stripeObjectSchema.safeParse(priceResult.payload);
    if (!price.success) return { status: "error", message: "Stripe returned an unexpected price response." };

    const linkBody = new URLSearchParams({
      "line_items[0][price]": price.data.id,
      "line_items[0][quantity]": "1",
      "metadata[tenant_id]": parsed.data.clientTenantId,
      "metadata[payment_type]": parsed.data.paymentType,
    });
    const linkResult = await stripeRequest("payment_links", linkBody, `${requestKey}-link-${suffix}`);
    if (!linkResult.ok) return { status: "error", message: linkResult.message };
    const link = stripeLinkSchema.safeParse(linkResult.payload);
    if (!link.success || !/^https:\/\/(buy\.stripe\.com|checkout\.stripe\.com)\//.test(link.data.url)) return { status: "error", message: "Stripe returned an unexpected payment-link response." };

    destination = `/workspaces/${parsed.data.operatorTenantId}/clients?payment_link=${encodeURIComponent(link.data.url)}&payment_client=${encodeURIComponent(tenant.data.name)}&payment_type=${encodeURIComponent(label)}&payment_amount=${encodeURIComponent((amount / 100).toFixed(2))}`;
  } catch {
    console.warn("[stripe.paymentLink]", { category: "unavailable" });
    return { status: "error", message: "Payment request creation is temporarily unavailable. Please try again." };
  }
  if (destination) redirect(destination);
  return { status: "error", message: "Payment request creation is temporarily unavailable. Please try again." };
}
