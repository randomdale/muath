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

  function removeScenario(index: number) {
    setOption({
      ...option,
      outcomes: option.outcomes.filter((_, rowIndex) => rowIndex !== index),
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
        <div className="grid grid-cols-[110px_1fr_1fr_auto] bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <div>Scenario</div>
          <div>Probability</div>
          <div>Payoff</div>
          <div className="text-right">Action</div>
        </div>

        <div className="divide-y divide-slate-100">
          {option.outcomes.map((row, index) => (
            <div key={`${title}-scenario-${index + 1}`} className="grid grid-cols-[110px_1fr_1fr_auto] items-center gap-3 px-3 py-3">
              <div className="text-sm font-medium text-slate-600">Scenario {index + 1}</div>
              <NumberInput
                value={row.probability}
                onChange={(next) => updateOutcome(index, "probability", next)}
                placeholder="0.50"
              />
              <NumberInput
                value={row.payoff}
                onChange={(next) => updateOutcome(index, "payoff", next)}
                placeholder="90"
              />
              <button
                type="button"
                onClick={() => removeScenario(index)}
                className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={option.outcomes.length <= 1}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={addScenario}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Add scenario
        </button>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Result</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
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
      { probability: "", payoff: "" },
      { probability: "", payoff: "" },
    ],
  })

  const [rightOption, setRightOption] = useState<DecisionOption>({
    label: "Job B",
    category: "Role",
    outcomes: [
      { probability: "", payoff: "" },
      { probability: "", payoff: "" },
    ],
  })

  const leftEV = useMemo(() => expectedValue(leftOption.outcomes), [leftOption.outcomes])
  const rightEV = useMemo(() => expectedValue(rightOption.outcomes), [rightOption.outcomes])

  const leftName = leftOption.label || "Job A"
  const rightName = rightOption.label || "Job B"
  const betterOption = leftEV === rightEV ? "Tie" : leftEV > rightEV ? leftName : rightName
  const difference = Math.abs(leftEV - rightEV)
  const maxEV = Math.max(leftEV, rightEV, 0)
  const leftBarWidth = maxEV === 0 ? 0 : Math.max(0, (leftEV / maxEV) * 100)
  const rightBarWidth = maxEV === 0 ? 0 : Math.max(0, (rightEV / maxEV) * 100)
  const isLeftHigher = leftEV > rightEV
  const isRightHigher = rightEV > leftEV

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <header className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Decision Modeling Tool</h1>
          <div className="mt-3 space-y-1 text-sm text-slate-600">
            <p>Probability tells you how likely each scenario is.</p>
            <p>Payoff is the outcome value for that scenario.</p>
            <p>Expected value is the weighted average of all scenarios.</p>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <DecisionCard title="Job A" option={leftOption} setOption={setLeftOption} accent="rgba(59,130,246,0.15)" />
          <DecisionCard title="Job B" option={rightOption} setOption={setRightOption} accent="rgba(16,185,129,0.15)" />
        </div>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold tracking-tight">Conclusion</h2>

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:col-span-2">
              <p className="text-sm font-semibold text-slate-800">EV Comparison</p>
              <div className="mt-4 space-y-4">
                <div>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{leftName}</span>
                    <span className="font-semibold text-slate-900">{leftEV.toFixed(2)}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-full rounded-full transition-all ${isLeftHigher ? "bg-blue-600" : "bg-blue-400"}`}
                      style={{ width: `${leftBarWidth}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{rightName}</span>
                    <span className="font-semibold text-slate-900">{rightEV.toFixed(2)}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-full rounded-full transition-all ${isRightHigher ? "bg-emerald-600" : "bg-emerald-400"}`}
                      style={{ width: `${rightBarWidth}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-900 bg-slate-900 p-4 text-white">
              <p className="text-xs uppercase tracking-wide text-slate-300">Summary</p>
              <p className="mt-3 text-sm text-slate-200">{leftName} EV: {leftEV.toFixed(2)}</p>
              <p className="mt-1 text-sm text-slate-200">{rightName} EV: {rightEV.toFixed(2)}</p>
              <p className="mt-4 text-xs uppercase tracking-wide text-slate-300">Recommended Option</p>
              <p className="mt-1 text-3xl font-bold">{betterOption}</p>
              <p className="mt-1 text-xs text-slate-300">
                {leftEV === rightEV ? "Both options are equal on expected value." : `Leads by ${difference.toFixed(2)} EV points`}
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
