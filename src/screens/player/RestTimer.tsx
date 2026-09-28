import { Button } from '../../components/Button'
import { TimerFace } from '../../components/TimerFace'
import { useCountdown } from '../../timers/useCountdown'

export function RestTimer({ seconds, nextLabel, onDone, onSkip, label = 'Rest' }:
  { seconds: number; nextLabel?: string; onDone: () => void; onSkip: () => void; label?: string }) {
  const cd = useCountdown(seconds, { autoStart: true, onDone })
  return (
    <div className="card p-5 border-cool/40 rise">
      <TimerFace remaining={cd.remaining} total={cd.total} tone="cool" label={label} size="xl">
        <div className="grid grid-cols-3 gap-2 w-full mt-1">
          <Button size="lg" onClick={() => cd.adjust(-15)}>−15s</Button>
          <Button size="lg" onClick={() => (cd.running ? cd.pause() : cd.resume())}>{cd.running ? 'Pause' : 'Resume'}</Button>
          <Button size="lg" onClick={() => cd.adjust(15)}>+15s</Button>
        </div>
      </TimerFace>
      {nextLabel && (
        <div className="mt-4 text-center">
          <div className="eyebrow">Up next</div>
          <div className="display text-2xl mt-0.5">{nextLabel}</div>
        </div>
      )}
      <Button variant="cool" size="xl" full className="mt-4" onClick={onSkip}>Skip rest</Button>
    </div>
  )
}
