import { headers } from "next/headers";
import { Brand } from "@/components/ui";
import { InvitationBootstrap } from "./invitation-bootstrap";
import { InvitationBootstrapStatus } from "./invitation-bootstrap-status";

export const dynamic = "force-dynamic";

function isValidInvitationNonce(value: string | null): value is string {
  if (!value || value.length > 128 || !/^[A-Za-z0-9+/]+={0,2}$/.test(value)) return false;
  try {
    const decoded = Buffer.from(value, "base64");
    return decoded.byteLength >= 16 && decoded.toString("base64") === value;
  } catch {
    return false;
  }
}

export default async function InvitePage() {
  const nonce = (await headers()).get("x-nonce");
  const validNonce = isValidInvitationNonce(nonce) ? nonce : null;

  return (
    <main id="main" className="auth-page">
      {validNonce ? <InvitationBootstrap nonce={validNonce} /> : null}
      <Brand />
      <InvitationBootstrapStatus unavailable={!validNonce} />
    </main>
  );
}


