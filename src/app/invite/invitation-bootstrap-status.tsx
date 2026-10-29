"use client";

import { useEffect, useState } from "react";

export function InvitationBootstrapStatus({ unavailable = false }: { unavailable?: boolean }) {
  const [clientUnavailable, setClientUnavailable] = useState(unavailable);

  useEffect(() => {
    if (unavailable) return;
    const root = document.documentElement;
    const update = () => setClientUnavailable(root.dataset.cevantaInviteState === "unavailable");
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ["data-cevanta-invite-state"] });
    return () => observer.disconnect();
  }, [unavailable]);

  return (
    <div className="auth-card panel" aria-labelledby="invitation-title">
      <span className="eyebrow">PRIVATE CLIENT ACCESS</span>
      <h1 id="invitation-title">
        {clientUnavailable ? "This invitation is unavailable." : "Preparing your secure invitation."}
      </h1>
      <p
        id="invitation-bootstrap-status"
        className={clientUnavailable ? "form-error" : undefined}
        role={clientUnavailable ? "alert" : "status"}
        aria-live="polite"
      >
        {clientUnavailable
          ? "Ask the Cevanta operator for a new private invitation, then open the new link in this browser."
          : "This should take only a moment. Keep this page open while Cevanta checks the invitation."}
      </p>
      <noscript>
        <p className="form-error" role="alert">
          JavaScript is required to open a private invitation. Enable JavaScript, then ask the Cevanta operator for a fresh link.
        </p>
      </noscript>
    </div>
  );
}
