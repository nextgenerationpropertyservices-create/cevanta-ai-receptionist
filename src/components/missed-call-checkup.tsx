"use client";

import { useState, type FormEvent } from "react";
import { missedCallCheckup } from "@/lib/missed-call-checkup";
import styles from "./missed-call-checkup.module.css";

export function MissedCallCheckup() {
  const [result, setResult] = useState<ReturnType<typeof missedCallCheckup> | null>(null);

  function calculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = event.currentTarget.elements;
    function count(id: string) {
      const field = fields.namedItem(id);
      return field instanceof HTMLInputElement ? field.valueAsNumber : NaN;
    }
    setResult(missedCallCheckup(count("missed"), count("returned"), count("booked")));
  }

  return <div className="free-tools-grid">
    <article>
      <h2>Enter your weekly totals</h2>
      <p>Use the same group of missed calls for all three numbers. Count each missed call once.</p>
      <form onSubmit={calculate} onChange={() => setResult(null)} className={styles.form}>
        <label>Calls missed<input id="missed" type="number" min="0" max="999999" step="1" required inputMode="numeric" placeholder="12"/></label>
        <label>Missed calls you returned<input id="returned" type="number" min="0" max="999999" step="1" required inputMode="numeric" placeholder="7"/></label>
        <label>Jobs booked from those callbacks<input id="booked" type="number" min="0" max="999999" step="1" required inputMode="numeric" placeholder="2"/></label>
        <button className="button" type="submit">See my results</button>
      </form>
    </article>
    <article aria-live="polite" aria-atomic="true">
      <h2>Your results</h2>
      {!result ? <p>Enter your totals to see how many missed calls still need a callback.</p>
        : result.error ? <p role="alert">{result.error}</p>
        : <>
          <p><strong>{result.outstanding}</strong> missed calls without a recorded callback.</p>
          <ul>
            <li>Callback rate · {result.callbackRate === null ? "No missed calls" : `${result.callbackRate}%`}</li>
            <li>Jobs booked per callback · {result.bookingRate === null ? "No callbacks yet" : `${result.bookingRate}%`}</li>
          </ul>
          <h3>Your next move</h3>
          <p>{result.outstanding > 0
            ? "Put each outstanding callback in one list. Assign an owner and a due time, starting with urgent requests."
            : result.callbackRate === null
              ? "Repeat the checkup next week so you can spot changes in call coverage."
              : "Keep tracking whether each callback turns into a booked job or needs another follow-up."}</p>
        </>}
    </article>
    <article>
      <h2>Take the callback tracker</h2>
      <p>Open the template in Excel or Google Sheets. It has a place for the request, assigned person, due time, and outcome.</p>
      <a className="button secondary" href="/callback-tracker.csv" download>Download tracker (CSV)</a>
    </article>
  </div>;
}
