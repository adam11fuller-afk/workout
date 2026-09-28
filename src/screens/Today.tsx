import { useNavigate } from 'react-router'
import { PROGRAM } from '../data/program'
import { useHistoryIndex, useInProgress, useMorningLogs, useSettings } from '../db/hooks'
import { repo } from '../db/repo'
import { Button } from '../components/Button'
import { Banner, Card, Tag } from '../components/Card'
import { fmtDateShort, fmtTime, todayKey, WEEKDAY_NAMES } from '../lib/dates'
import {
  exerciseIsRegressing, groupExerciseHistory, isDeloadWeek, morningStreak, nextUpSessions, programWeek,
  scheduledFor, sessionMap, shouldPromptKbSwitch, sprintsSlowing, thisWeekKey, type PlannedSession,
} from '../lib/logic'
import { startSession, templateName, TYPE_TONE } from '../lib/session'
import { getExercise } from '../data/program'

export default function Today() {
  const nav = useNavigate()
  const settings = useSettings()
  const { sessions, logs, ready } = useHistoryIndex()
  const morning = useMorningLogs()
  const inProgress = useInProgress()

  if (!settings || !ready || !morning) return <div className="p-6 text-ink-3">Loading…</div>

  const today = new Date()
  const completed = sessions!.filter((s) => s.status === 'completed')
  const scheduled = scheduledFor(today, completed)
  const nextUp = nextUpSessions(completed).filter((n) => n.templateId !== scheduled?.templateId)
  const deload = isDeloadWeek(settings.programStartDate)
  const week = programWeek(settings.programStartDate)
  const streak = morningStreak(morning)
  const doneToday = completed.filter((s) => s.date === todayKey() && s.type !== 'morning')

  // Recovery note: any exercise regressing two sessions running, or sprints slowing.
  const smap = sessionMap(sessions!)
  const regressing: string[] = []
  if (settings.recoveryDismissedWeek !== thisWeekKey()) {
    const byEx = new Map<string, typeof logs>()
    for (const l of logs!) { if (!byEx.has(l.exerciseId)) byEx.set(l.exerciseId, []); byEx.get(l.exerciseId)!.push(l) }
    for (const [exId, ls] of byEx) if (exerciseIsRegressing(groupExerciseHistory(ls!, smap))) regressing.push(getExercise(exId).name)
    if (sprintsSlowing(sessions!)) regressing.push('Sprints (ended early twice)')
  }
  const kbPrompt = shouldPromptKbSwitch(settings)

  const start = async (p: PlannedSession) => {
    const id = await startSession(p.type, p.templateId, settings)
    nav(`/session/${id}`)
  }
  const startMorning = async () => {
    const id = await startSession('morning', 'morning', settings)
    nav(`/session/${id}`)
  }
  const quickMorningDone = async () => {
    if (streak.doneToday) { await repo.unmarkMorningDone(todayKey()); return }
    await repo.markMorningDone(todayKey())
  }

  return (
    <div className="px-4 pt-5 space-y-4">
      <header className="rise">
        <div className="eyebrow">{WEEKDAY_NAMES[today.getDay()]} · {fmtDateShort(todayKey())} · Week {week}</div>
        <h1 className="display text-5xl mt-1">Today</h1>
      </header>

      {inProgress && (
        <Card className="rise d1 border-hot/50 pulse-hot">
          <div className="eyebrow text-hot">In progress · started {fmtTime(inProgress.startedAt)}</div>
          <div className="display text-3xl mt-1">{templateName(inProgress)}</div>
          <Button variant="primary" size="lg" full className="mt-3" onClick={() => nav(`/session/${inProgress.id}`)}>Resume</Button>
        </Card>
      )}

      {deload && (
        <div className="rise d1">
          <Banner tone="warn" title="Deload week">Sets cut by a third (3 → 2). Sprints capped at 4 reps. Keep the weights, lose the grind.</Banner>
        </div>
      )}

      {regressing.length > 0 && (
        <div className="rise d2">
          <Banner tone="info" title="Consider reducing volume this week" onDismiss={() => repo.saveSettings({ recoveryDismissedWeek: thisWeekKey() })}>
            Two sessions in a row went backwards on: {regressing.join(', ')}. In a deficit that is usually recovery, not effort. Drop a set or take an extra rest day.
          </Banner>
        </div>
      )}

      {kbPrompt && (
        <div className="rise d2">
          <Banner tone="hot" title="Ready for Standard kettlebell?" onDismiss={() => repo.saveSettings({ kbPromptDismissedWeek: thisWeekKey() })}>
            You are past week 4. If two-hand swings feel smooth and powerful, switch the KB phase in <button className="underline text-ink" onClick={() => nav('/settings')}>Settings</button>. Your call.
          </Banner>
        </div>
      )}

      {scheduled ? (
        <SessionCard p={scheduled} eyebrow="Scheduled" onStart={() => start(scheduled)} deload={deload} className="rise d2" big
          done={doneToday.some((s) => s.templateId === scheduled.templateId)} />
      ) : (
        <Card className="rise d2">
          <div className="eyebrow">No session scheduled</div>
          <div className="display text-3xl mt-1">Recovery day</div>
          <p className="text-ink-2 text-sm mt-1">Morning routine only. If you want to train anyway, the next-up sessions are below.</p>
        </Card>
      )}

      {/* Morning routine */}
      <Card className="rise d3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="eyebrow">Daily · ~{PROGRAM.morning.estMinutes} min</div>
            <div className="display text-3xl mt-1">Morning wake-up</div>
          </div>
          <div className="text-right">
            <div className="num text-4xl text-hot leading-none">{streak.current}</div>
            <div className="eyebrow">day streak</div>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button variant={streak.doneToday ? 'secondary' : 'primary'} size="lg" className="flex-1" onClick={startMorning}>Guided timer</Button>
          <Button variant={streak.doneToday ? 'ok' : 'secondary'} size="lg" className="flex-1" onClick={quickMorningDone}>
            {streak.doneToday ? '✓ Done today' : 'Mark done'}
          </Button>
        </div>
      </Card>

      <section className="rise d4">
        <div className="eyebrow mb-2">{scheduled ? 'Or do a session anyway' : 'Next up'}</div>
        <div className="space-y-2">
          {nextUp.map((p) => <SessionCard key={p.templateId} p={p} onStart={() => start(p)} deload={deload} />)}
        </div>
      </section>
    </div>
  )
}

function SessionCard({ p, eyebrow, onStart, deload, big, className = '', done }:
  { p: PlannedSession; eyebrow?: string; onStart: () => void; deload: boolean; big?: boolean; className?: string; done?: boolean }) {
  const letter = p.templateId.includes('-') ? p.templateId.split('-')[1] : undefined
  return (
    <Card className={`${className} ${big ? 'border-hot/40' : ''}`}>
      <div className="flex items-center gap-3">
        <div className={`shrink-0 ${big ? 'h-16 w-16 text-4xl' : 'h-12 w-12 text-2xl'} rounded-xl ${TYPE_TONE[p.type]} text-black display flex items-center justify-center`}>
          {letter ?? (p.type === 'sprints' ? 'S' : '·')}
        </div>
        <div className="flex-1 min-w-0">
          {eyebrow && <div className="eyebrow text-hot">{eyebrow}</div>}
          <div className={`display ${big ? 'text-3xl' : 'text-xl'} truncate`}>{p.name}</div>
          <div className="text-ink-2 text-sm truncate">{p.sub}{deload ? ' · deload' : ''}</div>
        </div>
        {!big && <Button size="md" onClick={onStart}>Start</Button>}
      </div>
      {big && (
        <div className="mt-4 flex items-center gap-2">
          <Button variant="primary" size="xl" full onClick={onStart}>{done ? 'Start again' : 'Start'}</Button>
          {done && <Tag tone="ok">Done today</Tag>}
        </div>
      )}
    </Card>
  )
}
