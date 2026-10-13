"use client";

export default function GoLiveError({ reset }: { reset: () => void }) {
  return <div className="panel"><span className="eyebrow">GO LIVE</span><h1>We could not load the activation center.</h1><p>Try again, or return to Integrations and Launch to continue setup.</p><button className="button" type="button" onClick={() => reset()}>Try again</button></div>;
}
