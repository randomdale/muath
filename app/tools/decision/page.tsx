"use client"

import { useMemo, useState } from "react"

type Outcome = {
  probability: string
  payoff: string
}

type DecisionOption = {
  label: string
  category: string
  outcomes: [Outcome, Outcome, Outcome]
}

function toNumber(value: string) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function expectedValue(outcomes: Outcome[]) {
  return outcomes.reduce((total, outcome) => {
    return total + toNumber(outcome.probability) * toNumber(outcome.payoff)
  }, 0)
}

function probabilityTotal(outcomes: Outcome[]) {
  return outcomes.reduce((total, outcome) => total + toNumber(outcome.probability), 0)
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">{children}</label>
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
      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
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

  function updateOutcome(index: 0 | 1 | 2, key: keyof Outcome, value: string) {
    const nextOutcomes = [...option.outcomes] as [Outcome, Outcome, Outcome]
    nextOutcomes[index] = { ...nextOutcomes[index], [key]: value }
    setOption({ ...option, outcomes: nextOutcomes })
  }

  const isProbabilitiesBalanced = Math.abs(total - 1) < 0.001

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: accent }}>
          EV = Σ (Probability × Payoff)
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel>Decision Label</FieldLabel>
          <NumberInput
            value={option.label}
            onChange={(next) => setOption({ ...option, label: next })}
            placeholder="Internship at Company A"
          />
        </div>
        <div>
          <FieldLabel>Decision Type</FieldLabel>
          <NumberInput
            value={option.category}
            onChange={(next) => setOption({ ...option, category: next })}
            placeholder="Internship, Investment, Role, etc."
          />
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-600">
        Fill in each row as a matching pair: <span className="font-medium">Probability 1 ↔ Payoff 1</span>, Probability 2 ↔
        Payoff 2, and Probability 3 ↔ Payoff 3.
      </p>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
        <div className="grid grid-cols-[110px_1fr_1fr] bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <div>Row</div>
          <div>Probability</div>
          <div>Payoff</div>
        </div>

        <div className="divide-y divide-slate-100">
          {(option.outcomes as Outcome[]).map((row, index) => {
            const rowNumber = (index + 1) as 1 | 2 | 3
            return (
              <div key={rowNumber} className="grid grid-cols-[110px_1fr_1fr] items-center gap-3 px-3 py-3">
                <div className="text-sm font-medium text-slate-600">Scenario {rowNumber}</div>
                <NumberInput
                  value={row.probability}
                  onChange={(next) => updateOutcome(index as 0 | 1 | 2, "probability", next)}
                  placeholder={rowNumber === 1 ? "0.50" : rowNumber === 2 ? "0.30" : "0.20"}
                />
                <NumberInput
                  value={row.payoff}
                  onChange={(next) => updateOutcome(index as 0 | 1 | 2, "payoff", next)}
                  placeholder={rowNumber === 1 ? "90" : rowNumber === 2 ? "60" : "20"}
                />
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-900 p-4 text-white">
          <div className="text-xs uppercase tracking-wide text-slate-300">Expected Value</div>
          <div className="mt-1 text-3xl font-semibold">{ev.toFixed(2)}</div>
          <div className="mt-1 text-xs text-slate-300">Higher EV means better average outcome.</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-xs uppercase tracking-wide text-slate-500">Probability Check</div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">{total.toFixed(2)}</div>
          <div className="mt-1 text-xs text-slate-600">
            {isProbabilitiesBalanced ? "Great — total is near 1.00." : "Tip: aim for a total close to 1.00."}
          </div>
        </div>
      </div>
    </section>
  )
}

export default function DecisionToolPage() {
  const [leftOption, setLeftOption] = useState<DecisionOption>({
    label: "Internship at Firm A",
    category: "Internship",
    outcomes: [
      { probability: "0.50", payoff: "90" },
      { probability: "0.30", payoff: "60" },
      { probability: "0.20", payoff: "25" },
    ],
  })

  const [rightOption, setRightOption] = useState<DecisionOption>({
    label: "Investment in Startup B",
    category: "Investment",
    outcomes: [
      { probability: "0.35", payoff: "130" },
      { probability: "0.40", payoff: "55" },
      { probability: "0.25", payoff: "-15" },
    ],
  })

  const leftEV = useMemo(() => expectedValue(leftOption.outcomes), [leftOption.outcomes])
  const rightEV = useMemo(() => expectedValue(rightOption.outcomes), [rightOption.outcomes])

  const betterOption = leftEV === rightEV ? "Tie" : leftEV > rightEV ? leftOption.label || "Left option" : rightOption.label || "Right option"
  const difference = Math.abs(leftEV - rightEV)

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <header className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-4xl font-semibold tracking-tight">Decision Modeling Tool</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Compare two decisions side by side with a 3-scenario expected value model. Keep payoff units consistent (for example,
            money, career value points, or impact score).
          </p>
          <p className="mt-3 text-sm text-slate-600">
            <span className="font-semibold">Example:</span> Internship vs Investment. If a scenario has Probability = 0.50 and Payoff = 90,
            it contributes 45 to expected value.
          </p>
        </header>

        <div className="grid gap-6 xl:grid-cols-2">
          <DecisionCard title="Option A" option={leftOption} setOption={setLeftOption} accent="rgba(59,130,246,0.15)" />
          <DecisionCard title="Option B" option={rightOption} setOption={setRightOption} accent="rgba(16,185,129,0.15)" />
        </div>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold tracking-tight">Conclusion</h2>
          <p className="mt-2 text-sm text-slate-600">
            Recommendation is based on expected value only.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs uppercase tracking-wide text-slate-500">Option A EV</div>
              <div className="mt-1 text-2xl font-semibold">{leftEV.toFixed(2)}</div>
              <div className="mt-1 text-xs text-slate-600">{leftOption.label || "Option A"}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs uppercase tracking-wide text-slate-500">Option B EV</div>
              <div className="mt-1 text-2xl font-semibold">{rightEV.toFixed(2)}</div>
              <div className="mt-1 text-xs text-slate-600">{rightOption.label || "Option B"}</div>
            </div>
            <div className="rounded-2xl border border-slate-900 bg-slate-900 p-4 text-white">
              <div className="text-xs uppercase tracking-wide text-slate-300">Recommended Option</div>
              <div className="mt-1 text-2xl font-semibold">{betterOption}</div>
              <div className="mt-1 text-xs text-slate-300">
                {leftEV === rightEV ? "Both options are equal on EV." : `Leads by ${difference.toFixed(2)} EV points.`}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
