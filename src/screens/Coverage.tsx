import { Card } from '../components/Card'
import { TopBar } from '../components/TopBar'
import { useHistoryIndex } from '../db/hooks'
import { addDays, fmtDateShort, todayKey } from '../lib/dates'
import { coverageByMuscle, programMuscles, sessionMap } from '../lib/logic'

export default function Coverage() {
  const { sessions, logs, ready } = useHistoryIndex()
  if (!ready) return null
  const smap = sessionMap(sessions!)
  const rows = coverageByMuscle(logs!, smap, 21)
  const inProgram = programMuscles()
  const shown = rows.filter((r) => inProgram.has(r.muscle))
  const max = Math.max(1, ...shown.map((r) => r.sets))
  const since = addDays(todayKey(), -20)
  const zero = shown.filter((r) => r.sets === 0)
  const nSessions = sessions!.filter((s) => s.status === 'completed' && s.type !== 'morning' && s.type !== 'sprints' && s.date >= since).length

  return (
    <div>
      <TopBar title="Coverage" eyebrow={`Last 3 weeks · ${fmtDateShort(since)} → today · ${nSessions} lifting sessions`} />
      <div className="px-4 space-y-4">
        {zero.length > 0 && nSessions >= 3 && (
          <Card className="border-bad/40">
            <div className="eyebrow text-bad">Zero sets</div>
            <div className="text-ink-2 text-sm mt-1">{zero.map((z) => z.muscle).join(', ')}. Across A → B → C every group is hit at least twice; only upper chest relies on one lift (incline press in A). A gap here usually means a missed rotation.</div>
          </Card>
        )}
        {nSessions === 0 && <div className="text-ink-3 text-sm">No completed weights or kettlebell sessions in the window yet.</div>}
        <Card className="p-0 divide-y divide-line">
          {shown.map((r) => (
            <div key={r.muscle} className="px-4 py-2.5 flex items-center gap-3">
              <div className={`w-28 shrink-0 text-sm ${r.sets === 0 ? 'text-bad font-semibold' : 'text-ink'}`}>{r.muscle}</div>
              <div className="flex-1 h-3 rounded-full bg-bg-3 overflow-hidden">
                <div className={`h-full rounded-full ${r.sets === 0 ? 'bg-bad/60' : 'bg-hot'}`} style={{ width: `${Math.max(r.sets === 0 ? 0 : 4, (r.sets / max) * 100)}%` }} />
              </div>
              <div className={`num w-8 text-right ${r.sets === 0 ? 'text-bad' : 'text-ink-2'}`}>{r.sets}</div>
            </div>
          ))}
        </Card>
        <div className="text-ink-3 text-xs px-1 pb-4">Working sets only (weights + kettlebell rounds/carries; a timed block counts as one set per exercise). Sprints and the morning routine are excluded.</div>
      </div>
    </div>
  )
}
