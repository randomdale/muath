"use client";

import React, { useMemo, useState } from "react";

type ScenarioRow = {
  scenario: string;
  probability: string;
  payoff: string;
};

type OptionCardModel = {
  label: string;
  scenarios: ScenarioRow[];
};

type OptionCardProps = {
  optionKey: "A" | "B";
  accentClass: string;
  metricClass: string;
  value: OptionCardModel;
  onChange: (model: OptionCardModel) => void;
};

function toNum(val: string) {
  const n = Number(val);
  return Number.isFinite(n) ? n : 0;
}

function calcEV(rows: ScenarioRow[]) {
  return rows.reduce(
    (sum, row) => sum + toNum(row.probability) * toNum(row.payoff),
    0
  );
}

function calcProbSum(rows: ScenarioRow[]) {
  return rows.reduce((sum, row) => sum + toNum(row.probability), 0);
}

function getStatus(probSum: number) {
  if (probSum === 0) return "Empty";
  if (Math.abs(probSum - 1) < 0.01) return "Balanced";
  return "Needs adjusting";
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function CleanInput({
  value,
  onChange,
  placeholder,
  type = "text",
  className = "",
  inputMode,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
  inputMode?: "decimal" | "text" | "numeric";
}) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      type={type}
      inputMode={inputMode}
      autoComplete="off"
      spellCheck={false}
      className={cx(
        "h-9 w-full rounded-xl border border-neutral-200 bg-white px-3 text-[13px] text-neutral-800 outline-none transition",
        "placeholder:text-neutral-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100/70",
        className
      )}
    />
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
      {children}
    </div>
  );
}

function MetricBox({
  label,
  value,
  valueClassName = "",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-3 py-2.5">
      <div className="text-[9px] font-medium uppercase tracking-[0.14em] text-neutral-500">
        {label}
      </div>
      <div
        className={cx(
          "mt-1.5 text-base font-bold tracking-tight",
          valueClassName
        )}
      >
        {value}
      </div>
    </div>
  );
}

function ScenarioEditor({
  rows,
  onChange,
}: {
  rows: ScenarioRow[];
  onChange: (rows: ScenarioRow[]) => void;
}) {
  function updateRow(index: number, field: keyof ScenarioRow, nextValue: string) {
    onChange(
      rows.map((row, i) =>
        i === index ? { ...row, [field]: nextValue } : row
      )
    );
  }

  function addScenario() {
    onChange([...rows, { scenario: "", probability: "", payoff: "" }]);
  }

  function removeScenario(index: number) {
    if (rows.length <= 2) return;
    onChange(rows.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2">
      <div className="hidden px-1 md:grid md:grid-cols-[minmax(0,1.8fr)_78px_92px_34px] md:gap-2">
        <div className="text-[10px] font-medium text-neutral-500">Scenario</div>
        <div className="text-center text-[10px] font-medium text-neutral-500">
          Probability
        </div>
        <div className="text-center text-[10px] font-medium text-neutral-500">
          Payoff
        </div>
        <div />
      </div>

      {rows.map((row, i) => (
        <div
          key={i}
          className="rounded-2xl border border-neutral-200 bg-neutral-50 p-2"
        >
          <div className="grid grid-cols-1 gap-2 md:grid-cols-[minmax(0,1.8fr)_78px_92px_34px] md:items-center">
            <CleanInput
              value={row.scenario}
              onChange={(v) => updateRow(i, "scenario", v)}
              placeholder={
                i === 0 ? "Upside" : i === 1 ? "Downside" : "Custom scenario"
              }
            />

            <CleanInput
              value={row.probability}
              onChange={(v) => updateRow(i, "probability", v)}
              inputMode="decimal"
              placeholder="0.50"
              className="text-center"
            />

            <CleanInput
              value={row.payoff}
              onChange={(v) => updateRow(i, "payoff", v)}
              inputMode="decimal"
              placeholder="75000"
              className="text-center"
            />

            <button
              type="button"
              onClick={() => removeScenario(i)}
              disabled={rows.length <= 2}
              className="h-9 w-full rounded-xl border border-neutral-200 bg-white text-base font-bold text-neutral-500 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-35 md:w-8"
              aria-label="Remove scenario"
              title="Remove scenario"
            >
              −
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addScenario}
        className="inline-flex h-9 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-4 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
      >
        + Add scenario
      </button>
    </div>
  );
}

function OptionCard({
  optionKey,
  accentClass,
  metricClass,
  value,
  onChange,
}: OptionCardProps) {
  const ev = useMemo(() => calcEV(value.scenarios), [value.scenarios]);
  const probSum = useMemo(() => calcProbSum(value.scenarios), [value.scenarios]);
  const status = getStatus(probSum);

  const statusClasses =
    status === "Balanced"
      ? "border-green-200 bg-green-100 text-green-800"
      : status === "Needs adjusting"
      ? "border-amber-200 bg-amber-100 text-amber-800"
      : "border-neutral-200 bg-neutral-100 text-neutral-700";

  return (
    <section className="rounded-[24px] border border-neutral-200 bg-white p-4 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Option {optionKey}
          </div>
          <div
            className={cx(
              "mt-1 text-[1.8rem] font-bold leading-[1.2] tracking-tight truncate",
              accentClass
            )}
          >
            {value.label || `Decision ${optionKey}`}
          </div>
        </div>

        <div
          className={cx(
            "rounded-full border px-3 py-1 text-[11px] font-semibold",
            statusClasses
          )}
        >
          {status}
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <SectionLabel>Decision label</SectionLabel>
          <CleanInput
            value={value.label}
            onChange={(newLabel) => onChange({ ...value, label: newLabel })}
            placeholder="Enter decision label"
            className="font-medium"
          />
        </div>

        <div className="space-y-1.5">
          <SectionLabel>Scenario matrix</SectionLabel>
          <ScenarioEditor
            rows={value.scenarios}
            onChange={(scenarios) => onChange({ ...value, scenarios })}
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <MetricBox
            label="Expected value"
            value={ev.toFixed(2)}
            valueClassName={metricClass}
          />
          <MetricBox
            label="Probability sum"
            value={probSum.toFixed(2)}
            valueClassName={
              Math.abs(probSum - 1) < 0.01 ? "text-green-700" : "text-amber-700"
            }
          />
          <MetricBox
            label="Status"
            value={status}
            valueClassName="text-sm text-neutral-800"
          />
        </div>
      </div>
    </section>
  );
}

function ResultCard({
  leftEV,
  rightEV,
  leftLabel,
  rightLabel,
}: {
  leftEV: number;
  rightEV: number;
  leftLabel: string;
  rightLabel: string;
}) {
  const a = Number.isFinite(leftEV) ? leftEV : 0;
  const b = Number.isFinite(rightEV) ? rightEV : 0;
  const isTie = a === b;
  const winner = isTie
    ? "Tie"
    : a > b
    ? leftLabel || "Option A"
    : rightLabel || "Option B";
  const lead = Math.abs(a - b);

  const total = Math.abs(a) + Math.abs(b);
  const leftWidth = total === 0 ? 50 : (Math.abs(a) / total) * 100;
  const rightWidth = total === 0 ? 50 : (Math.abs(b) / total) * 100;

  return (
    <section className="mx-auto w-full rounded-[24px] border border-blue-200 bg-white p-4 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
      <div className="text-center">
        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
          Result
        </div>
        <h2 className="mt-1 text-[1.7rem] font-bold leading-none tracking-tight text-neutral-900">
          Comparison
        </h2>
      </div>

      <div className="mt-4 grid grid-cols-1 items-center gap-3 md:grid-cols-[1fr_auto_1fr]">
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-center">
          <div className="truncate text-sm text-neutral-500">
            {leftLabel || "Option A"}
          </div>
          <div className="mt-1 text-2xl font-bold text-blue-700">
            {a.toFixed(2)}
          </div>
        </div>

        <div className="text-center text-sm font-semibold uppercase tracking-[0.16em] text-neutral-400">
          vs
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-center">
          <div className="truncate text-sm text-neutral-500">
            {rightLabel || "Option B"}
          </div>
          <div className="mt-1 text-2xl font-bold text-emerald-700">
            {b.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-full border border-neutral-200 bg-neutral-100">
        <div className="flex h-3.5 w-full">
          <div
            className={cx(
              "transition-all duration-300",
              isTie ? "bg-neutral-400" : "bg-blue-600"
            )}
            style={{ width: `${leftWidth}%` }}
          />
          <div
            className={cx(
              "transition-all duration-300",
              isTie ? "bg-neutral-300" : "bg-emerald-600"
            )}
            style={{ width: `${rightWidth}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-col items-center gap-2 text-center">
        <div
          className={cx(
            "rounded-full px-4 py-1.5 text-sm font-semibold",
            isTie
              ? "bg-neutral-100 text-neutral-700"
              : a > b
              ? "bg-blue-100 text-blue-800"
              : "bg-emerald-100 text-emerald-800"
          )}
        >
          {isTie ? "It’s a tie" : `${winner} recommended`}
        </div>

        <div className="text-sm text-neutral-600">
          {isTie
            ? "Both options produce the same expected value."
            : `${winner} leads by ${lead.toFixed(2)}.`}
        </div>
      </div>
    </section>
  );
}

export default function DecisionEVOnlyPage() {
  const [left, setLeft] = useState<OptionCardModel>({
    label: "",
    scenarios: [
      { scenario: "", probability: "", payoff: "" },
      { scenario: "", probability: "", payoff: "" },
    ],
  });

  const [right, setRight] = useState<OptionCardModel>({
    label: "",
    scenarios: [
      { scenario: "", probability: "", payoff: "" },
      { scenario: "", probability: "", payoff: "" },
    ],
  });

  const leftEV = useMemo(() => calcEV(left.scenarios), [left.scenarios]);
  const rightEV = useMemo(() => calcEV(right.scenarios), [right.scenarios]);

  return (
    <div className="min-h-screen bg-transparent pb-6">
      <main className="mx-auto w-full max-w-6xl px-5 py-4 md:px-5 md:py-1">
        <header className="mx-auto max-w-2xl text-center">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
            Tools
          </div>
          <h1 className="mt-1.5 text-3xl font-bold tracking-tight text-black md:text-[2.5rem]">
            Decision Tool
          </h1>
          <p className="mt-1.5 text-sm leading-6 text-neutral-600 md:text-[15px]">
            compare two options using ev (expected value), dont make decisions based on <i>vibes.</i>
          </p>
        </header>

        <section className="mt-5 grid grid-cols-1 gap-3 xl:grid-cols-2">
          <OptionCard
            optionKey="A"
            accentClass="text-blue-800"
            metricClass="text-blue-700"
            value={left}
            onChange={setLeft}
          />
          <OptionCard
            optionKey="B"
            accentClass="text-emerald-700"
            metricClass="text-emerald-700"
            value={right}
            onChange={setRight}
          />
        </section>

        <div className="mt-4">
          <ResultCard
            leftEV={leftEV}
            rightEV={rightEV}
            leftLabel={left.label || "Option A"}
            rightLabel={right.label || "Option B"}
          />
        </div>
      </main>
    </div>
  );
}