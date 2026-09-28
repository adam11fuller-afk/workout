import { Link, useParams } from 'react-router'
import { getExercise, getKbWorkout, getWeightsWorkout, PROGRAM } from '../data/program'
import type { KbBlock, KbPhase, WeightsWorkout } from '../data/types'
import { Card, Tag } from '../components/Card'
import { TopBar } from '../components/TopBar'
import { Segmented } from '../components/Segmented'
import { useAllExerciseSettings, useSettings } from '../db/hooks'
import { repo } from '../db/repo'
import { fmtClock } from '../lib/dates'
import { fmtWeight, prescriptionLabel } from '../lib/format'
import { effectiveSlot } from '../lib/logic'

export default function ProgramDetail() {
  const { templateId = '' } = useParams()
  const settings = useSettings()
  const overrides = useAllExerciseSettings()
  if (!settings || !overrides) return null
  const ovMap = new Map(overrides.map((o) => [o.exerciseId, o]))

  if (templateId === 'morning') {
    return (
      <div>
        <TopBar back="/program" eyebrow="Daily · ~5 min" title={PROGRAM.morning.name} />
        <div className="px-4 space-y-2">
          <p className="text-ink-2 text-sm">Not a workout. Easy movement to wake up.</p>
          {PROGRAM.morning.moves.map((m) => <ExerciseRow key={m.exerciseId} exerciseId={m.exerciseId} right={fmtClock(m.seconds)} />)}
        </div>
      </div>
    )
  }

  if (templateId === 'sprints') {
    const s = PROGRAM.sprints
    return (
      <div>
        <TopBar back="/program" eyebrow="Monday · outdoors · ~20 min" title={s.name} />
        <div className="px-4 space-y-4">
          <Card>
            <div className="eyebrow mb-2">Current prescription</div>
            <div className="display text-3xl">{settings.sprintReps} × {s.sprintSeconds[0]}–{s.sprintSeconds[1]}s sprints</div>
            <div className="text-ink-2 text-sm mt-1">Rest {fmtClock(s.restSec)}+ walking back. Variant: {settings.sprintVariant}. Deload weeks cap at {s.deloadCapReps}.</div>
            <div className="text-ink-3 text-xs mt-2">Weeks 1–2 are 4 reps. Add 1 rep every 1–2 weeks up to 8 (mark "ready to progress" at the end of a session). After 8, switch to hills or 20-second sprints.</div>
          </Card>
          <section>
            <div className="eyebrow mb-2">Warm-up (7–8 min)</div>
            <Card className="text-ink-2 text-sm space-y-1">
              {s.warmup.map((w, i) => <div key={i}>{w.label}{w.detail ? ` · ${w.detail}` : ''}{w.seconds ? ` · ${fmtClock(w.seconds)}` : ''}</div>)}
            </Card>
          </section>
          <section>
            <div className="eyebrow mb-2">Drills & technique</div>
            <div className="space-y-2">{s.drillIds.map((id) => <ExerciseRow key={id} exerciseId={id} />)}</div>
          </section>
          <section>
            <div className="eyebrow mb-2">Notes</div>
            <Card className="text-ink-2 text-sm space-y-1.5">{s.notes.map((n, i) => <p key={i}>{n}</p>)}<p>Cool-down: {s.cooldown}.</p></Card>
          </section>
        </div>
      </div>
    )
  }

  const w = getWeightsWorkout(templateId)
  if (w) return <WeightsDetail w={w} ovMap={ovMap} units={settings.units} />

  const k = getKbWorkout(templateId)
  if (k) {
    const phase = settings.kbPhase
    return (
      <div>
        <TopBar back="/program" eyebrow={`Wednesday · ~${k.estMinutes} min`} title={k.name} />
        <div className="px-4 space-y-4">
          <Segmented<KbPhase>
            label="Phase (also in Settings)"
            options={[{ value: 'beginner', label: 'Beginner' }, { value: 'standard', label: 'Standard' }]}
            value={phase} onChange={(v) => v && repo.saveSettings({ kbPhase: v })}
          />
          <section>
            <div className="eyebrow mb-2">Warm-up (4 min)</div>
            <div className="space-y-2">{k.warmup.map((s, i) => <ExerciseRow key={i} exerciseId={s.exerciseId!} right={s.detail} />)}</div>
          </section>
          {k.blocks[phase].map((b) => <KbBlockCard key={b.key} b={b} snatch={settings.snatchEnabled} />)}
          <Card>
            <div className="eyebrow mb-2">Progression rules</div>
            <ul className="text-ink-2 text-sm space-y-1.5">{PROGRAM.kbProgressionRules.map((r, i) => <li key={i}>• {r}</li>)}</ul>
          </Card>
          <Card className="border-hot/40">
            <div className="eyebrow text-hot mb-2">Goals · long-term benchmark</div>
            <ul className="space-y-1">{PROGRAM.kbGoals.map((g, i) => <li key={i} className="display text-xl">{g}</li>)}</ul>
          </Card>
        </div>
      </div>
    )
  }
  return <div className="p-6">Unknown session. <Link className="underline" to="/program">Back</Link></div>
}

function WeightsDetail({ w, ovMap, units }: { w: WeightsWorkout; ovMap: Map<string, import('../data/types').ExerciseSettings>; units: 'lb' | 'kg' }) {
  return (
    <div>
      <TopBar back="/program" eyebrow={`Saturday · ~${w.estMinutes} min`} title={w.name} sub={<>Setup: <span className="text-ink font-semibold">bench {w.setup}</span> · {w.setupNotes.join(' · ')}</>} />
      <div className="px-4 space-y-4">
        <p className="text-ink-3 text-sm">Superset pairs (a/b) back to back, ~60s rest after each pair. RIR 1–2. Slow lowering through the stretch.</p>
        {w.blocks.map((b) => (
          <section key={b.key}>
            <div className="eyebrow mb-2">{b.slots.length > 1 ? `Superset ${b.key}` : `Block ${b.key}`}</div>
            <div className="space-y-2">
              {b.slots.map((s, i) => {
                const ov = ovMap.get(s.exerciseId)
                const eff = effectiveSlot(s, ov, false)
                return (
                  <ExerciseRow
                    key={s.exerciseId} exerciseId={s.exerciseId}
                    label={b.slots.length > 1 ? `${b.key}${'ab'[i]}` : b.key}
                    right={prescriptionLabel(s, eff.sets)}
                    sub={ov?.targetWeightLb ? `Target ${fmtWeight(ov.targetWeightLb, units)}` : undefined}
                    edited={!!(ov?.repRange || ov?.sets || ov?.targetWeightLb)}
                  />
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

function KbBlockCard({ b, snatch }: { b: KbBlock; snatch: boolean }) {
  let body: React.ReactNode
  switch (b.type) {
    case 'getup': body = <ExerciseRow exerciseId={b.exerciseId} right={`${b.minutes} min · alternate sides`} />; break
    case 'emom': body = <ExerciseRow exerciseId={b.exerciseId} right={`${b.repsPerMinute} every minute · ${b.minutes} min${b.switchHands ? ' · switch hands each round' : ''}`} />; break
    case 'rounds': body = (
      <>
        <div className="text-ink-2 text-sm mb-2">{b.rounds} rounds{b.perSideRounds ? ' per side' : ''}{b.continuous ? ' · without setting the bell down' : ''} · rest {b.restSec}s</div>
        <div className="space-y-2">{b.slots.map((s) => <ExerciseRow key={s.exerciseId} exerciseId={s.exerciseId} right={`× ${s.reps}${s.perSide ? ' / side' : ''}`} />)}</div>
        {b.progressionNote && <div className="text-ink-3 text-xs mt-2">{b.progressionNote}</div>}
      </>
    ); break
    case 'carry': body = (
      <>
        <div className="text-ink-2 text-sm mb-2">{b.rounds} rounds</div>
        <div className="space-y-2">{b.slots.map((s) => <ExerciseRow key={s.exerciseId} exerciseId={s.exerciseId} right={`${s.distanceYd} yd${s.perSide ? ' / side' : ''}`} />)}</div>
      </>
    ); break
    case 'interval': body = (
      <>
        <ExerciseRow exerciseId={snatch && b.altExerciseId ? b.altExerciseId : b.exerciseId} right={`${b.onSec}s on / ${b.offSec}s off · ${b.minutes} min`} />
        {b.altExerciseId && <div className="text-ink-3 text-xs mt-2">Snatch toggle in Settings swaps this to {getExercise(b.altExerciseId).name}.</div>}
      </>
    ); break
    case 'bag': body = <ExerciseRow exerciseId={b.exerciseId} right={`${b.rounds} × (${b.hardSec}s hard / ${b.easySec}s easy)`} sub="Optional" />; break
  }
  return (
    <section>
      <div className="eyebrow mb-2">{b.key}. {b.title}</div>
      {body}
    </section>
  )
}

export function ExerciseRow({ exerciseId, label, right, sub, edited }: { exerciseId: string; label?: string; right?: string; sub?: string; edited?: boolean }) {
  const ex = getExercise(exerciseId)
  return (
    <Link to={`/exercise/${exerciseId}`} className="card px-4 py-3 flex items-center gap-3 active:bg-bg-3">
      {label && <div className="num text-hot text-lg w-8 shrink-0">{label}</div>}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-ink leading-tight">{ex.name}</div>
        <div className="text-xs text-ink-3 mt-0.5 truncate">{ex.muscles.join(' · ')}{sub ? ` · ${sub}` : ''}</div>
      </div>
      <div className="text-right shrink-0">
        {right && <div className="num text-sm text-ink-2">{right}</div>}
        {edited && <Tag tone="info">edited</Tag>}
      </div>
    </Link>
  )
}
