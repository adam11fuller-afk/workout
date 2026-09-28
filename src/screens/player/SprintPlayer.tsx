import { useState } from 'react'
import { Button } from '../../components/Button'
import { Banner, Card, Tag } from '../../components/Card'
import { Checklist } from '../../components/Checklist'
import { Segmented } from '../../components/Segmented'
import { getExercise, PROGRAM } from '../../data/program'
import type { AppSettings, Session, SetLog, SprintLocation, SprintVariant } from '../../data/types'
import { repo } from '../../db/repo'
import { unlockAudio } from '../../timers/audio'
import { RestTimer } from './RestTimer'
import { Summary } from './Summary'
import { ExerciseHeader, PlayerShell, logId, useCursor } from './shared'

export default function SprintPlayer({ session, logs, settings }: { session: Session; logs: SetLog[]; settings: AppSettings }) {
  const sp = PROGRAM.sprints
  const setCursor = useCursor(session)
  const cur = session.cursor ?? { phase: 'warmup' as const, step: 0 }
  const sprint = session.sprint ?? { prescribedReps: settings.sprintReps, variant: settings.sprintVariant }
  const reps = logs.filter((l) => l.kind === 'sprint').sort((a, b) => a.setIndex - b.setIndex)
  const [resting, setResting] = useState<number | null>(null) // index of rep just finished
  const [progress, setProgress] = useState(false)
  const [nextVariant, setNextVariant] = useState<SprintVariant>('hill')
  const ex = getExercise(sprint.variant === 'hill' ? 'hill-sprint' : 'sprint')
  const title = `Sprints${session.deload ? ' · deload' : ''}`
  const warmupDone = session.warmupDone ?? sp.warmup.map(() => false)
  const target = sprint.prescribedReps
  const secs = sprint.variant === 'long' ? sp.sprintSeconds[1] : sp.sprintSeconds[0]

  if (cur.phase === 'warmup') {
    return (
      <PlayerShell session={session} title={title} sub="Warm-up · 7–8 min" progress={0}>
        <div className="rise">
          <div className="eyebrow">Today</div>
          <div className="display text-5xl mt-1 text-hot">{target} × {secs}s</div>
          <div className="text-ink-2 text-sm mt-1">{sprint.variant === 'hill' ? 'Hill sprints' : sprint.variant === 'long' ? 'Long flat sprints' : 'Flat sprints'} · rest {sp.restSec / 60}+ min walking back{session.deload ? ' · deload cap' : ''}</div>
        </div>
        <Card className="rise d1">
          <div className="eyebrow mb-1">Warm-up</div>
          <Checklist steps={sp.warmup} done={warmupDone} onToggle={(i) => repo.updateSession(session.id, { warmupDone: warmupDone.map((d, j) => (j === i ? !d : d)) })} />
        </Card>
        <Card className="rise d2 text-ink-2 text-sm space-y-1.5">{sp.notes.map((n, i) => <p key={i}>{n}</p>)}</Card>
        <Button variant="primary" size="xl" full className="rise d3" onClick={() => { unlockAudio(); void setCursor({ phase: 'main', step: 0 }) }}>Start sprints</Button>
      </PlayerShell>
    )
  }

  if (cur.phase === 'summary') {
    const canBump = settings.sprintReps < sp.maxReps
    return (
      <PlayerShell session={session} title={title} progress={1}>
        <Summary
          session={session} logs={logs} units={settings.units} onBack={() => setCursor({ phase: 'main' })}
          beforeComplete={async () => {
            if (!progress) return
            if (canBump) await repo.saveSettings({ sprintReps: settings.sprintReps + 1 })
            else await repo.saveSettings({ sprintVariant: nextVariant })
          }}
        >
          <Card className="space-y-3">
            <div className="text-ink-2 text-sm">Cool-down: {sp.cooldown}.</div>
            <button type="button" onClick={() => setProgress(!progress)} className="w-full flex items-center justify-between min-h-12 text-left" aria-pressed={progress}>
              <div>
                <div className="font-semibold">Ready to progress</div>
                <div className="text-ink-3 text-xs">{canBump ? `Next session: ${settings.sprintReps + 1} reps (max ${sp.maxReps}).` : `At ${sp.maxReps} reps. Next: switch to hills or lengthen to 20s.`}</div>
              </div>
              <span className={`h-8 w-14 rounded-full border relative shrink-0 ${progress ? 'bg-hot border-hot' : 'bg-bg-3 border-line-2'}`}><span className={`absolute top-0.5 h-6.5 w-6.5 rounded-full bg-ink transition-transform ${progress ? 'translate-x-7' : 'translate-x-0.5'}`} /></span>
            </button>
            {progress && !canBump && (
              <Segmented<SprintVariant> options={[{ value: 'hill', label: 'Hills' }, { value: 'long', label: '20s sprints' }]} value={nextVariant} onChange={(v) => v && setNextVariant(v)} />
            )}
            {session.sprint?.endedEarly && <Tag tone="warn">ended early · speed dropped</Tag>}
          </Card>
        </Summary>
      </PlayerShell>
    )
  }

  const nextIndex = reps.length
  const logRep = async () => {
    await repo.upsertSetLog({
      id: logId(session.id, 'sprint', 0, nextIndex), sessionId: session.id, exerciseId: ex.id, blockKey: 'sprint', setIndex: nextIndex, kind: 'sprint', createdAt: new Date().toISOString(),
    })
    setResting(nextIndex)
  }
  const setEffort = async (i: number, effort: number | undefined) => {
    const l = reps.find((r) => r.setIndex === i)
    if (l) await repo.upsertSetLog({ ...l, effort })
  }
  const endEarly = async () => {
    await repo.updateSession(session.id, { sprint: { ...sprint, endedEarly: true }, cursor: { phase: 'summary', step: 0 } })
  }
  const allDone = reps.length >= target

  return (
    <PlayerShell session={session} title={title} sub={`${reps.length}/${target} reps`} onFinish={() => setCursor({ phase: 'summary' })} progress={Math.min(1, reps.length / target)}>
      <Segmented<SprintLocation>
        label="Where" options={[{ value: 'grass', label: 'Grass' }, { value: 'track', label: 'Track' }, { value: 'hill', label: 'Hill' }]}
        value={sprint.location} onChange={(v) => repo.updateSession(session.id, { sprint: { ...sprint, location: v } })}
      />
      {resting != null ? (
        <>
          <RestTimer key={`rest-${resting}`} seconds={sp.restSec} label={`Rest · walk back · rep ${resting + 1} done`} onDone={() => setResting(null)} onSkip={() => setResting(null)} />
          <Card>
            <Segmented<number>
              label={`Effort for rep ${resting + 1} (optional, 1–10)`}
              options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => ({ value: n, label: String(n) }))}
              value={reps.find((r) => r.setIndex === resting)?.effort} onChange={(v) => setEffort(resting, v)} clearable size="sm"
            />
          </Card>
        </>
      ) : (
        <>
          <div className="flex gap-2 flex-wrap rise">
            {[...Array(Math.max(target, reps.length)).keys()].map((i) => {
              const r = reps.find((x) => x.setIndex === i)
              return (
                <div key={i} className={`h-12 min-w-12 px-2 rounded-xl border flex items-center justify-center num text-lg ${r ? 'bg-ok border-ok text-black' : i === nextIndex ? 'border-hot text-hot' : 'border-line-2 text-ink-3'}`}>
                  {r?.effort ? `${i + 1}·${r.effort}` : i + 1}
                </div>
              )
            })}
          </div>
          {allDone ? (
            <Banner tone="ok" title="All reps done">Cool down with a {sp.cooldown}, then finish. Add a rep only if every one was as fast as the first.</Banner>
          ) : (
            <Card className="rise d1"><ExerciseHeader exercise={ex} prescription={`Rep ${nextIndex + 1} of ${target} · ${secs}s · ${nextIndex === 0 ? '~90% effort' : 'as fast as rep 1'}`} /></Card>
          )}
          <Button variant={allDone ? 'secondary' : 'primary'} size="xl" full className="rise d2" onClick={logRep}>{allDone ? `Extra rep ${nextIndex + 1} done` : `Rep ${nextIndex + 1} done`}</Button>
          {allDone && <Button variant="primary" size="xl" full onClick={() => setCursor({ phase: 'summary' })}>Finish session</Button>}
          <Button variant="danger" full onClick={endEarly}>Speed dropped · end session</Button>
        </>
      )}
    </PlayerShell>
  )
}
