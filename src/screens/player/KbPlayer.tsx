import { useMemo } from 'react'
import { Button } from '../../components/Button'
import { Banner, Card } from '../../components/Card'
import { Checklist } from '../../components/Checklist'
import { getKbWorkout } from '../../data/program'
import type { AppSettings, Session, SetLog } from '../../data/types'
import { useHistoryIndex } from '../../db/hooks'
import { repo } from '../../db/repo'
import { unlockAudio } from '../../timers/audio'
import { BagBlock, CarryBlock, EmomBlock, GetupBlock, IntervalBlock, RoundsBlock, type BlockProps } from './KbBlocks'
import { Summary } from './Summary'
import { PlayerShell, useCursor } from './shared'

export default function KbPlayer({ session, logs, settings }: { session: Session; logs: SetLog[]; settings: AppSettings }) {
  const workout = getKbWorkout(session.templateId)!
  const phase = session.kbPhase ?? settings.kbPhase
  const blocks = workout.blocks[phase]
  const setCursor = useCursor(session)
  const { sessions, logs: allLogs, ready } = useHistoryIndex()

  // Previous completed session of this same template → "last time" numbers.
  const lastLogs = useMemo(() => {
    if (!ready) return []
    const prev = sessions!.filter((s) => s.status === 'completed' && s.templateId === session.templateId && s.id !== session.id)
      .sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1))[0]
    return prev ? allLogs!.filter((l) => l.sessionId === prev.id) : []
  }, [ready, sessions, allLogs, session])

  if (!ready) return <div className="p-6 text-ink-3">Loading…</div>

  const cur = session.cursor ?? { phase: 'warmup' as const, step: 0 }
  const title = `${workout.name.split(' · ')[0]} · ${phase}${session.deload ? ' · deload' : ''}`
  const warmupDone = session.warmupDone ?? workout.warmup.map(() => false)

  if (cur.phase === 'warmup') {
    return (
      <PlayerShell session={session} title={title} sub="Warm-up · 4 min" progress={0}>
        <div className="rise">
          <div className="eyebrow">Warm-up</div>
          <div className="display text-4xl mt-1">Wake the hips & shoulders</div>
        </div>
        {session.deload && <Banner tone="warn" title="Deload week">Rounds and timed blocks cut by about a third.</Banner>}
        <Card className="rise d1">
          <Checklist steps={workout.warmup} done={warmupDone} onToggle={(i) => repo.updateSession(session.id, { warmupDone: warmupDone.map((d, j) => (j === i ? !d : d)) })} />
        </Card>
        <Card className="rise d2 space-y-1">
          <div className="eyebrow mb-1">Today's blocks</div>
          {blocks.map((b) => <div key={b.key} className="text-sm text-ink-2"><span className="num text-hot mr-2">{b.key}</span>{b.title}</div>)}
        </Card>
        <Button variant="primary" size="xl" full className="rise d3" onClick={() => { unlockAudio(); void setCursor({ phase: 'main', step: 0 }) }}>Start block 1</Button>
      </PlayerShell>
    )
  }

  if (cur.phase === 'summary') {
    return (
      <PlayerShell session={session} title={title} progress={1}>
        <Summary session={session} logs={logs} units={settings.units} onBack={() => setCursor({ phase: 'main' })} />
      </PlayerShell>
    )
  }

  const idx = Math.min(cur.step, blocks.length - 1)
  const block = blocks[idx]
  const next = () => (idx + 1 < blocks.length ? setCursor({ step: idx + 1 }) : setCursor({ phase: 'summary' }))
  const props: BlockProps = { block, session, logs, lastLogs, units: settings.units, snatch: settings.snatchEnabled && phase === 'standard', onDone: () => void next() }

  return (
    <PlayerShell session={session} title={title} sub={`Block ${block.key} of ${blocks.length} · ${block.title}`} onFinish={() => setCursor({ phase: 'summary' })} progress={idx / blocks.length}>
      <div key={`${block.key}-${phase}`} className="rise">
        {block.type === 'getup' && <GetupBlock {...props} />}
        {block.type === 'emom' && <EmomBlock {...props} />}
        {block.type === 'rounds' && <RoundsBlock {...props} />}
        {block.type === 'carry' && <CarryBlock {...props} />}
        {block.type === 'interval' && <IntervalBlock {...props} />}
        {block.type === 'bag' && <BagBlock {...props} />}
      </div>
      <div className="flex gap-2">
        <Button full variant="ghost" disabled={idx === 0} onClick={() => setCursor({ step: idx - 1 })}>← Prev block</Button>
        <Button full variant="ghost" onClick={next}>{idx + 1 < blocks.length ? 'Next block →' : 'Finish →'}</Button>
      </div>
    </PlayerShell>
  )
}
