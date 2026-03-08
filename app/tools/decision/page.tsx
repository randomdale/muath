"use client"

import { useMemo, useState } from "react"

type Outcome = {
  probability: string
  payoff: string
}

type DecisionOption = {
  label: string
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
      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
    />
  )
}

function statusLabel(total: number) {
  if (Math.abs(total - 1) < 0.001) return "Balanced"
  if (total > 1) return "Above 1.00"
  return "Below 1.00"
}

function SummaryMetric({ label, value, emphasize = false }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 ${emphasize ? "text-2xl font-bold text-slate-900" : "text-base font-semibold text-slate-800"}`}>{value}</p>
    </div>
  )
}

function DecisionCard({
  title,
  option,
  setOption,
  accent,
}: {
  title: "Option A" | "Option B"
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
    if (index < 2 || option.outcomes.length <= 2) return

    setOption({
      ...option,
      outcomes: option.outcomes.filter((_, rowIndex) => rowIndex !== index),
    })
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Decision</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900">{title}</h2>
        </div>
        <span className="rounded-full px-3 py-1 text-xs font-semibold text-slate-700" style={{ backgroundColor: accent }}>
          EV = Σ(probability × payoff)
        </span>
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Editable label</label>
        <input
          value={option.label}
          onChange={(event) => setOption({ ...option, label: event.target.value })}
          placeholder={`Name for ${title.toLowerCase()}`}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
        />
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
        <div className="grid grid-cols-[112px_1fr_1fr_auto] bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <div>Scenario</div>
          <div>Probability</div>
          <div>Payoff</div>
          <div className="text-right">Action</div>
        </div>

        <div className="divide-y divide-slate-100">
          {option.outcomes.map((row, index) => {
            const canRemove = index >= 2 && option.outcomes.length > 2
            return (
              <div key={`${title}-scenario-${index + 1}`} className="grid grid-cols-[112px_1fr_1fr_auto] items-center gap-3 px-3 py-3">
                <div className="text-sm font-medium text-slate-600">Scenario {index + 1}</div>
                <NumberInput
                  value={row.probability}
                  onChange={(next) => updateOutcome(index, "probability", next)}
                  placeholder="Probability"
                />
                <NumberInput value={row.payoff} onChange={(next) => updateOutcome(index, "payoff", next)} placeholder="Payoff" />
                <button
                  type="button"
                  onClick={() => removeScenario(index)}
                  disabled={!canRemove}
                  className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Remove
                </button>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={addScenario}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Add scenario
        </button>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Summary</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <SummaryMetric label="Expected Value" value={ev.toFixed(2)} emphasize />
          <SummaryMetric label="Probability Sum" value={total.toFixed(2)} />
          <SummaryMetric label="Status" value={statusLabel(total)} />
        </div>
      </div>
    </section>
  )
}

export default function DecisionToolPage() {
  const [leftOption, setLeftOption] = useState<DecisionOption>({
    label: "",
    outcomes: [
      { probability: "", payoff: "" },
      { probability: "", payoff: "" },
    ],
  })

  const [rightOption, setRightOption] = useState<DecisionOption>({
    label: "",
    outcomes: [
      { probability: "", payoff: "" },
      { probability: "", payoff: "" },
    ],
  })

  const leftEV = useMemo(() => expectedValue(leftOption.outcomes), [leftOption.outcomes])
  const rightEV = useMemo(() => expectedValue(rightOption.outcomes), [rightOption.outcomes])

  const leftName = leftOption.label.trim() || "Option A"
  const rightName = rightOption.label.trim() || "Option B"
  const betterOption = leftEV === rightEV ? "Tie" : leftEV > rightEV ? leftName : rightName
  const difference = Math.abs(leftEV - rightEV)
  const maxEV = Math.max(leftEV, rightEV, 0)
  const leftBarWidth = maxEV === 0 ? 0 : Math.max(0, (leftEV / maxEV) * 100)
  const rightBarWidth = maxEV === 0 ? 0 : Math.max(0, (rightEV / maxEV) * 100)
  const isLeftHigher = leftEV > rightEV
  const isRightHigher = rightEV > leftEV

  return (
    <main className="min-h-screen bg-slate-100 py-10 text-slate-900 sm:py-14">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
        <header className="mx-auto w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Decision Modeling Tool</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600">Compare expected value across two options and see a live recommendation.</p>
        </header>

        <section className="grid items-stretch gap-6 lg:grid-cols-2">
          <DecisionCard title="Option A" option={leftOption} setOption={setLeftOption} accent="rgba(59,130,246,0.16)" />
          <DecisionCard title="Option B" option={rightOption} setOption={setRightOption} accent="rgba(16,185,129,0.18)" />
        </section>

        <section className="mx-auto w-full max-w-5xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold tracking-tight">Conclusion</h2>
            <div className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-100">Live EV Summary</div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{leftName} EV</p>
              <p className={`mt-1 text-2xl font-bold ${isLeftHigher ? "text-emerald-700" : "text-slate-900"}`}>{leftEV.toFixed(2)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{rightName} EV</p>
              <p className={`mt-1 text-2xl font-bold ${isRightHigher ? "text-emerald-700" : "text-slate-900"}`}>{rightEV.toFixed(2)}</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Recommended option</p>
              <p className="mt-1 text-lg font-bold text-emerald-800">{betterOption}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">EV Lead</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{difference.toFixed(2)}</p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className={`font-semibold ${isLeftHigher ? "text-emerald-700" : "text-slate-700"}`}>{leftName}</span>
              <span className="font-semibold text-slate-900">{leftEV.toFixed(2)}</span>
            </div>
            <div className="h-4 overflow-hidden rounded-full bg-slate-200">
              <div
                className={`h-full rounded-full transition-all ${isLeftHigher ? "bg-emerald-600" : "bg-slate-500"}`}
                style={{ width: `${leftBarWidth}%` }}
              />
            </div>

            <div className="mb-3 mt-5 flex items-center justify-between text-sm">
              <span className={`font-semibold ${isRightHigher ? "text-emerald-700" : "text-slate-700"}`}>{rightName}</span>
              <span className="font-semibold text-slate-900">{rightEV.toFixed(2)}</span>
            </div>
            <div className="h-4 overflow-hidden rounded-full bg-slate-200">
              <div
                className={`h-full rounded-full transition-all ${isRightHigher ? "bg-emerald-600" : "bg-slate-500"}`}
                style={{ width: `${rightBarWidth}%` }}
              />
            </div>

            <p className="mt-5 text-center text-sm font-medium text-slate-700">
              {leftEV === rightEV ? `${leftName} = ${rightName}` : `${leftEV > rightEV ? leftName : rightName} > ${leftEV > rightEV ? rightName : leftName}`}
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
