"use client"

import { useMemo, useState } from "react"

type Outcome = {
  probability: string
  payoff: string
}

type DecisionOption = {
  label: string
  category: string
  outcomes: Outcome[]
}

function toNumber(value: string) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function expectedValue(outcomes: Outcome[]) {
  return outcomes.reduce((total, outcome) => total + toNumber(outcome.probability) * toNumber(outcome.payoff), 0)
}

function probabilityTotal(outcomes: Outcome[]) {
  return outcomes.reduce((total, outcome) => total + toNumber(outcome.probability), 0)
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">{children}</label>
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (next: string) => void
  placeholder: string
}) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
    />
  )
}

function NumberInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (next: string) => void
  placeholder: string
}) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      inputMode="decimal"
      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
    />
  )
}

function DecisionCard({
  title,
  option,
  setOption,
  accent,
}: {
  title: string
  option: DecisionOption
  setOption: (next: DecisionOption) => void
  accent: string
}) {
  const ev = useMemo(() => expectedValue(option.outcomes), [option.outcomes])
  const total = useMemo(() => probabilityTotal(option.outcomes), [option.outcomes])

  function updateOutcome(index: number, key: keyof Outcome, value: string) {
    const nextOutcomes = [...option.outcomes]
    nextOutcomes[index] = { ...nextOutcomes[index], [key]: value }
    setOption({ ...option, outcomes: nextOutcomes })
  }

  function addScenario() {
    setOption({
      ...option,
      outcomes: [...option.outcomes, { probability: "", payoff: "" }],
    })
  }

  const isProbabilitiesBalanced = Math.abs(total - 1) < 0.001

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        <span className="rounded-full px-3 py-1 text-xs font-semibold text-slate-700" style={{ backgroundColor: accent }}>
          EV = Σ (probability × payoff)
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel>Decision label</FieldLabel>
          <TextInput value={option.label} onChange={(next) => setOption({ ...option, label: next })} placeholder={title} />
        </div>
        <div>
          <FieldLabel>Type</FieldLabel>
          <TextInput
            value={option.category}
            onChange={(next) => setOption({ ...option, category: next })}
            placeholder="Role, investment, project"
          />
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200">
        <div className="grid grid-cols-[120px_1fr_1fr] bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <div>Scenario</div>
          <div>Probability</div>
          <div>Payoff</div>
        </div>

        <div className="divide-y divide-slate-100">
          {option.outcomes.map((row, index) => (
            <div key={`${title}-scenario-${index + 1}`} className="grid grid-cols-[120px_1fr_1fr] items-center gap-3 px-3 py-3">
              <div className="text-sm font-medium text-slate-600">Scenario {index + 1}</div>
              <NumberInput
                value={row.probability}
                onChange={(next) => updateOutcome(index, "probability", next)}
                placeholder={index === 0 ? "0.50" : index === 1 ? "0.30" : "0.20"}
              />
              <NumberInput
                value={row.payoff}
                onChange={(next) => updateOutcome(index, "payoff", next)}
                placeholder={index === 0 ? "90" : index === 1 ? "60" : "20"}
              />
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={addScenario}
        className="mt-4 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      >
        Add scenario
      </button>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Expected Value</p>
            <p className="mt-1 text-4xl font-bold text-slate-900">{ev.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Probability Sum</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{total.toFixed(2)}</p>
            <p className="mt-1 text-xs text-slate-600">{isProbabilitiesBalanced ? "Close to 1.00" : "Adjust toward 1.00"}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function DecisionToolPage() {
  const [leftOption, setLeftOption] = useState<DecisionOption>({
    label: "Job A",
    category: "Role",
    outcomes: [
      { probability: "0.50", payoff: "90" },
      { probability: "0.30", payoff: "60" },
      { probability: "0.20", payoff: "25" },
    ],
  })

  const [rightOption, setRightOption] = useState<DecisionOption>({
    label: "Job B",
    category: "Role",
    outcomes: [
      { probability: "0.35", payoff: "130" },
      { probability: "0.40", payoff: "55" },
      { probability: "0.25", payoff: "-15" },
    ],
  })

  const leftEV = useMemo(() => expectedValue(leftOption.outcomes), [leftOption.outcomes])
  const rightEV = useMemo(() => expectedValue(rightOption.outcomes), [rightOption.outcomes])

  const leftName = leftOption.label || "Job A"
  const rightName = rightOption.label || "Job B"
  const betterOption = leftEV === rightEV ? "Tie" : leftEV > rightEV ? leftName : rightName
  const difference = Math.abs(leftEV - rightEV)

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <header className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Decision Modeling Tool</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            You can use this tool to model decisions mathematically instead of relying on intuition alone.
          </p>
          <div className="mt-3 space-y-1 text-sm text-slate-600">
            <p>Probability is how likely each scenario is, usually adding up to 1.00.</p>
            <p>Payoff is the value of that scenario in your chosen units.</p>
            <p>Expected value compares options by averaging probability and payoff together.</p>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <DecisionCard title="Job A" option={leftOption} setOption={setLeftOption} accent="rgba(59,130,246,0.15)" />
          <DecisionCard title="Job B" option={rightOption} setOption={setRightOption} accent="rgba(16,185,129,0.15)" />
        </div>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold tracking-tight">Conclusion</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs uppercase tracking-wide text-slate-500">Job A EV</div>
              <div className="mt-1 text-2xl font-semibold text-slate-900">{leftEV.toFixed(2)}</div>
              <div className="mt-1 text-xs text-slate-600">{leftName}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs uppercase tracking-wide text-slate-500">Job B EV</div>
              <div className="mt-1 text-2xl font-semibold text-slate-900">{rightEV.toFixed(2)}</div>
              <div className="mt-1 text-xs text-slate-600">{rightName}</div>
            </div>
            <div className="rounded-2xl border border-slate-900 bg-slate-900 p-4 text-white">
              <div className="text-xs uppercase tracking-wide text-slate-300">Recommended Option</div>
              <div className="mt-1 text-3xl font-bold">{betterOption}</div>
              <div className="mt-1 text-xs text-slate-300">
                {leftEV === rightEV ? "Both options are equal on expected value." : `Leads by ${difference.toFixed(2)} EV points`}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
