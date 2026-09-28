import { useState } from 'react'
import type { Session } from '../data/types'
import { dateKey, todayKey } from '../lib/dates'
import { TYPE_TONE } from '../lib/session'

export function Calendar({ sessions, selected, onSelect, morningDays }: { sessions: Session[]; selected: string; onSelect: (d: string) => void; morningDays: Set<string> }) {
  const [month, setMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1) })
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const startPad = first.getDay()
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const byDay = new Map<string, Session[]>()
  for (const s of sessions) { if (!byDay.has(s.date)) byDay.set(s.date, []); byDay.get(s.date)!.push(s) }
  const today = todayKey()
  return (
    <div className="card p-3">
      <div className="flex items-center justify-between mb-2">
        <button type="button" className="h-11 w-11 flex items-center justify-center text-ink-2 text-2xl" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="previous month">‹</button>
        <div className="display text-2xl">{month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</div>
        <button type="button" className="h-11 w-11 flex items-center justify-center text-ink-2 text-2xl" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="next month">›</button>
      </div>
      <div className="grid grid-cols-7 text-center eyebrow !text-[10px] mb-1">{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i}>{d}</div>)}</div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startPad }).map((_, i) => <div key={`p${i}`} />)}
        {Array.from({ length: days }).map((_, i) => {
          const key = dateKey(new Date(month.getFullYear(), month.getMonth(), i + 1))
          const ss = (byDay.get(key) ?? []).filter((s) => s.type !== 'morning')
          const isSel = key === selected
          return (
            <button key={key} type="button" onClick={() => onSelect(key)}
              className={`h-12 rounded-lg flex flex-col items-center justify-center gap-1 border ${isSel ? 'border-hot bg-hot/10' : 'border-transparent'} ${key > today ? 'opacity-40' : ''}`}>
              <span className={`num text-sm ${key === today ? 'text-hot' : morningDays.has(key) ? 'text-ink' : 'text-ink-2'}`}>{i + 1}</span>
              <span className="flex gap-0.5 h-1.5">
                {ss.slice(0, 3).map((s) => <span key={s.id} className={`h-1.5 w-1.5 rounded-full ${TYPE_TONE[s.type]}`} />)}
                {morningDays.has(key) && ss.length === 0 && <span className="h-1.5 w-1.5 rounded-full bg-info/50" />}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
