"use client";

import { useActionState, useEffect, useState } from "react";
import { createStripePaymentRequest, type StripePaymentRequestState } from "@/app/actions/stripe-payment-links";

type PaymentClient = { id: string; name: string; trade: string };
type PaymentRequest = NonNullable<StripePaymentRequestState["paymentRequest"]>;

const initialState: StripePaymentRequestState = { status: "idle", message: "" };

export function safeStripePaymentLink(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:"
      && url.port === ""
      && url.username === ""
      && url.password === ""
      && (url.hostname === "buy.stripe.com" || url.hostname === "checkout.stripe.com")
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

export function nextStripeRequestId(
  currentRequestId: string,
  state: StripePaymentRequestState,
  createRequestId: () => string = () => crypto.randomUUID(),
) {
  return state.status === "success" && state.paymentRequest?.requestId === currentRequestId
    ? createRequestId()
    : currentRequestId;
}

export function StripePaymentRequestResult({ paymentRequest }: { paymentRequest: PaymentRequest }) {
  const paymentLink = safeStripePaymentLink(paymentRequest.paymentLink);
  if (!paymentLink) return null;
  return <div className="notice payment-link-result" role="status">
    <strong>{paymentRequest.paymentLabel} for {paymentRequest.clientName} — {paymentRequest.paymentAmount} is ready.</strong>
    <a href={paymentLink} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">Open or copy the Stripe payment link ↗</a>
    <span className="small muted">Confirm payment in Stripe before enabling setup or live pilot work.</span>
  </div>;
}

export function StripePaymentRequestForm({ operatorTenantId, initialRequestId, clients }: { operatorTenantId: string; initialRequestId: string; clients: PaymentClient[] }) {
  const [requestId, setRequestId] = useState(initialRequestId);
  const [state, action, pending] = useActionState<StripePaymentRequestState, FormData>(createStripePaymentRequest, initialState);

  useEffect(() => {
    const nextRequestId = nextStripeRequestId(requestId, state);
    if (nextRequestId === requestId) return;
    const frame = window.requestAnimationFrame(() => setRequestId(nextRequestId));
    return () => window.cancelAnimationFrame(frame);
  }, [requestId, state]);

  return <>
    {state.paymentRequest && <StripePaymentRequestResult paymentRequest={state.paymentRequest} />}
    <form action={action} className="form">
      <fieldset disabled={pending}>
        <input type="hidden" name="operatorTenantId" value={operatorTenantId} />
        <input type="hidden" name="requestId" value={requestId} />
        <label className="field"><span>Client workspace <span className="required"> *</span></span><select name="clientTenantId" required defaultValue=""><option value="" disabled>Select a client</option>{clients.map(client => <option key={client.id} value={client.id}>{client.name} · {client.trade}</option>)}</select></label>
        <label className="field"><span>Payment request <span className="required"> *</span></span><select name="paymentType" required defaultValue="setup"><option value="setup">Setup fee</option><option value="monthly">Monthly pilot — first month</option></select></label>
        <div className="form-row">
          <label className="field"><span>Setup amount (USD) <span className="required"> *</span></span><input name="setupAmountDollars" defaultValue="497.00" required inputMode="decimal" /></label>
          <label className="field"><span>Monthly amount (USD) <span className="required"> *</span></span><input name="monthlyAmountDollars" defaultValue="297.00" required inputMode="decimal" /></label>
        </div>
        <div aria-live="polite" role={state.status === "error" ? "alert" : "status"}>{state.message && <p className={state.status === "error" ? "form-error" : "notice"}>{state.message}</p>}</div>
        <button className="button" disabled={pending || clients.length === 0} type="submit">{pending ? "Creating…" : "Create Stripe payment link"}<span aria-hidden="true">↗</span></button>
      </fieldset>
    </form>
  </>;
}
