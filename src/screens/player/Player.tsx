import { Link, useParams } from 'react-router'
import { Button } from '../../components/Button'
import { useSession, useSetLogs, useSettings } from '../../db/hooks'
import WeightsPlayer from './WeightsPlayer'
import KbPlayer from './KbPlayer'
import SprintPlayer from './SprintPlayer'
import MorningPlayer from './MorningPlayer'

export default function Player() {
  const { id } = useParams()
  const session = useSession(id)
  const logs = useSetLogs(id)
  const settings = useSettings()

  if (session === undefined || !logs || !settings) return <div className="p-6 text-ink-3">Loading…</div>
  if (!session) {
    return (
      <div className="p-6 space-y-3">
        <div className="display text-3xl">Session not found</div>
        <Link to="/"><Button>Back to Today</Button></Link>
      </div>
    )
  }
  if (session.status !== 'in_progress') {
    return (
      <div className="p-6 space-y-3">
        <div className="eyebrow">This session is {session.status.replace('_', ' ')}</div>
        <div className="display text-3xl">Nothing to log</div>
        <div className="flex gap-2">
          <Link to={`/history/${session.id}`}><Button>View in history</Button></Link>
          <Link to="/"><Button variant="primary">Today</Button></Link>
        </div>
      </div>
    )
  }
  switch (session.type) {
    case 'weights': return <WeightsPlayer session={session} logs={logs} settings={settings} />
    case 'kb': return <KbPlayer session={session} logs={logs} settings={settings} />
    case 'sprints': return <SprintPlayer session={session} logs={logs} settings={settings} />
    case 'morning': return <MorningPlayer session={session} settings={settings} />
  }
}
