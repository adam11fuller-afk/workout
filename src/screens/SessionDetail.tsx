import { useNavigate, useParams } from 'react-router'
import { Button } from '../components/Button'
import { Card, Tag } from '../components/Card'
import { TopBar } from '../components/TopBar'
import { getExercise } from '../data/program'
import type { SetLog } from '../data/types'
import { useSession, useSetLogs, useSettings } from '../db/hooks'
import { repo } from '../db/repo'
import { fmtDateLong, fmtDuration, fmtTime } from '../lib/dates'
import { templateName } from '../lib/session'
import { fmtSet } from './player/shared'

export default function SessionDetail() {
  const { sessionId } = useParams()
  const nav = useNavigate()
  const s = useSession(sessionId)
  const logs = useSetLogs(sessionId)
  const settings = useSettings()
  if (!s || !logs || !settings) return null
  const byEx = new Map<string, SetLog[]>()
  for (const l of logs) { if (!byEx.has(l.exerciseId)) byEx.set(l.exerciseId, []); byEx.get(l.exerciseId)!.push(l) }

  return (
    <div>
      <TopBar back="/history" eyebrow={`${fmtDateLong(s.date)} · ${fmtTime(s.startedAt)}`} title={templateName(s)}
        sub={<span className="flex gap-2 flex-wrap items-center">{s.durationSec != null && <span className="num">{fmtDuration(s.durationSec)}</span>}{s.deload && <Tag tone="warn">deload</Tag>}{s.kbPhase && <Tag>{s.kbPhase}</Tag>}{s.sprint?.location && <Tag tone="cool">{s.sprint.location}</Tag>}{s.sprint?.endedEarly && <Tag tone="warn">ended early</Tag>}<Tag tone={s.status === 'completed' ? 'ok' : 'default'}>{s.status.replace('_', ' ')}</Tag></span>} />
      <div className="px-4 space-y-3">
        {s.notes && <Card className="text-ink-2 text-sm whitespace-pre-wrap">{s.notes}</Card>}
        {[...byEx.entries()].map(([exId, ls]) => (
          <Card key={exId} className="space-y-1">
            <button type="button" className="display text-xl text-left" onClick={() => nav(`/exercise/${exId}`)}>{getExercise(exId).name} ›</button>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {[...ls].sort((a, b) => a.setIndex - b.setIndex).map((l) => (
                <span key={l.id} className="num text-sm text-ink-2">
                  <span className="text-ink-3">{l.side ? `${l.setIndex + 1}${l.side}` : l.setIndex + 1}·</span> {fmtSet(l, settings.units)}{l.rir != null ? <span className="text-ink-3"> @{l.rir}</span> : null}
                </span>
              ))}
            </div>
          </Card>
        ))}
        {logs.length === 0 && <div className="text-ink-3 text-sm">No sets logged.</div>}
        {s.status === 'in_progress' && <Button variant="primary" full size="lg" onClick={() => nav(`/session/${s.id}`)}>Resume</Button>}
        <Button variant="danger" full onClick={async () => { if (confirm('Delete this session and its sets?')) { await repo.deleteSession(s.id); nav('/history') } }}>Delete session</Button>
      </div>
    </div>
  )
}
