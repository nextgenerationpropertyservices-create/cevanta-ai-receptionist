"use client";

import { useMemo, useState } from "react";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

type RoiCalculatorProps = {
  capturedLeadCount: number;
  initialAverageJobValue?: number;
  initialCloseRate?: number;
  initialMonthlyCost?: number;
};

type RoiInputs = {
  averageJobValue: number;
  closeRate: number;
  monthlyCost: number;
};

function safeNumber(value: unknown, fallback: number, min: number, max: number) {
  const numberValue = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numberValue)) return fallback;
  return Math.min(max, Math.max(min, numberValue));
}

export function RoiCalculator({
  capturedLeadCount,
  initialAverageJobValue = 850,
  initialCloseRate = 35,
  initialMonthlyCost = 297,
}: RoiCalculatorProps) {
  const defaults: RoiInputs = useMemo(() => ({
    averageJobValue: initialAverageJobValue,
    closeRate: initialCloseRate,
    monthlyCost: initialMonthlyCost,
  }), [initialAverageJobValue, initialCloseRate, initialMonthlyCost]);
  const [inputs, setInputs] = useState<RoiInputs>(defaults);

  const recoveredEstimate = Math.max(0, Math.round(capturedLeadCount * inputs.averageJobValue * (inputs.closeRate / 100)));
  const netEstimate = recoveredEstimate - inputs.monthlyCost;

  const update = (key: keyof RoiInputs, min: number, max: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputs(current => ({ ...current, [key]: safeNumber(event.currentTarget.value, current[key], min, max) }));
  };

  return (
    <div className="roi-card roi-editor">
      <span className="eyebrow">RECOVERED LOSS SNAPSHOT</span>
      <strong>{money.format(recoveredEstimate)}</strong>
      <p>
        Estimated recovered revenue from {capturedLeadCount} AI-captured lead{capturedLeadCount === 1 ? "" : "s"}.
        Adjust the numbers below to match your business.
      </p>
      <div className="roi-fields" aria-label="Editable ROI assumptions">
        <label>
          <span>Average job value</span>
          <input type="number" min="0" max="100000" step="50" value={inputs.averageJobValue} onChange={update("averageJobValue", 0, 100000)} />
        </label>
        <label>
          <span>Close rate %</span>
          <input type="number" min="0" max="100" step="1" value={inputs.closeRate} onChange={update("closeRate", 0, 100)} />
        </label>
        <label>
          <span>Monthly cost</span>
          <input type="number" min="0" max="10000" step="25" value={inputs.monthlyCost} onChange={update("monthlyCost", 0, 10000)} />
        </label>
      </div>
      <small>
        These numbers update this estimate on your screen only. {netEstimate >= 0
          ? `${money.format(netEstimate)} estimated after ${money.format(inputs.monthlyCost)} monthly pilot cost.`
          : `Needs ${money.format(Math.abs(netEstimate))} more recovered value to cover the monthly pilot.`} This is an estimator only.
      </small>
    </div>
  );
}
