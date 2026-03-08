"use client"

import { useMemo, useState } from "react"

type Outcome = {
  probability: string
  payoff: string
}

type OptionModel = {
  label: string
  type: string
  outcomes: Outcome[]
  prior: string
  evidenceGivenSuccess: string
  evidenceGivenFailure: string
  kellyProbability: string
  kellyMultiple: string
}

function toNum(value: string) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function clamp01(n: number) {
  if (n < 0) return 0
  if (n > 1) return 1
  return n
}

function calcEV(outcomes: Outcome[]) {
  return outcomes.reduce((sum, o) => {
    return sum + toNum(o.probability) * toNum(o.payoff)
  }, 0)
}

function calcProbSum(outcomes: Outcome[]) {
  return outcomes.reduce((sum, o) => sum + toNum(o.probability), 0)
}

function calcBayes(priorStr: string, likeSuccessStr: string, likeFailureStr: string) {
  const prior = clamp01(toNum(priorStr))
  const likeSuccess = clamp01(toNum(likeSuccessStr))
  const likeFailure = clamp01(toNum(likeFailureStr))

  const numerator = likeSuccess * prior
  const denominator = numerator + likeFailure * (1 - prior)

  if (denominator === 0) return null
  return numerator / denominator
}

function calcKelly(probabilityStr: string, multipleStr: string) {
  const p = clamp01(toNum(probabilityStr))
  const b = toNum(multipleStr)
  const q = 1 - p

  if (b <= 0) return null
  return ((p * b) - q) / b
}

function scoreSummary(ev: number, posterior: number | null, kelly: number | null) {
  let score = 0

  score += ev

  if (posterior !== null) score += posterior * 100
  if (kelly !== null) score += Math.max(0, kelly) * 50

  return score
}

function ResultCard({
  title,
  value,
  subtext,
}: {
  title: string
  value: string
  subtext?: string
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white/60 p-4">
      <div className="text-sm text-black/55">{title}</div>
      <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
      {subtext ? <div className="mt-1 text-sm text-black/55">{subtext}</div> : null}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h2 className="text-2xl font-semibold tracking-tight">{children}</h2>
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-2 block text-sm font-medium text-black/70">{children}</label>
}

function Input({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-black/15 bg-white/80 px-3 py-2 outline-none transition focus:border-black/30"
      inputMode="decimal"
    />
  )
}

function OptionPanel({
  option,
  setOption,
  accent,
}: {
  option: OptionModel
  setOption: (next: OptionModel) => void
  accent: string
}) {
  const ev = useMemo(() => calcEV(option.outcomes), [option.outcomes])
  const probSum = useMemo(() => calcProbSum(option.outcomes), [option.outcomes])
  const posterior = useMemo(
    () => calcBayes(option.prior, option.evidenceGivenSuccess, option.evidenceGivenFailure),
    [option.prior, option.evidenceGivenSuccess, option.evidenceGivenFailure]
  )
  const kelly = useMemo(
    () => calcKelly(option.kellyProbability, option.kellyMultiple),
    [option.kellyProbability, option.kellyMultiple]
  )

  function updateOutcome(index: number, key: keyof Outcome, value: string) {
    const nextOutcomes = [...option.outcomes]
    nextOutcomes[index] = { ...nextOutcomes[index], [key]: value }
    setOption({ ...option, outcomes: nextOutcomes })
  }

  return (
    <div className="rounded-3xl border border-black/10 bg-white/40 p-5 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <FieldLabel>Option label</FieldLabel>
          <Input
            value={option.label}
            onChange={(value) => setOption({ ...option, label: value })}
            placeholder="PwC Consulting"
          />
        </div>

        <div className="min-w-[170px]">
          <FieldLabel>Type</FieldLabel>
          <Input
            value={option.type}
            onChange={(value) => setOption({ ...option, type: value })}
            placeholder="Internship"
          />
        </div>
      </div>

      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <SectionLabel>Expected Value</SectionLabel>
          <div
            className="rounded-full px-3 py-1 text-xs font-medium"
            style={{ backgroundColor: accent, color: "#111" }}
          >
            Probabilities should total ~1.00
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm font-medium text-black/60">
          <div>Probability</div>
          <div>Payoff</div>
        </div>

        <div className="mt-2 space-y-3">
          {option.outcomes.map((outcome, i) => (
            <div key={i} className="grid grid-cols-2 gap-3">
              <Input
                value={outcome.probability}
                onChange={(value) => updateOutcome(i, "probability", value)}
                placeholder={`Outcome ${i + 1} probability (e.g. 0.${5 - i})`}
              />
              <Input
                value={outcome.payoff}
                onChange={(value) => updateOutcome(i, "payoff", value)}
                placeholder={`Outcome ${i + 1} payoff (e.g. ${90 - i * 30})`}
              />
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ResultCard
            title="Expected value"
            value={ev.toFixed(2)}
            subtext="Average weighted payoff"
          />
          <ResultCard
            title="Probability total"
            value={probSum.toFixed(2)}
            subtext={Math.abs(probSum - 1) < 0.001 ? "Good" : "Try to make this close to 1.00"}
          />
        </div>
      </div>

      <div className="mb-6">
        <SectionLabel>Bayesian Update</SectionLabel>
        <p className="mt-1 text-sm text-black/55">
          Update your prior belief using new evidence.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <FieldLabel>Prior P(success)</FieldLabel>
            <Input
              value={option.prior}
              onChange={(value) => setOption({ ...option, prior: value })}
              placeholder="0.40"
            />
          </div>

          <div>
            <FieldLabel>P(evidence | success)</FieldLabel>
            <Input
              value={option.evidenceGivenSuccess}
              onChange={(value) => setOption({ ...option, evidenceGivenSuccess: value })}
              placeholder="0.70"
            />
          </div>

          <div>
            <FieldLabel>P(evidence | failure)</FieldLabel>
            <Input
              value={option.evidenceGivenFailure}
              onChange={(value) => setOption({ ...option, evidenceGivenFailure: value })}
              placeholder="0.30"
            />
          </div>
        </div>

        <div className="mt-4">
          <ResultCard
            title="Posterior probability"
            value={posterior === null ? "—" : `${(posterior * 100).toFixed(2)}%`}
            subtext="Updated probability after evidence"
          />
        </div>
      </div>

      <div>
        <SectionLabel>Kelly Criterion</SectionLabel>
        <p className="mt-1 text-sm text-black/55">
          Size the bet. In real life, use half-Kelly or quarter-Kelly.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <FieldLabel>Probability of success</FieldLabel>
            <Input
              value={option.kellyProbability}
              onChange={(value) => setOption({ ...option, kellyProbability: value })}
              placeholder="0.60"
            />
          </div>

          <div>
            <FieldLabel>Payoff multiple (b)</FieldLabel>
            <Input
              value={option.kellyMultiple}
              onChange={(value) => setOption({ ...option, kellyMultiple: value })}
              placeholder="1"
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <ResultCard
            title="Full Kelly"
            value={kelly === null ? "—" : kelly.toFixed(3)}
            subtext="Theoretical maximum growth"
          />
          <ResultCard
            title="Half Kelly"
            value={kelly === null ? "—" : (kelly / 2).toFixed(3)}
            subtext="More realistic"
          />
          <ResultCard
            title="Quarter Kelly"
            value={kelly === null ? "—" : (kelly / 4).toFixed(3)}
            subtext="Safer"
          />
        </div>
      </div>
    </div>
  )
}

export default function DecisionToolPage() {
  const [left, setLeft] = useState<OptionModel>({
    label: "PwC Consulting",
    type: "Internship",
    outcomes: [
      { probability: "0.50", payoff: "90" },
      { probability: "0.30", payoff: "60" },
      { probability: "0.20", payoff: "30" },
    ],
    prior: "0.40",
    evidenceGivenSuccess: "0.70",
    evidenceGivenFailure: "0.30",
    kellyProbability: "0.54",
    kellyMultiple: "1",
  })

  const [right, setRight] = useState<OptionModel>({
    label: "Mastercard Consulting",
    type: "Internship",
    outcomes: [
      { probability: "0.40", payoff: "85" },
      { probability: "0.40", payoff: "55" },
      { probability: "0.20", payoff: "35" },
    ],
    prior: "0.40",
    evidenceGivenSuccess: "0.55",
    evidenceGivenFailure: "0.45",
    kellyProbability: "0.45",
    kellyMultiple: "1",
  })

  const leftEV = useMemo(() => calcEV(left.outcomes), [left.outcomes])
  const rightEV = useMemo(() => calcEV(right.outcomes), [right.outcomes])

  const leftPosterior = useMemo(
    () => calcBayes(left.prior, left.evidenceGivenSuccess, left.evidenceGivenFailure),
    [left.prior, left.evidenceGivenSuccess, left.evidenceGivenFailure]
  )
  const rightPosterior = useMemo(
    () => calcBayes(right.prior, right.evidenceGivenSuccess, right.evidenceGivenFailure),
    [right.prior, right.evidenceGivenSuccess, right.evidenceGivenFailure]
  )

  const leftKelly = useMemo(
    () => calcKelly(left.kellyProbability, left.kellyMultiple),
    [left.kellyProbability, left.kellyMultiple]
  )
  const rightKelly = useMemo(
    () => calcKelly(right.kellyProbability, right.kellyMultiple),
    [right.kellyProbability, right.kellyMultiple]
  )

  const leftScore = scoreSummary(leftEV, leftPosterior, leftKelly)
  const rightScore = scoreSummary(rightEV, rightPosterior, rightKelly)

  const winner =
    leftScore === rightScore
      ? "Tie"
      : leftScore > rightScore
      ? left.label || "Left option"
      : right.label || "Right option"

  const winnerReason =
    leftScore === rightScore
      ? "Both options are roughly equal on the current inputs."
      : leftScore > rightScore
      ? `${left.label} leads on the combined decision score.`
      : `${right.label} leads on the combined decision score.`

  return (
    <main className="min-h-screen bg-stone-100 text-black">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h1 className="text-5xl font-semibold tracking-tight">Decision Model Tool</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-black/65">
              Compare two options using expected value, Bayesian updating, and Kelly sizing.
              Keep both options on the same payoff scale.
            </p>

            <div className="mt-6 rounded-3xl border border-black/10 bg-white/50 p-5">
              <div className="text-sm font-medium text-black/55">Example</div>
              <div className="mt-2 text-sm leading-7 text-black/70">
                <div><span className="font-medium">Type:</span> Internship</div>
                <div><span className="font-medium">Payoff scale:</span> 0–100 career value</div>
                <div><span className="font-medium">PwC EV:</span> (0.50×90) + (0.30×60) + (0.20×30)</div>
                <div><span className="font-medium">Prior:</span> 0.40</div>
                <div><span className="font-medium">Bayes inputs:</span> 0.70 and 0.30</div>
                <div><span className="font-medium">Kelly inputs:</span> p = 0.54, b = 1</div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-black/10 bg-white/60 p-6 shadow-sm">
            <div className="text-sm font-medium text-black/55">Conclusion</div>
            <div className="mt-2 text-3xl font-semibold tracking-tight">{winner}</div>
            <p className="mt-3 text-sm leading-6 text-black/65">{winnerReason}</p>

            <div className="mt-6 grid gap-3">
              <ResultCard title={left.label || "Left option"} value={leftScore.toFixed(2)} subtext="Composite score" />
              <ResultCard title={right.label || "Right option"} value={rightScore.toFixed(2)} subtext="Composite score" />
            </div>

            <div className="mt-6 rounded-2xl bg-stone-100 p-4 text-sm leading-6 text-black/70">
              Rule of thumb:
              <br />
              <span className="font-medium">Higher EV</span> = better average outcome
              <br />
              <span className="font-medium">Higher posterior</span> = stronger updated belief
              <br />
              <span className="font-medium">Higher Kelly</span> = stronger bet size
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <OptionPanel option={left} setOption={setLeft} accent="rgba(59,130,246,0.14)" />
          <OptionPanel option={right} setOption={setRight} accent="rgba(16,185,129,0.14)" />
        </div>
      </div>
    </main>
  )
}