import type { ReactNode } from 'react'
import { Link } from 'react-router'
import type { Exercise, PlayerCursor, Session, SetLog } from '../../data/types'
import { repo } from '../../db/repo'
import { fmtDuration } from '../../lib/dates'
import { fmtWeight, type Units } from '../../lib/format'
import { useElapsed } from '../../timers/useCountdown'
import { useWakeLock } from '../../timers/wakeLock'
import { Button } from '../../components/Button'
import { Cues } from '../../components/Cues'
import { Demo } from '../../components/Demo'
import { MuscleTags } from '../../components/MuscleTags'

export const logId = (sessionId: string, blockKey: string, slotIndex: number, setIndex: number, side?: string) =>
  `${sessionId}:${blockKey}:${slotIndex}:${setIndex}${side ? `:${side}` : ''}`

export function useCursor(session: Session) {
  return (patch: Partial<PlayerCursor>) =>
    repo.updateSession(session.id, { cursor: { phase: 'main', step: 0, ...session.cursor, ...patch } })
}

export function PlayerShell({ session, title, sub, onFinish, children, progress }:
  { session: Session; title: string; sub?: ReactNode; onFinish?: () => void; children: ReactNode; progress?: number }) {
  useWakeLock(true)
  const elapsed = useElapsed(session.startedAt, session.status === 'in_progress')
  return (
    <div className="min-h-dvh flex flex-col">
      <header className="sticky top-0 z-30 bg-bg/95 backdrop-blur border-b border-line safe-t">
        <div className="px-3 h-14 flex items-center gap-2">
          <Link to="/" aria-label="home" className="h-11 w-11 -ml-1 flex items-center justify-center text-ink-2">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="display text-xl leading-none truncate">{title}</div>
            {sub && <div className="text-xs text-ink-3 truncate mt-0.5">{sub}</div>}
          </div>
          <div className="num text-lg text-ink-2">{fmtDuration(elapsed)}</div>
          {onFinish && <Button size="sm" variant="ghost" onClick={onFinish}>Finish</Button>}
        </div>
        {progress !== undefined && (
          <div className="h-1 bg-bg-3"><div className="h-full bg-hot transition-[width] duration-300" style={{ width: `${Math.round(progress * 100)}%` }} /></div>
        )}
      </header>
      <div className="flex-1 px-4 pt-4 pb-10 space-y-4">{children}</div>
    </div>
  )
}

export function ExerciseHeader({ exercise, label, prescription, badge, compact }:
  { exercise: Exercise; label?: string; prescription?: string; badge?: ReactNode; compact?: boolean }) {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        {label && <div className="num text-hot text-2xl leading-none pt-1 w-9 shrink-0">{label}</div>}
        <div className="flex-1 min-w-0">
          <div className={`display ${compact ? 'text-2xl' : 'text-3xl'} leading-none`}>{exercise.name}</div>
          <MuscleTags muscles={exercise.muscles} className="mt-1.5" />
          {prescription && <div className="num text-ink-2 text-base mt-1.5">{prescription}</div>}
        </div>
      </div>
      {badge}
      {exercise.note && <div className="text-warn text-sm">{exercise.note}</div>}
      <Cues cues={exercise.cues} />
      <Demo exercise={exercise} compact={compact} />
    </div>
  )
}

export function fmtSet(l: SetLog, units: Units): string {
  const w = l.weightLb != null ? fmtWeight(l.weightLb, units).replace(` ${units}`, '') : null
  if (l.kind === 'carry') return `${w ?? '—'} × ${l.distanceYd ?? 0} yd`
  if (l.kind === 'timed') {
    const n = l.roundsCompleted ?? l.reps ?? 0
    const unit = l.roundChecks ? 'rounds' : l.reps != null && l.reps === l.roundsCompleted ? 'reps' : 'rounds'
    return `${w ? `${w} ${units} · ` : ''}${n} ${unit}`
  }
  if (l.kind === 'sprint') return l.effort ? `RPE ${l.effort}` : 'done'
  return w != null ? `${w} × ${l.reps ?? 0}` : `${l.reps ?? 0} reps`
}

/** "35 × 10 · 35 × 10 · 35 × 9" for the previous session's sets of an exercise */
export function LastSessionLine({ sets, units, highlightIndex }: { sets: SetLog[] | undefined; units: Units; highlightIndex?: number }) {
  if (!sets || sets.length === 0) return <div className="text-ink-3 text-sm">No previous session.</div>
  return (
    <div className="flex flex-wrap gap-x-2 gap-y-1 text-sm">
      <span className="eyebrow self-center">Last</span>
      {[...sets].sort((a, b) => a.setIndex - b.setIndex).map((s) => (
        <span key={s.id} className={`num text-sm px-1.5 rounded ${s.setIndex === highlightIndex ? 'bg-hot/15 text-hot' : 'text-ink-2'}`}>
          {fmtSet(s, units)}{s.rir != null ? <span className="text-ink-3"> @{s.rir}</span> : null}
        </span>
      ))}
    </div>
  )
}
