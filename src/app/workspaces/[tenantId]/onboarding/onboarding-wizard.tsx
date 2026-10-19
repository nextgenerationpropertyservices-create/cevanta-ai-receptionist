'use client';

import { createContext, useContext, useRef, useState, type ReactNode } from 'react';

export interface OnboardingWizardStep {
  id: string;
  label: string;
  helper: string;
  content: ReactNode;
}

type OnboardingWizardContextValue = { active: number; stepCount: number };
const OnboardingWizardContext = createContext<OnboardingWizardContextValue | null>(null);

export function useOnboardingWizard() {
  return useContext(OnboardingWizardContext);
}

export function OnboardingWizard({ steps }: { steps: OnboardingWizardStep[] }) {
  const [active, setActive] = useState(0);
  const wizardRef = useRef<HTMLElement>(null);
  const current = steps[active];
  if (!current) return null;
  function goTo(next: number) {
    setActive(next);
    window.requestAnimationFrame(() => wizardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  return <section ref={wizardRef} className="setup-wizard" aria-label="Guided workspace setup">
    <div className="setup-wizard-heading"><div><span className="eyebrow">STEP {active + 1} OF {steps.length}</span><h2>{current.label}</h2><p>{current.helper}</p></div><span className="setup-wizard-count">{active + 1}/{steps.length}</span></div>
    <div className="setup-wizard-progress" aria-label="Setup sections">{steps.map((step, index) => <span key={step.id} className={index === active ? 'active' : index < active ? 'complete' : ''}><span aria-hidden="true">{index < active ? '✓' : index + 1}</span><b>{step.label}</b></span>)}</div>
    <OnboardingWizardContext.Provider value={{ active, stepCount: steps.length }}>
      <div className="setup-wizard-content">{steps.map((step, index) => <div key={step.id} hidden={index !== active} aria-hidden={index !== active}>{step.content}</div>)}</div>
      <div className="setup-wizard-actions"><button className="button secondary" type="button" onClick={() => goTo(Math.max(0, active - 1))} disabled={active === 0}>← Back</button><span className="setup-wizard-tip">Save this section, then continue.</span>{active < steps.length - 1 ? <button className="button" type="button" onClick={() => goTo(Math.min(steps.length - 1, active + 1))}>Next section →</button> : <button className="button" type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Back to setup summary ↑</button>}</div>
    </OnboardingWizardContext.Provider>
  </section>;
}
