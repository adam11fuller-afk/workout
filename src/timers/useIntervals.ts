import { useEffect, useRef } from 'react'
import { sounds } from './audio'
import { buzz } from './vibrate'
import { useCountdown, type Countdown } from './useCountdown'

export interface IntervalState extends Countdown {
  elapsed: number
  /** 'on' during work, 'off' during rest. With offSec = 0 it is always 'on'. */
  phase: 'on' | 'off'
  /** 1-based current round */
  round: number
  rounds: number
  /** seconds left in the current on/off segment */
  segmentRemaining: number
  segmentTotal: number
}

/**
 * Work/rest cycles over a fixed total: EMOM (60/0), 15/15 intervals, bag
 * rounds (60/60). Plays distinct sounds on each transition.
 */
export function useIntervals(onSec: number, offSec: number, totalSec: number, opts: { onDone?: () => void; onRound?: (round: number) => void } = {}): IntervalState {
  const cd = useCountdown(totalSec, { onDone: opts.onDone, ticks: false })
  const cycle = onSec + offSec
  const elapsed = Math.max(0, cd.total - cd.remaining)
  const inCycle = elapsed % cycle
  const rounds = Math.ceil(totalSec / cycle)
  const phase: 'on' | 'off' = offSec === 0 || inCycle < onSec ? 'on' : 'off'
  const round = Math.min(rounds, Math.floor(elapsed / cycle) + 1)
  const segmentTotal = phase === 'on' ? onSec : offSec
  const segmentRemaining = phase === 'on' ? onSec - inCycle : cycle - inCycle

  const lastKey = useRef<string>('')
  const onRoundRef = useRef(opts.onRound)
  onRoundRef.current = opts.onRound
  useEffect(() => {
    if (!cd.running) return
    const key = `${round}:${phase}`
    if (lastKey.current === key) return
    const first = lastKey.current === ''
    lastKey.current = key
    if (first) return
    if (phase === 'on') {
      if (offSec === 0) sounds.minute(); else sounds.workOn()
      buzz.go()
      onRoundRef.current?.(round)
    } else {
      sounds.workOff(); buzz.short()
    }
  }, [round, phase, cd.running, offSec])
  useEffect(() => { if (!cd.running && cd.remaining === cd.total) lastKey.current = '' }, [cd.running, cd.remaining, cd.total])

  return { ...cd, elapsed, phase, round, rounds, segmentRemaining, segmentTotal }
}
