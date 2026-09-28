import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { TimerFace } from '../../components/TimerFace'
import { getExercise, PROGRAM } from '../../data/program'
import type { AppSettings, Session } from '../../data/types'
import { useMorningLogs } from '../../db/hooks'
import { repo } from '../../db/repo'
import { morningStreak } from '../../lib/logic'
import { completeSession } from '../../lib/session'
import { sounds, unlockAudio } from '../../timers/audio'
import { useCountdown } from '../../timers/useCountdown'
import { ExerciseHeader, PlayerShell } from './shared'

export default function MorningPlayer({ session }: { session: Session; settings: AppSettings }) {
  const nav = useNavigate()
  const moves = PROGRAM.morning.moves
  const [i, setI] = useState(0)
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const morning = useMorningLogs()
  const move = moves[Math.min(i, moves.length - 1)]
  const ex = getExercise(move.exerciseId)

  const cd = useCountdown(move.seconds, {
    onDone: () => {
      if (i + 1 < moves.length) setI(i + 1)
      else { setFinished(true); sounds.finish() }
    },
  })
  // Auto-start the next move's countdown when the index changes.
  const startRef = useRef(cd.start)
  startRef.current = cd.start
  useEffect(() => { if (started && !finished) startRef.current(moves[i].seconds) }, [i, started, finished, moves])

  const finish = async () => {
    await completeSession(session, undefined)
    nav('/')
  }
  const discard = async () => { await repo.deleteSession(session.id); nav('/') }
  const streak = morning ? morningStreak(morning) : undefined
  const total = moves.reduce((a, m) => a + m.seconds, 0)
  const doneSec = moves.slice(0, i).reduce((a, m) => a + m.seconds, 0) + (started ? move.seconds - cd.remaining : 0)

  if (finished) {
    return (
      <PlayerShell session={session} title="Morning wake-up" progress={1}>
        <div className="text-center pt-10 rise">
          <div className="eyebrow">Done</div>
          <div className="display text-6xl text-hot mt-2">Awake.</div>
          {streak && <div className="mt-6"><div className="num text-5xl">{streak.current + (streak.doneToday ? 0 : 1)}</div><div className="eyebrow">day streak</div></div>}
        </div>
        <Button variant="primary" size="xl" full onClick={finish}>Mark done</Button>
      </PlayerShell>
    )
  }

  return (
    <PlayerShell session={session} title="Morning wake-up" sub={`Move ${i + 1} of ${moves.length}`} progress={doneSec / total}>
      <Card className={`rise ${cd.running ? 'border-hot/40' : ''}`}>
        <ExerciseHeader exercise={ex} label={String(i + 1)} prescription={`${move.seconds}s`} compact />
      </Card>
      <Card className="rise d1">
        <TimerFace remaining={started ? cd.remaining : move.seconds} total={move.seconds} tone="hot" size="xl" label={i + 1 < moves.length ? `Next: ${getExercise(moves[i + 1].exerciseId).name}` : 'Last move'} />
      </Card>
      {!started ? (
        <Button variant="primary" size="xl" full className="rise d2" onClick={() => { unlockAudio(); setStarted(true) }}>Start · ~{Math.round(total / 60)} min</Button>
      ) : (
        <div className="grid grid-cols-3 gap-2 rise d2">
          <Button size="lg" disabled={i === 0} onClick={() => setI(i - 1)}>← Back</Button>
          <Button size="lg" onClick={() => (cd.running ? cd.pause() : cd.resume())}>{cd.running ? 'Pause' : 'Resume'}</Button>
          <Button size="lg" onClick={() => (i + 1 < moves.length ? setI(i + 1) : setFinished(true))}>Skip →</Button>
        </div>
      )}
      <div className="flex gap-2">
        <Button full variant="ghost" onClick={() => setFinished(true)}>Finish now</Button>
        <Button full variant="danger" onClick={discard}>Cancel</Button>
      </div>
    </PlayerShell>
  )
}
