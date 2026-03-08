"use client";

import { useMemo, useState } from "react";

type Row = {
  probability: string;
  payoff: string;
};

type Decision = {
  label: string;
  rows: [Row, Row, Row];
};

type ComputedRow = {
  probability: number;
  payoff: number;
  weighted: number;
};

type DecisionResult = {
  label: string;
  expectedValue: number;
  probabilitySum: number;
  normalized: boolean;
  rows: ComputedRow[];
};

const DEFAULT_DECISION_A: Decision = {
  label: "Internship",
  rows: [
    { probability: "25", payoff: "12000" },
    { probability: "50", payoff: "7000" },
    { probability: "25", payoff: "2000" },
  ],
};

const DEFAULT_DECISION_B: Decision = {
  label: "Investment",
  rows: [
    { probability: "20", payoff: "20000" },
    { probability: "45", payoff: "8000" },
    { probability: "35", payoff: "-3000" },
  ],
};

function parseNumber(value: string): number {
  const normalized = value.trim().replace(/,/g, "");
  if (!normalized) return Number.NaN;
  return Number(normalized);
}

function computeDecision(decision: Decision): DecisionResult | null {
  const parsed = decision.rows.map((row) => ({
    probability: parseNumber(row.probability),
    payoff: parseNumber(row.payoff),
  }));

  if (parsed.some((row) => !Number.isFinite(row.probability) || !Number.isFinite(row.payoff))) {
    return null;
  }

  if (parsed.some((row) => row.probability < 0 || row.probability > 100)) {
    return null;
  }

  const probabilitySum = parsed.reduce((sum, row) => sum + row.probability, 0);
  if (probabilitySum <= 0) {
    return null;
  }

  const shouldNormalize = Math.abs(probabilitySum - 100) > 0.001;
  const rows = parsed.map((row) => {
    const probability = shouldNormalize ? (row.probability / probabilitySum) * 100 : row.probability;
    const weighted = (probability / 100) * row.payoff;

    return {
      probability,
      payoff: row.payoff,
      weighted,
    };
  });

  const expectedValue = rows.reduce((sum, row) => sum + row.weighted, 0);

  return {
    label: decision.label.trim() || "Unnamed decision",
    expectedValue,
    probabilitySum,
    normalized: shouldNormalize,
    rows,
  };
}

function currency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function percent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export default function DecisionModelingPage() {
  const [decisionA, setDecisionA] = useState<Decision>(DEFAULT_DECISION_A);
  const [decisionB, setDecisionB] = useState<Decision>(DEFAULT_DECISION_B);

  const resultA = useMemo(() => computeDecision(decisionA), [decisionA]);
  const resultB = useMemo(() => computeDecision(decisionB), [decisionB]);

  const bothReady = resultA !== null && resultB !== null;
  const difference = resultA && resultB ? resultA.expectedValue - resultB.expectedValue : 0;
  const close = resultA && resultB ? Math.abs(difference) < 500 : false;

  function updateDecision(
    key: "A" | "B",
    rowIndex: number,
    field: "probability" | "payoff",
    value: string,
  ) {
    const setter = key === "A" ? setDecisionA : setDecisionB;

    setter((previous) => {
      const nextRows = previous.rows.map((row, index) => {
        if (index !== rowIndex) return row;
        return {
          ...row,
          [field]: value,
        };
      }) as [Row, Row, Row];

      return {
        ...previous,
        rows: nextRows,
      };
    });
  }

  function updateLabel(key: "A" | "B", value: string) {
    if (key === "A") {
      setDecisionA((previous) => ({ ...previous, label: value }));
      return;
    }

    setDecisionB((previous) => ({ ...previous, label: value }));
  }

  return (
    <main className="decisionPage">
      <section className="heading">
        <h1>Decision Modeling Tool</h1>
        <p>
          Compare two options with three scenarios each. Match each probability with its exact payoff (P1 →
          Payoff1, P2 → Payoff2, P3 → Payoff3), and the tool calculates expected value automatically.
        </p>
      </section>

      <section className="workspace">
        <div className="comparisonGrid">
          <DecisionCard
            title="Decision A"
            decision={decisionA}
            result={resultA}
            onLabelChange={(value) => updateLabel("A", value)}
            onFieldChange={(index, field, value) => updateDecision("A", index, field, value)}
          />

          <DecisionCard
            title="Decision B"
            decision={decisionB}
            result={resultB}
            onLabelChange={(value) => updateLabel("B", value)}
            onFieldChange={(index, field, value) => updateDecision("B", index, field, value)}
          />
        </div>

        <aside className="examplePanel">
          <h2>How to fill this out</h2>
          <ul>
            <li>
              <strong>Probability 1 / Payoff 1:</strong> best-case chance and outcome.
            </li>
            <li>
              <strong>Probability 2 / Payoff 2:</strong> most likely scenario.
            </li>
            <li>
              <strong>Probability 3 / Payoff 3:</strong> worst-case scenario.
            </li>
          </ul>
          <p>
            Example: Internship with 25% chance of <strong>$12,000</strong>, 50% chance of <strong>$7,000</strong>,
            and 25% chance of <strong>$2,000</strong> gives an expected value of about <strong>$7,000</strong>.
          </p>
        </aside>
      </section>

      <section className="conclusion">
        <h2>Conclusion</h2>
        {!bothReady && (
          <p>
            Add valid numeric probabilities (0-100) and payoffs for both options to see a recommendation.
          </p>
        )}

        {bothReady && (
          <>
            {close ? (
              <p>
                These options are very close. <strong>{resultA.label}</strong> and <strong>{resultB.label}</strong>
                are within {currency(Math.abs(difference))} expected value of each other, so non-financial factors
                may matter more.
              </p>
            ) : difference > 0 ? (
              <p>
                <strong>{resultA.label}</strong> is favored because its expected value is higher by
                <strong> {currency(Math.abs(difference))}</strong>.
              </p>
            ) : (
              <p>
                <strong>{resultB.label}</strong> is favored because its expected value is higher by
                <strong> {currency(Math.abs(difference))}</strong>.
              </p>
            )}

            <div className="totals">
              <div>
                <span>{resultA.label}</span>
                <strong>{currency(resultA.expectedValue)}</strong>
              </div>
              <div>
                <span>{resultB.label}</span>
                <strong>{currency(resultB.expectedValue)}</strong>
              </div>
            </div>
          </>
        )}
      </section>

      <style jsx>{`
        .decisionPage {
          max-width: 1120px;
          margin: 0 auto;
          padding: 2rem 1.25rem 3rem;
          display: grid;
          gap: 1.5rem;
        }

        .heading {
          background: #ffffff;
          border: 1px solid #e8e8e8;
          border-radius: 16px;
          padding: 1.5rem;
        }

        .heading h1 {
          margin: 0 0 0.5rem;
          font-size: clamp(1.8rem, 2.5vw, 2.4rem);
        }

        .heading p {
          margin: 0;
          color: #3d4350;
          max-width: 80ch;
        }

        .workspace {
          display: grid;
          gap: 1rem;
          grid-template-columns: 1fr;
        }

        .comparisonGrid {
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(1, minmax(0, 1fr));
        }

        .examplePanel {
          border: 1px solid #e8e8e8;
          border-radius: 16px;
          background: #fffdf8;
          padding: 1.2rem;
        }

        .examplePanel h2 {
          margin: 0 0 0.75rem;
          font-size: 1.1rem;
        }

        .examplePanel ul {
          margin: 0 0 0.75rem;
          padding-left: 1.1rem;
          display: grid;
          gap: 0.35rem;
          color: #4a5160;
        }

        .examplePanel p {
          margin: 0;
          color: #343b49;
        }

        .conclusion {
          background: #111827;
          color: #f9fafb;
          border-radius: 16px;
          padding: 1.25rem;
        }

        .conclusion h2 {
          margin: 0 0 0.75rem;
          font-size: 1.2rem;
        }

        .conclusion p {
          margin: 0;
          color: #e8ebf3;
        }

        .totals {
          margin-top: 1rem;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.75rem;
        }

        .totals div {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 12px;
          padding: 0.75rem;
          display: grid;
          gap: 0.35rem;
        }

        .totals span {
          font-size: 0.9rem;
          color: #d1d8e8;
        }

        .totals strong {
          font-size: 1.15rem;
        }

        @media (min-width: 1000px) {
          .workspace {
            grid-template-columns: 2.2fr 1fr;
            align-items: start;
          }

          .comparisonGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
      `}</style>
    </main>
  );
}

type DecisionCardProps = {
  title: string;
  decision: Decision;
  result: DecisionResult | null;
  onLabelChange: (value: string) => void;
  onFieldChange: (index: number, field: "probability" | "payoff", value: string) => void;
};

function DecisionCard({
  title,
  decision,
  result,
  onLabelChange,
  onFieldChange,
}: DecisionCardProps) {
  return (
    <article className="card">
      <header className="cardHeader">
        <p>{title}</p>
        <label>
          Label
          <input
            type="text"
            value={decision.label}
            onChange={(event) => onLabelChange(event.target.value)}
            placeholder={title === "Decision A" ? "Internship" : "Investment"}
          />
        </label>
      </header>

      <div className="tableHeader">
        <span>Scenario</span>
        <span>Probability (%)</span>
        <span>Payoff ($)</span>
      </div>

      {decision.rows.map((row, index) => (
        <div className="tableRow" key={`${title}-${index}`}>
          <div className="scenarioLabel">
            <strong>{index + 1}</strong>
            <small>{index === 0 ? "Best-case" : index === 1 ? "Expected" : "Worst-case"}</small>
          </div>

          <input
            type="number"
            inputMode="decimal"
            value={row.probability}
            onChange={(event) => onFieldChange(index, "probability", event.target.value)}
            placeholder={index === 0 ? "Best-case chance" : index === 1 ? "Likely chance" : "Worst-case chance"}
            min={0}
            max={100}
            step="any"
          />

          <input
            type="number"
            inputMode="decimal"
            value={row.payoff}
            onChange={(event) => onFieldChange(index, "payoff", event.target.value)}
            placeholder={index === 0 ? "Best-case outcome" : index === 1 ? "Most likely outcome" : "Worst-case outcome"}
            step="any"
          />
        </div>
      ))}

      <footer className="cardFooter">
        {!result ? (
          <p className="error">Enter valid numbers. Probabilities must be between 0 and 100.</p>
        ) : (
          <>
            <div className="evLine">
              <span>Expected value</span>
              <strong>{currency(result.expectedValue)}</strong>
            </div>
            <div className="sumLine">
              <span>Probability sum</span>
              <span>{percent(result.probabilitySum)}</span>
            </div>
            {result.normalized && (
              <p className="hint">
                Probabilities were normalized to 100% for calculation (to avoid broken math and preserve relative
                weighting).
              </p>
            )}
          </>
        )}
      </footer>

      <style jsx>{`
        .card {
          border: 1px solid #e4e4e7;
          border-radius: 16px;
          background: white;
          padding: 1rem;
          display: grid;
          gap: 0.75rem;
          height: 100%;
        }

        .cardHeader {
          display: grid;
          gap: 0.55rem;
        }

        .cardHeader p {
          margin: 0;
          font-size: 0.84rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #5f6675;
        }

        label {
          display: grid;
          gap: 0.3rem;
          font-size: 0.86rem;
          color: #4b5565;
        }

        input {
          width: 100%;
          border: 1px solid #d8dbe2;
          border-radius: 10px;
          padding: 0.6rem 0.7rem;
          font-size: 0.95rem;
          background: #fff;
        }

        input:focus {
          outline: 2px solid #c2d2ff;
          outline-offset: 1px;
          border-color: #7f9cff;
        }

        .tableHeader,
        .tableRow {
          display: grid;
          grid-template-columns: 0.9fr 1fr 1fr;
          gap: 0.5rem;
          align-items: center;
        }

        .tableHeader {
          font-size: 0.8rem;
          color: #5f6675;
          font-weight: 600;
        }

        .scenarioLabel {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
        }

        .scenarioLabel strong {
          font-size: 1rem;
        }

        .scenarioLabel small {
          color: #687082;
        }

        .cardFooter {
          border-top: 1px dashed #e2e4ea;
          margin-top: 0.2rem;
          padding-top: 0.7rem;
          display: grid;
          gap: 0.4rem;
        }

        .evLine,
        .sumLine {
          display: flex;
          justify-content: space-between;
          gap: 0.6rem;
          color: #2e3543;
        }

        .evLine strong {
          font-size: 1.05rem;
        }

        .hint {
          margin: 0.1rem 0 0;
          font-size: 0.8rem;
          color: #5b6476;
        }

        .error {
          margin: 0;
          color: #b3261e;
          font-size: 0.9rem;
        }
      `}</style>
    </article>
  );
}
