import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { getExercise } from '../../data/program'
import type { Session, SetLog } from '../../data/types'
import { repo } from '../../db/repo'
import { fmtDuration } from '../../lib/dates'
import { fmtWeight, type Units } from '../../lib/format'
import { completeSession, templateName } from '../../lib/session'
import { useElapsed } from '../../timers/useCountdown'
import { sounds } from '../../timers/audio'
import { fmtSet } from './shared'

export function Summary({ session, logs, units, children, onBack, extra, beforeComplete }:
  { session: Session; logs: SetLog[]; units: Units; children?: ReactNode; onBack?: () => void; extra?: Partial<Session>; beforeComplete?: () => Promise<void> | void }) {
  const nav = useNavigate()
  const elapsed = useElapsed(session.startedAt)
  const [notes, setNotes] = useState(session.notes ?? '')
  const [busy, setBusy] = useState(false)

  const repSets = logs.filter((l) => l.kind === 'reps')
  const volume = repSets.reduce((a, l) => a + (l.weightLb ?? 0) * (l.reps ?? 0), 0)
  const byEx = new Map<string, SetLog[]>()
  for (const l of logs) { if (!byEx.has(l.exerciseId)) byEx.set(l.exerciseId, []); byEx.get(l.exerciseId)!.push(l) }

  const complete = async () => {
    setBusy(true)
    try {
      await beforeComplete?.()
      await completeSession(session, notes, extra)
      sounds.finish()
      nav('/')
    } finally { setBusy(false) }
  }
  const discard = async () => {
    if (!confirm('Discard this session and everything logged in it?')) return
    await repo.deleteSession(session.id)
    nav('/')
  }

  return (
    <div className="space-y-4 rise">
      <div>
        <div className="eyebrow">Summary</div>
        <div className="display text-4xl mt-1">{templateName(session)}</div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Time" value={fmtDuration(elapsed)} />
        <Stat label={session.type === 'sprints' ? 'Reps' : 'Sets'} value={String(session.type === 'sprints' ? logs.filter((l) => l.kind === 'sprint').length : logs.length)} />
        <Stat label="Volume" value={volume > 0 ? fmtWeight(volume, units).replace(/\s.*/, '') : '—'} sub={volume > 0 ? units : undefined} />
      </div>
      {byEx.size > 0 && (
        <Card className="space-y-2">
          {[...byEx.entries()].map(([exId, ls]) => (
            <div key={exId} className="flex items-baseline justify-between gap-3 text-sm">
              <div className="text-ink truncate">{getExercise(exId).name}</div>
              <div className="num text-ink-2 text-right shrink-0">{[...ls].sort((a, b) => a.setIndex - b.setIndex).map((l) => fmtSet(l, units)).join(' · ')}</div>
            </div>
          ))}
        </Card>
      )}
      {children}
      <label className="block">
        <span className="eyebrow block mb-1.5">Notes</span>
        <textarea
          value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="How did it feel? Anything to change next time?"
          className="w-full rounded-xl border border-line-2 bg-bg-3 p-3 text-base outline-none focus:border-hot"
        />
      </label>
      <Button variant="primary" size="xl" full onClick={complete} disabled={busy}>Mark complete</Button>
      <div className="flex gap-2">
        {onBack && <Button full size="lg" onClick={onBack}>Back to workout</Button>}
        <Button full size="lg" variant="danger" onClick={discard}>Discard</Button>
      </div>
    </div>
  )
}

export function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="card px-3 py-3">
      <div className="eyebrow">{label}</div>
      <div className="num text-2xl mt-1 leading-none">{value}{sub && <span className="eyebrow ml-1">{sub}</span>}</div>
    </div>
  )
}
