import { useMemo, useState } from 'react'
import { Button } from '../../components/Button'
import { Card, Tag } from '../../components/Card'
import { Stepper } from '../../components/Stepper'
import { TimerFace } from '../../components/TimerFace'
import { getExercise } from '../../data/program'
import type { KbBlock, Session, SetLog } from '../../data/types'
import { repo } from '../../db/repo'
import { fmtClock } from '../../lib/dates'
import { fromDisplayWeight, toDisplayWeight, weightStep, type Units } from '../../lib/format'
import { deloadSets } from '../../lib/logic'
import { sounds } from '../../timers/audio'
import { buzz } from '../../timers/vibrate'
import { useCountdown } from '../../timers/useCountdown'
import { useIntervals } from '../../timers/useIntervals'
import { RestTimer } from './RestTimer'
import { ExerciseHeader, LastSessionLine, logId } from './shared'

export interface BlockProps {
  block: KbBlock
  session: Session
  logs: SetLog[]                 // this session's logs
  lastLogs: SetLog[]             // previous completed session's logs for this template
  units: Units
  snatch: boolean
  onDone: () => void
}

const now = () => new Date().toISOString()

/** Bell weight stepper shared by every KB block. */
function BellWeight({ units, value, onChange, label = 'Bell' }: { units: Units; value: number; onChange: (lb: number) => void; label?: string }) {
  return (
    <Stepper label={label} value={toDisplayWeight(value, units)} onChange={(v) => onChange(fromDisplayWeight(v, units))} step={weightStep(units)} min={0} max={300} unit={units} accent size="md" />
  )
}

function lastWeight(lastLogs: SetLog[], exerciseId: string, fallback = 0) {
  const l = lastLogs.filter((x) => x.exerciseId === exerciseId && x.weightLb != null)
  return l.length ? l[l.length - 1].weightLb! : fallback
}

function RoundChecks({ checks, onToggle, labels }: { checks: boolean[]; onToggle: (i: number) => void; labels?: string[] }) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {checks.map((c, i) => (
        <button key={i} type="button" onClick={() => onToggle(i)} aria-pressed={c}
          className={`h-12 rounded-xl border num text-lg ${c ? 'bg-ok border-ok text-black' : 'border-line-2 bg-bg-3 text-ink-2'}`}>
          {labels?.[i] ?? i + 1}
        </button>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
export function GetupBlock({ block, session, logs, lastLogs, units, onDone }: BlockProps) {
  const b = block.type === 'getup' ? block : null
  const ex = getExercise(b?.exerciseId ?? 'kb-half-getup')
  const existing = logs.find((l) => l.blockKey === block.key)
  const [weight, setWeight] = useState(existing?.weightLb ?? lastWeight(lastLogs, ex.id))
  const [side, setSide] = useState<'L' | 'R'>('L')
  const [count, setCount] = useState<{ L: number; R: number }>({ L: 0, R: 0 })
  const total = (b?.minutes ?? 5) * 60
  const cd = useCountdown(total, { onDone: () => { sounds.finish(); buzz.long() } })
  if (!b) return null

  const save = async () => {
    await repo.upsertSetLog({
      id: logId(session.id, block.key, 0, 0), sessionId: session.id, exerciseId: ex.id, blockKey: block.key, setIndex: 0,
      kind: 'timed', weightLb: weight || undefined, reps: count.L + count.R, seconds: Math.round(total - cd.remaining), roundsCompleted: count.L + count.R, createdAt: now(),
    })
    onDone()
  }
  const switchSide = () => {
    setCount((c) => ({ ...c, [side]: c[side] + 1 }))
    setSide((s) => (s === 'L' ? 'R' : 'L'))
    sounds.switchSide(); buzz.short()
  }
  const idle = !cd.running && cd.remaining === cd.total && !cd.done

  return (
    <div className="space-y-4">
      <Card><ExerciseHeader exercise={ex} label={block.key} prescription={`${b.minutes} min · alternate sides`} compact /></Card>
      <LastSessionLine sets={lastLogs.filter((l) => l.blockKey === block.key)} units={units} />
      <Card className={`space-y-4 ${cd.running ? 'border-hot/40' : ''}`}>
        <TimerFace remaining={cd.remaining} total={cd.total} tone="hot" label="Get-up block" size="xl">
          <div className="grid grid-cols-2 gap-2 w-full text-center">
            <div className={`rounded-xl border py-3 ${side === 'L' ? 'border-hot bg-hot/10' : 'border-line'}`}>
              <div className="eyebrow">Left</div><div className="num text-3xl">{count.L}</div>
            </div>
            <div className={`rounded-xl border py-3 ${side === 'R' ? 'border-hot bg-hot/10' : 'border-line'}`}>
              <div className="eyebrow">Right</div><div className="num text-3xl">{count.R}</div>
            </div>
          </div>
        </TimerFace>
        {idle ? (
          <>
            <BellWeight units={units} value={weight} onChange={setWeight} />
            <Button variant="primary" size="xl" full onClick={() => cd.start()}>Start {b.minutes}-minute block</Button>
          </>
        ) : (
          <>
            <Button variant="primary" size="xl" full onClick={switchSide} disabled={cd.done}>
              Rep done · switch to {side === 'L' ? 'right' : 'left'}
            </Button>
            <div className="flex gap-2">
              <Button full onClick={() => (cd.running ? cd.pause() : cd.resume())} disabled={cd.done}>{cd.running ? 'Pause' : 'Resume'}</Button>
              <Button full variant="ok" onClick={save}>{cd.done ? 'Log & next' : 'End early & log'}</Button>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}

// ---------------------------------------------------------------------------
export function EmomBlock({ block, session, logs, lastLogs, units, onDone }: BlockProps) {
  const b = block.type === 'emom' ? block : null
  const ex = getExercise(b?.exerciseId ?? 'kb-two-hand-swing')
  const minutes = b ? (session.deload ? deloadSets(b.minutes) : b.minutes) : 10
  const existing = logs.find((l) => l.blockKey === block.key)
  const [weight, setWeight] = useState(existing?.weightLb ?? lastWeight(lastLogs, ex.id))
  const [checks, setChecks] = useState<boolean[]>(existing?.roundChecks ?? Array(minutes).fill(false))
  const iv = useIntervals(60, 0, minutes * 60, {
    onRound: (r) => setChecks((c) => c.map((v, i) => (i < r - 1 ? true : v))),
    onDone: () => { setChecks((c) => c.map(() => true)); sounds.finish(); buzz.long() },
  })
  if (!b) return null
  const hand = b.switchHands ? (iv.round % 2 === 1 ? 'Left hand' : 'Right hand') : undefined

  const save = async () => {
    const rounds = checks.filter(Boolean).length
    await repo.upsertSetLog({
      id: logId(session.id, block.key, 0, 0), sessionId: session.id, exerciseId: ex.id, blockKey: block.key, setIndex: 0,
      kind: 'timed', weightLb: weight || undefined, roundsCompleted: rounds, roundChecks: checks, reps: rounds * b.repsPerMinute,
      seconds: Math.round(iv.total - iv.remaining), createdAt: now(),
    })
    onDone()
  }
  const idle = !iv.running && iv.remaining === iv.total && !iv.done

  return (
    <div className="space-y-4">
      <Card><ExerciseHeader exercise={ex} label={block.key} prescription={`${b.repsPerMinute} every minute · ${minutes} min${session.deload ? ' (deload)' : ''}${b.switchHands ? ' · switch hands each round' : ''}`} compact /></Card>
      <LastSessionLine sets={lastLogs.filter((l) => l.blockKey === block.key)} units={units} />
      <Card className={`space-y-4 ${iv.running ? 'border-hot/40' : ''}`}>
        {idle ? (
          <>
            <BellWeight units={units} value={weight} onChange={setWeight} />
            <Button variant="primary" size="xl" full onClick={() => iv.start()}>Start EMOM · {minutes} min</Button>
          </>
        ) : (
          <>
            <div className="text-center">
              <div className="eyebrow">Round {iv.round} of {iv.rounds}{hand ? ` · ${hand}` : ''}</div>
              <div className="num text-[5.5rem] leading-none text-hot mt-1">{fmtClock(iv.segmentRemaining)}</div>
              <div className="text-ink-3 text-sm num mt-1">{fmtClock(iv.remaining)} total left</div>
            </div>
            <div className="w-full h-2 rounded-full bg-bg-3 overflow-hidden"><div className="h-full bg-hot" style={{ width: `${(iv.segmentRemaining / 60) * 100}%` }} /></div>
            <div className="flex gap-2">
              <Button full onClick={() => (iv.running ? iv.pause() : iv.resume())} disabled={iv.done}>{iv.running ? 'Pause' : 'Resume'}</Button>
              <Button full variant="ok" onClick={save}>{iv.done ? 'Log & next' : 'End early & log'}</Button>
            </div>
          </>
        )}
        <RoundChecks checks={checks} onToggle={(i) => setChecks((c) => c.map((v, j) => (j === i ? !v : v)))} />
      </Card>
    </div>
  )
}

// ---------------------------------------------------------------------------
export function RoundsBlock({ block, session, logs, lastLogs, units, onDone }: BlockProps) {
  const b = block.type === 'rounds' ? block : null
  const slots = b?.slots ?? []
  const rounds = b ? (session.deload ? deloadSets(b.rounds) : b.rounds) : 0
  const perSide = !!b?.perSideRounds
  // Complex "per side": each numbered round is L then R.
  const n = perSide ? rounds * 2 : rounds
  const labelFor = (i: number) => (perSide ? `${Math.floor(i / 2) + 1}${i % 2 === 0 ? 'L' : 'R'}` : String(i + 1))
  const sideFor = (i: number): 'L' | 'R' | undefined => (perSide ? (i % 2 === 0 ? 'L' : 'R') : undefined)

  const doneRounds = useMemo(() => {
    const s = new Set<number>()
    for (let i = 0; i < n; i++) if (slots.every((sl) => logs.some((l) => l.blockKey === block.key && l.setIndex === i && l.exerciseId === sl.exerciseId))) s.add(i)
    return s
  }, [logs, block.key, slots, n])
  const firstOpen = [...Array(n).keys()].find((i) => !doneRounds.has(i)) ?? Math.max(0, n - 1)
  const [round, setRound] = useState(firstOpen)
  const [resting, setResting] = useState(false)
  const [weight, setWeight] = useState(() => {
    const prev = logs.filter((l) => l.blockKey === block.key && l.weightLb != null)
    return prev.length ? prev[prev.length - 1].weightLb! : slots.length ? lastWeight(lastLogs, slots[0].exerciseId) : 0
  })
  const [reps, setReps] = useState<number[]>(() => slots.map((s) => s.reps))
  const [open, setOpen] = useState<number | null>(null)
  if (!b) return null

  const logRound = async () => {
    await Promise.all(slots.map((s, si) => repo.upsertSetLog({
      id: logId(session.id, block.key, si, round), sessionId: session.id, exerciseId: s.exerciseId, blockKey: block.key, setIndex: round,
      kind: 'reps', weightLb: weight || undefined, reps: reps[si], side: sideFor(round), createdAt: now(),
    })))
    const isLast = round >= n - 1
    if (isLast) { onDone(); return }
    // rest after every round, or after the R half for per-side complexes
    if (!perSide || round % 2 === 1) setResting(true)
    else setRound(round + 1)
  }

  if (resting) {
    return <RestTimer seconds={b.restSec} nextLabel={`Round ${labelFor(round + 1)}`} onDone={() => { setResting(false); setRound(round + 1) }} onSkip={() => { setResting(false); setRound(round + 1) }} />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="eyebrow">{b.title} · {rounds} rounds{perSide ? ' per side' : ''}{session.deload ? ' (deload)' : ''}</div>
        {b.continuous && <Tag tone="warn">don't set the bell down</Tag>}
      </div>
      <RoundChecks checks={[...Array(n).keys()].map((i) => doneRounds.has(i))} labels={[...Array(n).keys()].map(labelFor)} onToggle={(i) => setRound(i)} />
      <Card className="space-y-4 border-hot/30">
        <div className="eyebrow text-hot">Round {labelFor(round)}{sideFor(round) ? ` · ${sideFor(round) === 'L' ? 'left' : 'right'} side` : ''}</div>
        <BellWeight units={units} value={weight} onChange={setWeight} />
        <ul className="divide-y divide-line">
          {slots.map((s, si) => {
            const ex = getExercise(s.exerciseId)
            return (
              <li key={s.exerciseId} className="py-2">
                <div className="flex items-center gap-2">
                  <button type="button" className="flex-1 min-w-0 text-left min-h-12" onClick={() => setOpen(open === si ? null : si)}>
                    <div className="font-semibold leading-tight">{ex.name}</div>
                    <div className="text-xs text-ink-3">{s.reps}{s.perSide ? ' / side' : ''} · tap for cues</div>
                  </button>
                  <div className="flex items-center rounded-xl border border-line-2 bg-bg-3 overflow-hidden">
                    <button type="button" className="h-12 w-12 text-2xl font-display text-ink-2" onClick={() => setReps((r) => r.map((v, j) => (j === si ? Math.max(0, v - 1) : v)))}>−</button>
                    <span className="num text-2xl w-12 text-center">{reps[si]}</span>
                    <button type="button" className="h-12 w-12 text-2xl font-display text-ink-2" onClick={() => setReps((r) => r.map((v, j) => (j === si ? v + 1 : v)))}>+</button>
                  </div>
                </div>
                {open === si && <div className="pt-2"><ExerciseHeader exercise={ex} compact /></div>}
              </li>
            )
          })}
        </ul>
        <Button variant={doneRounds.has(round) ? 'ok' : 'primary'} size="xl" full onClick={logRound}>
          {doneRounds.has(round) ? `Update round ${labelFor(round)}` : `Round ${labelFor(round)} done`}
        </Button>
      </Card>
      {b.progressionNote && <div className="text-ink-3 text-xs">{b.progressionNote}</div>}
      <Button variant="ghost" full onClick={onDone}>Skip to next block →</Button>
    </div>
  )
}

// ---------------------------------------------------------------------------
export function CarryBlock({ block, session, logs, lastLogs, units, onDone }: BlockProps) {
  const b = block.type === 'carry' ? block : null
  const slots = b?.slots ?? []
  const rounds = b?.rounds ?? 0
  const [weights, setWeights] = useState<number[]>(() => slots.map((s) => lastWeight(lastLogs, s.exerciseId)))
  const [dist, setDist] = useState<number[]>(() => slots.map((s) => s.distanceYd))
  const [open, setOpen] = useState<number | null>(null)
  if (!b) return null
  const isDone = (r: number, si: number) => logs.some((l) => l.blockKey === block.key && l.setIndex === r && l.exerciseId === slots[si].exerciseId)

  const toggle = async (r: number, si: number) => {
    const s = slots[si]
    if (isDone(r, si)) { await repo.deleteSetLog(logId(session.id, block.key, si, r)); return }
    await repo.upsertSetLog({
      id: logId(session.id, block.key, si, r), sessionId: session.id, exerciseId: s.exerciseId, blockKey: block.key, setIndex: r,
      kind: 'carry', weightLb: weights[si] || undefined, distanceYd: dist[si], createdAt: now(),
    })
  }
  const allDone = [...Array(rounds).keys()].every((r) => slots.every((_, si) => isDone(r, si)))

  return (
    <div className="space-y-4">
      <div className="eyebrow">{b.title} · {rounds} rounds</div>
      {slots.map((s, si) => {
        const ex = getExercise(s.exerciseId)
        return (
          <Card key={s.exerciseId} className="space-y-3">
            <button type="button" className="w-full text-left" onClick={() => setOpen(open === si ? null : si)}>
              <div className="display text-2xl leading-none">{ex.name}</div>
              <div className="text-xs text-ink-3 mt-1">{s.distanceYd} yd{s.perSide ? ' each side' : ''} · tap for cues</div>
            </button>
            {open === si && <ExerciseHeader exercise={ex} compact />}
            <div className="grid grid-cols-2 gap-2">
              <BellWeight units={units} value={weights[si]} onChange={(v) => setWeights((w) => w.map((x, j) => (j === si ? v : x)))} />
              <Stepper label="Distance" value={dist[si]} onChange={(v) => setDist((d) => d.map((x, j) => (j === si ? v : x)))} step={10} min={0} max={400} unit="yd" size="md" />
            </div>
            <div className="flex gap-2">
              {[...Array(rounds).keys()].map((r) => (
                <Button key={r} full size="lg" variant={isDone(r, si) ? 'ok' : 'secondary'} onClick={() => toggle(r, si)}>
                  {isDone(r, si) ? '✓ ' : ''}Round {r + 1}
                </Button>
              ))}
            </div>
          </Card>
        )
      })}
      <Button variant={allDone ? 'primary' : 'ghost'} size="xl" full onClick={onDone}>{allDone ? 'Next block' : 'Skip to next block →'}</Button>
    </div>
  )
}

// ---------------------------------------------------------------------------
export function IntervalBlock({ block, session, logs, lastLogs, units, snatch, onDone }: BlockProps) {
  const b = block.type === 'interval' ? block : null
  const useAlt = snatch && !!b?.altExerciseId
  const [exId, setExId] = useState(useAlt ? b!.altExerciseId! : (b?.exerciseId ?? 'kb-two-hand-swing'))
  const ex = getExercise(exId)
  const minutes = b ? (session.deload ? deloadSets(b.minutes) : b.minutes) : 8
  const existing = logs.find((l) => l.blockKey === block.key)
  const [weight, setWeight] = useState(existing?.weightLb ?? lastWeight(lastLogs, exId))
  const iv = useIntervals(b?.onSec ?? 15, b?.offSec ?? 15, minutes * 60, { onDone: () => { sounds.finish(); buzz.long() } })
  if (!b) return null
  const idle = !iv.running && iv.remaining === iv.total && !iv.done
  const roundsDone = iv.done ? iv.rounds : Math.max(0, iv.round - (iv.phase === 'on' ? 1 : 0))

  const save = async () => {
    await repo.upsertSetLog({
      id: logId(session.id, block.key, 0, 0), sessionId: session.id, exerciseId: exId, blockKey: block.key, setIndex: 0,
      kind: 'timed', weightLb: weight || undefined, roundsCompleted: roundsDone, seconds: Math.round(iv.total - iv.remaining), createdAt: now(),
    })
    onDone()
  }

  return (
    <div className="space-y-4">
      <Card><ExerciseHeader exercise={ex} label={block.key} prescription={`${b.onSec}s on / ${b.offSec}s off · ${minutes} min${session.deload ? ' (deload)' : ''}`} compact /></Card>
      <LastSessionLine sets={lastLogs.filter((l) => l.blockKey === block.key)} units={units} />
      <Card className={`space-y-4 ${iv.running ? (iv.phase === 'on' ? 'border-hot/60' : 'border-cool/60') : ''}`}>
        {idle ? (
          <>
            {b.altExerciseId && snatch && (
              <div className="flex gap-2">
                <Button full variant={exId === b.exerciseId ? 'primary' : 'secondary'} onClick={() => setExId(b.exerciseId)}>{getExercise(b.exerciseId).name}</Button>
                <Button full variant={exId === b.altExerciseId ? 'primary' : 'secondary'} onClick={() => setExId(b.altExerciseId!)}>Snatches</Button>
              </div>
            )}
            <BellWeight units={units} value={weight} onChange={setWeight} />
            <Button variant="primary" size="xl" full onClick={() => iv.start()}>Start intervals · {minutes} min</Button>
          </>
        ) : (
          <>
            <TimerFace remaining={iv.segmentRemaining} total={iv.segmentTotal} tone={iv.phase === 'on' ? 'hot' : 'cool'} size="xl"
              label={iv.done ? 'Done' : iv.phase === 'on' ? `WORK · round ${iv.round} of ${iv.rounds}` : `rest · round ${iv.round} of ${iv.rounds}`} />
            <div className="text-center text-ink-3 text-sm num">{fmtClock(iv.remaining)} total left</div>
            <div className="flex gap-2">
              <Button full onClick={() => (iv.running ? iv.pause() : iv.resume())} disabled={iv.done}>{iv.running ? 'Pause' : 'Resume'}</Button>
              <Button full variant="ok" onClick={save}>{iv.done ? 'Log & next' : 'End early & log'}</Button>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}

// ---------------------------------------------------------------------------
export function BagBlock({ block, session, logs, onDone }: BlockProps) {
  const b = block.type === 'bag' ? block : null
  const ex = getExercise(b?.exerciseId ?? 'bag-rounds')
  const rounds = b ? (session.deload ? deloadSets(b.rounds) : b.rounds) : 3
  const existing = logs.find((l) => l.blockKey === block.key)
  const [checks, setChecks] = useState<boolean[]>(existing?.roundChecks ?? Array(rounds).fill(false))
  const iv = useIntervals(b?.hardSec ?? 60, b?.easySec ?? 60, rounds * ((b?.hardSec ?? 60) + (b?.easySec ?? 60)), {
    onRound: (r) => setChecks((c) => c.map((v, i) => (i < r - 1 ? true : v))),
    onDone: () => { setChecks((c) => c.map(() => true)); sounds.finish(); buzz.long() },
  })
  if (!b) return null
  const idle = !iv.running && iv.remaining === iv.total && !iv.done
  const save = async () => {
    await repo.upsertSetLog({
      id: logId(session.id, block.key, 0, 0), sessionId: session.id, exerciseId: ex.id, blockKey: block.key, setIndex: 0,
      kind: 'timed', roundsCompleted: checks.filter(Boolean).length, roundChecks: checks, seconds: Math.round(iv.total - iv.remaining), createdAt: now(),
    })
    onDone()
  }
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><div className="eyebrow">{b.title}</div><Tag>optional</Tag></div>
      <Card><ExerciseHeader exercise={ex} label={block.key} prescription={`${rounds} × (${b.hardSec}s hard / ${b.easySec}s easy)`} compact /></Card>
      <Card className={`space-y-4 ${iv.running ? (iv.phase === 'on' ? 'border-hot/60' : 'border-cool/60') : ''}`}>
        {idle ? (
          <Button variant="primary" size="xl" full onClick={() => iv.start()}>Start finisher</Button>
        ) : (
          <>
            <TimerFace remaining={iv.segmentRemaining} total={iv.segmentTotal} tone={iv.phase === 'on' ? 'hot' : 'cool'} size="xl"
              label={iv.done ? 'Done' : iv.phase === 'on' ? `HARD · round ${iv.round} of ${iv.rounds}` : `easy · round ${iv.round} of ${iv.rounds}`} />
            <div className="flex gap-2">
              <Button full onClick={() => (iv.running ? iv.pause() : iv.resume())} disabled={iv.done}>{iv.running ? 'Pause' : 'Resume'}</Button>
              <Button full variant="ok" onClick={save}>{iv.done ? 'Log & finish' : 'End early & log'}</Button>
            </div>
          </>
        )}
        <RoundChecks checks={checks} onToggle={(i) => setChecks((c) => c.map((v, j) => (j === i ? !v : v)))} />
      </Card>
      <Button variant="ghost" full onClick={onDone}>Skip finisher →</Button>
    </div>
  )
}
