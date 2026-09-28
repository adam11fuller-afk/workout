import { useMemo, useState } from 'react'
import { Button } from '../../components/Button'
import { Banner, Card, Tag } from '../../components/Card'
import { Sheet } from '../../components/Sheet'
import { getExercise, getWeightsWorkout } from '../../data/program'
import type { AppSettings, Session, SetLog } from '../../data/types'
import { useAllExerciseSettings, useHistoryIndex } from '../../db/hooks'
import { repo } from '../../db/repo'
import { fmtWeight, prescriptionLabel, repSchemeLabel, repTargetMin } from '../../lib/format'
import { exerciseIsRegressing, groupExerciseHistory, progressionFor, sessionMap, weightsToLayOut, type Progression } from '../../lib/logic'
import { buildWeightsSteps, type WeightsStep } from '../../lib/steps'
import { unlockAudio } from '../../timers/audio'
import { RestTimer } from './RestTimer'
import { SetLogger, type SetValues } from './SetLogger'
import { Summary } from './Summary'
import { ExerciseHeader, LastSessionLine, PlayerShell, fmtSet, logId, useCursor } from './shared'

export default function WeightsPlayer({ session, logs, settings }: { session: Session; logs: SetLog[]; settings: AppSettings }) {
  const workout = getWeightsWorkout(session.templateId)!
  const overrides = useAllExerciseSettings()
  const { sessions, logs: allLogs, ready } = useHistoryIndex()
  const setCursor = useCursor(session)
  const [resting, setResting] = useState<{ next: number } | null>(null)
  const [sheet, setSheet] = useState(false)
  const units = settings.units

  const ovMap = useMemo(() => new Map((overrides ?? []).map((o) => [o.exerciseId, o])), [overrides])
  const steps = useMemo(() => buildWeightsSteps(workout, ovMap, session.deload), [workout, ovMap, session.deload])

  // Per-exercise history (completed sessions only) → progression + last-session numbers.
  const hist = useMemo(() => {
    const out = new Map<string, { history: ReturnType<typeof groupExerciseHistory>; prog: Progression; regress: boolean }>()
    if (!ready) return out
    const smap = sessionMap(sessions!)
    for (const b of workout.blocks) for (const s of b.slots) {
      const ex = getExercise(s.exerciseId)
      const h = groupExerciseHistory(allLogs!.filter((l) => l.exerciseId === s.exerciseId), smap)
      const step = steps.find((st) => st.exerciseId === s.exerciseId)!
      out.set(s.exerciseId, { history: h, prog: progressionFor(ex, step.reps, h, ovMap.get(s.exerciseId)), regress: exerciseIsRegressing(h) })
    }
    return out
  }, [ready, sessions, allLogs, workout, steps, ovMap])

  const logByStep = useMemo(() => {
    const m = new Map<string, SetLog>()
    for (const l of logs) m.set(`${l.blockKey}:${l.setIndex}:${l.exerciseId}`, l)
    return m
  }, [logs])
  const logFor = (st: WeightsStep) => logByStep.get(`${st.blockKey}:${st.setIndex}:${st.exerciseId}`)

  if (!overrides || !ready) return <div className="p-6 text-ink-3">Loading…</div>

  const phase = session.cursor?.phase ?? 'warmup'
  const stepIdx = Math.min(session.cursor?.step ?? 0, steps.length - 1)
  const step = steps[stepIdx]
  const doneCount = steps.filter((s) => logFor(s)).length
  const title = `${workout.name}${session.deload ? ' · deload' : ''}`

  // ---- Setup screen ---------------------------------------------------------
  if (phase === 'warmup') {
    const planned = workout.blocks.flatMap((b) => b.slots)
      .filter((s) => getExercise(s.exerciseId).kind === 'weighted')
      .map((s) => hist.get(s.exerciseId)?.prog.weightLb)
    const layOut = weightsToLayOut(planned)
    const regress = [...hist.entries()].filter(([, v]) => v.regress).map(([id]) => getExercise(id).name)
    return (
      <PlayerShell session={session} title={title} sub="Setup" progress={0}>
        <div className="rise">
          <div className="eyebrow">Setup · bench</div>
          <div className="display text-5xl mt-1 text-hot">{workout.setup === 'none' ? 'No bench' : workout.setup}</div>
          <div className="text-ink-2 text-sm mt-1">{workout.setupNotes.join(' · ')}. Keep the bench in this position the whole session.</div>
        </div>
        <Card className="rise d1">
          <div className="eyebrow mb-2">Lay out</div>
          {layOut.length ? (
            <div className="flex flex-wrap gap-2">
              {layOut.map((w) => <span key={w} className="num text-2xl px-3 py-1.5 rounded-xl bg-bg-3 border border-line-2">{fmtWeight(w, units)}</span>)}
            </div>
          ) : (
            <div className="text-ink-2 text-sm">No history yet. Start light: pick a weight you could do for the top of the range with 1–2 reps left.</div>
          )}
        </Card>
        {session.deload && <div className="rise d2"><Banner tone="warn" title="Deload week">Sets are cut to 2. Same weights, stop well short of failure.</Banner></div>}
        {regress.length > 0 && <div className="rise d2"><Banner tone="info" title="Consider reducing volume">Going backwards two sessions running on {regress.join(', ')}. Drop a set on those today.</Banner></div>}
        <Card className="rise d3 space-y-1.5">
          <div className="eyebrow mb-1">Today</div>
          {workout.blocks.map((b) => (
            <div key={b.key} className="flex gap-3 text-sm">
              <span className="num text-hot w-6">{b.key}</span>
              <span className="text-ink-2 flex-1">
                {b.slots.map((s, i) => {
                  const st = steps.find((x) => x.exerciseId === s.exerciseId)!
                  return <span key={s.exerciseId}>{i > 0 && <span className="text-ink-3"> + </span>}{getExercise(s.exerciseId).name} <span className="num text-ink-3">{st.sets}×{repSchemeLabel(st.reps)}</span></span>
                })}
              </span>
            </div>
          ))}
        </Card>
        <Button variant="primary" size="xl" full className="rise d4" onClick={() => { unlockAudio(); void setCursor({ phase: 'main', step: 0 }) }}>Start lifting</Button>
      </PlayerShell>
    )
  }

  // ---- Summary ------------------------------------------------------------------
  if (phase === 'summary') {
    return (
      <PlayerShell session={session} title={title} progress={1}>
        <Summary session={session} logs={logs} units={units} onBack={() => setCursor({ phase: 'main' })} />
      </PlayerShell>
    )
  }

  // ---- Main -------------------------------------------------------------------------
  const ex = getExercise(step.exerciseId)
  const h = hist.get(step.exerciseId)!
  const lastEntry = h.history[h.history.length - 1]
  const existing = logFor(step)
  const prevSameEx = steps.slice(0, stepIdx).reverse().map(logFor).find((l) => l && l.exerciseId === step.exerciseId)
  const lastSameSet = lastEntry?.sets.find((s) => s.setIndex === step.setIndex)
  const initial: SetValues = existing
    ? { weightLb: existing.weightLb, reps: existing.reps ?? 0, rir: existing.rir }
    : {
        weightLb: prevSameEx?.weightLb ?? h.prog.weightLb ?? ovMap.get(step.exerciseId)?.targetWeightLb ?? 0,
        reps: lastSameSet?.reps ?? lastEntry?.sets[0]?.reps ?? repTargetMin(step.reps),
        rir: undefined,
      }
  const nextStep: WeightsStep | undefined = steps[stepIdx + 1]
  const goTo = (i: number) => { setResting(null); void setCursor({ step: Math.max(0, Math.min(steps.length - 1, i)) }) }

  const onLog = async (v: SetValues) => {
    await repo.upsertSetLog({
      id: logId(session.id, step.blockKey, step.slotIndex, step.setIndex), sessionId: session.id, exerciseId: step.exerciseId,
      blockKey: step.blockKey, setIndex: step.setIndex, kind: 'reps', weightLb: v.weightLb, reps: v.reps, rir: v.rir, createdAt: new Date().toISOString(),
    })
    if (!nextStep) { void setCursor({ phase: 'summary' }); return }
    if (step.restAfter != null) setResting({ next: stepIdx + 1 })
    else goTo(stepIdx + 1)
  }

  const badge = h.prog.badge === 'up'
    ? <Banner tone="ok" title={`Go up · ${fmtWeight(h.prog.weightLb, units)}`}>{h.prog.text}</Banner>
    : h.prog.badge === 'same'
      ? <div className="flex items-center gap-2 text-sm text-ink-2"><Tag tone="info">Same weight</Tag>{h.prog.text}</div>
      : <div className="text-sm text-ink-3">{h.prog.text}</div>

  return (
    <PlayerShell session={session} title={title} sub={`Block ${step.blockKey} · ${doneCount}/${steps.length} sets`} onFinish={() => setCursor({ phase: 'summary' })} progress={doneCount / steps.length}>
      {resting ? (
        <RestTimer
          key={`rest-${resting.next}`}
          seconds={settings.restTimerSec}
          nextLabel={nextStep ? `${nextStep.label} · ${getExercise(nextStep.exerciseId).name} · set ${nextStep.setIndex + 1}` : undefined}
          onDone={() => goTo(resting.next)} onSkip={() => goTo(resting.next)}
        />
      ) : (
        <>
          <div className="flex items-center justify-between rise">
            <div className="eyebrow">Set {step.setIndex + 1} of {step.sets}{step.perSide ? ' · each side' : ''}</div>
            <button type="button" onClick={() => setSheet(true)} className="eyebrow text-hot h-9 px-2 -mr-2">All sets</button>
          </div>
          <Card className="rise d1 space-y-4">
            <ExerciseHeader exercise={ex} label={step.label} prescription={prescriptionLabel({ exerciseId: step.exerciseId, sets: step.sets, reps: step.reps, perSide: step.perSide, repLabel: step.repLabel }, step.sets)} badge={badge} />
            <LastSessionLine sets={lastEntry?.sets} units={units} highlightIndex={step.setIndex} />
          </Card>
          <div className="rise d2">
            <SetLogger key={step.index} weighted={ex.kind === 'weighted'} units={units} initial={initial} onLog={onLog} logged={!!existing} />
          </div>
          <div className="flex gap-2 rise d3">
            <Button full size="md" variant="ghost" disabled={stepIdx === 0} onClick={() => goTo(stepIdx - 1)}>← Prev</Button>
            <Button full size="md" variant="ghost" onClick={() => (nextStep ? goTo(stepIdx + 1) : setCursor({ phase: 'summary' }))}>{nextStep ? 'Skip →' : 'Finish →'}</Button>
          </div>
        </>
      )}
      <Sheet open={sheet} onClose={() => setSheet(false)} title="All sets">
        <ul className="divide-y divide-line">
          {steps.map((s) => {
            const l = logFor(s)
            return (
              <li key={s.index}>
                <button type="button" onClick={() => { setSheet(false); goTo(s.index) }} className={`w-full min-h-12 py-2 flex items-center gap-3 text-left ${s.index === stepIdx ? 'text-hot' : ''}`}>
                  <span className="num w-8 text-sm">{s.label}</span>
                  <span className="flex-1 min-w-0 truncate text-sm">{getExercise(s.exerciseId).name} <span className="text-ink-3">set {s.setIndex + 1}</span></span>
                  <span className={`num text-sm ${l ? 'text-ok' : 'text-ink-3'}`}>{l ? fmtSet(l, units) : '—'}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </Sheet>
    </PlayerShell>
  )
}
