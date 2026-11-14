import { randomUUID } from "node:crypto";
import Link from "next/link";
import { submitPermitPilotFeedback } from "@/app/actions/permit-pilot";
import { requirePermitWorkspace } from "@/lib/server/permits";

export default async function PermitFeedbackPage({ params, searchParams }: {
  params: Promise<{ tenantId: string }>;
  searchParams: Promise<{ result?: string }>;
}) {
  const { tenantId } = await params;
  const { result } = await searchParams;
  await requirePermitWorkspace(tenantId);
  return <>
    <div className="page-heading"><Link href={`/workspaces/${tenantId}/permits`}>Back to permits</Link><h1>PermitDesk feedback</h1></div>
    {result === "saved" ? <p role="status">Thank you. Your feedback was sent privately to Cevanta.</p> : <form className="panel" action={submitPermitPilotFeedback.bind(null, tenantId)}>
      {result && <p role="alert">Feedback could not be saved. Check your entries and try again.</p>}
      <p>Tell us what worked and what got in your way. Feedback is optional. Leave out customer details and passwords.</p>
      <input type="hidden" name="receipt" value={randomUUID()} />
      <label>Feedback type
        <select name="category" defaultValue="Issue or friction">
          <option>What worked</option><option>Issue or friction</option><option>Suggestion</option><option>End-of-pilot review</option>
        </select>
      </label>
      <label>Overall rating (optional)
        <select name="rating"><option value="">No rating</option>{[1, 2, 3, 4, 5].map(rating => <option key={rating} value={rating}>{rating}/5</option>)}</select>
      </label>
      <label>What happened or what should change?<textarea name="message" required maxLength={3000} /></label>
      <label>Optional review<textarea name="review" maxLength={1500} /></label>
      <label><input type="checkbox" name="quote" /> Cevanta may quote my optional review publicly.</label>
      <button className="button">Send private feedback</button>
    </form>}
  </>;
}
