import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "@/components/ui";
import { MissedCallCheckup } from "@/components/missed-call-checkup";

export const metadata: Metadata = {
  title: "Free Missed Call Checkup",
  description: "Find out how many missed service calls went without a callback and download a free tracker for your team.",
};

const requestSubject = encodeURIComponent("Cevanta after-hours setup request");
const requestBody = encodeURIComponent("Hi Cevanta, I’d like to set up after-hours call coverage.\n\nBusiness name:\nTrade:\nTypical after-hours coverage needed:\n");

export default function MissedCallCheckupPage() {
  return <main id="main" className="free-tools-page">
    <header className="free-tools-nav"><Brand/><Link href="/free-tools">Explore free tools</Link></header>
    <section className="free-tools-section" aria-labelledby="checkup-title">
      <div className="free-tools-heading">
        <span className="eyebrow">FREE TOOL FOR SERVICE BUSINESSES</span>
        <h1 id="checkup-title">Missed Call Checkup</h1>
        <p>See what happened to the calls you missed in the past seven days. Get an action you can take today and a free callback tracker.</p>
        <small>Your totals stay in this browser tab. No account or customer details needed.</small>
      </div>
      <MissedCallCheckup/>
    </section>
    <section className="free-tools-section" aria-labelledby="checkup-next">
      <div className="free-tools-heading"><h2 id="checkup-next">Keep up with the next call</h2>
        <p>Organize callbacks in a free Cevanta workspace, or email us about setting up after-hours answering.</p>
      </div>
      <div className="button-row">
        <Link className="button" href="/sign-up">Create a free workspace</Link>
        <a className="button secondary" href={`mailto:nextgenerationpropertyservices@gmail.com?subject=${requestSubject}&body=${requestBody}`}>Email an after-hours setup request</a>
      </div>
    </section>
  </main>;
}
