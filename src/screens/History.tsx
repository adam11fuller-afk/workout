import { useState } from 'react'
import { Link } from 'react-router'
import { Calendar } from '../components/Calendar'
import { Card } from '../components/Card'
import { TopBar } from '../components/TopBar'
import { EXERCISES } from '../data/program'
import type { Session } from '../data/types'
import { useHistoryIndex, useMorningLogs } from '../db/hooks'
import { fmtDateLong, fmtDuration, fmtTime, todayKey } from '../lib/dates'
import { templateName, TYPE_TONE } from '../lib/session'

export default function History() {
  const { sessions, logs, ready } = useHistoryIndex()
  const morning = useMorningLogs()
  const [selected, setSelected] = useState(todayKey())
  if (!ready || !morning) return null
  const completed = sessions!.filter((s) => s.status === 'completed')
  const day = completed.filter((s) => s.date === selected && s.type !== 'morning').sort((a, b) => (a.startedAt < b.startedAt ? -1 : 1))
  const recent = completed.filter((s) => s.type !== 'morning').slice(0, 8)
  const exIds = [...new Set(logs!.map((l) => l.exerciseId))].filter((id) => EXERCISES[id]).sort((a, b) => EXERCISES[a].name.localeCompare(EXERCISES[b].name))
  const morningDays = new Set(morning.map((m) => m.date))

  return (
    <div>
      <TopBar title="History" eyebrow={`${completed.filter((s) => s.type !== 'morning').length} sessions · ${morning.length} morning routines`} />
      <div className="px-4 space-y-4">
        <Calendar sessions={completed} selected={selected} onSelect={setSelected} morningDays={morningDays} />
        <section>
          <div className="eyebrow mb-2">{fmtDateLong(selected)}</div>
          {day.length === 0 && !morningDays.has(selected) && <div className="text-ink-3 text-sm">Nothing logged.</div>}
          {morningDays.has(selected) && <div className="text-sm text-info mb-2">✓ Morning routine</div>}
          <div className="space-y-2">{day.map((s) => <SessionRow key={s.id} s={s} />)}</div>
        </section>
        {recent.length > 0 && (
          <section>
            <div className="eyebrow mb-2">Recent</div>
            <div className="space-y-2">{recent.map((s) => <SessionRow key={s.id} s={s} withDate />)}</div>
          </section>
        )}
        {exIds.length > 0 && (
          <section>
            <div className="eyebrow mb-2">Per-exercise history</div>
            <Card className="p-0 divide-y divide-line">
              {exIds.map((id) => (
                <Link key={id} to={`/exercise/${id}`} className="flex items-center justify-between px-4 min-h-12 py-2 active:bg-bg-3">
                  <span className="text-sm">{EXERCISES[id].name}</span>
                  <span className="num text-xs text-ink-3">{logs!.filter((l) => l.exerciseId === id).length} sets ›</span>
                </Link>
              ))}
            </Card>
          </section>
        )}
      </div>
    </div>
  )
}

function SessionRow({ s, withDate }: { s: Session; withDate?: boolean }) {
  return (
    <Link to={`/history/${s.id}`} className="card px-4 py-3 flex items-center gap-3 active:bg-bg-3">
      <span className={`h-3 w-3 rounded-full ${TYPE_TONE[s.type]}`} />
      <div className="flex-1 min-w-0">
        <div className="font-semibold">{templateName(s)}{s.deload ? <span className="text-warn text-xs ml-2">deload</span> : null}</div>
        <div className="text-xs text-ink-3">{withDate ? `${fmtDateLong(s.date)} · ` : ''}{fmtTime(s.startedAt)}{s.durationSec ? ` · ${fmtDuration(s.durationSec)}` : ''}</div>
      </div>
      <span className="text-ink-3">›</span>
    </Link>
  )
}
