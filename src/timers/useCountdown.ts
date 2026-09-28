import { useCallback, useEffect, useRef, useState } from 'react'
import { sounds } from './audio'
import { buzz } from './vibrate'

export interface Countdown {
  remaining: number       // seconds (float)
  total: number
  running: boolean
  done: boolean
  start: (seconds?: number) => void
  pause: () => void
  resume: () => void
  reset: (seconds?: number) => void
  adjust: (deltaSec: number) => void
  stop: () => void
}

/**
 * Wall-clock based countdown (survives background tab throttling). Ticks the
 * last 3 seconds and fires `onDone` once when it hits zero.
 */
export function useCountdown(initialSec: number, opts: { onDone?: () => void; ticks?: boolean; autoStart?: boolean } = {}): Countdown {
  const [total, setTotal] = useState(initialSec)
  const [remaining, setRemaining] = useState(initialSec)
  const [running, setRunning] = useState(!!opts.autoStart)
  const [done, setDone] = useState(false)
  const endAt = useRef<number | null>(opts.autoStart ? Date.now() + initialSec * 1000 : null)
  const lastTick = useRef<number>(-1)
  const onDoneRef = useRef(opts.onDone)
  onDoneRef.current = opts.onDone
  const ticks = opts.ticks !== false

  useEffect(() => {
    if (!running) return
    let raf = 0
    const loop = () => {
      const end = endAt.current
      if (end == null) return
      const rem = (end - Date.now()) / 1000
      setRemaining(Math.max(0, rem))
      const whole = Math.ceil(rem)
      if (ticks && whole <= 3 && whole >= 1 && whole !== lastTick.current) { lastTick.current = whole; sounds.tick() }
      if (rem <= 0) {
        setRunning(false); setDone(true); endAt.current = null
        sounds.go(); buzz.go()
        onDoneRef.current?.()
        return
      }
      raf = window.setTimeout(loop, 200)
    }
    loop()
    return () => window.clearTimeout(raf)
  }, [running, ticks])

  const start = useCallback((seconds?: number) => {
    const s = seconds ?? total
    setTotal(s); setRemaining(s); setDone(false); lastTick.current = -1
    endAt.current = Date.now() + s * 1000
    setRunning(true)
  }, [total])
  const pause = useCallback(() => {
    if (endAt.current == null) return
    setRemaining(Math.max(0, (endAt.current - Date.now()) / 1000))
    endAt.current = null; setRunning(false)
  }, [])
  const resume = useCallback(() => {
    if (running || remaining <= 0) return
    endAt.current = Date.now() + remaining * 1000; setRunning(true)
  }, [running, remaining])
  const reset = useCallback((seconds?: number) => {
    const s = seconds ?? total
    endAt.current = null; setRunning(false); setDone(false); setTotal(s); setRemaining(s); lastTick.current = -1
  }, [total])
  const adjust = useCallback((delta: number) => {
    setTotal((t) => Math.max(5, t + delta))
    if (endAt.current != null) {
      endAt.current = Math.max(Date.now() + 1000, endAt.current + delta * 1000)
      setRemaining(Math.max(0, (endAt.current - Date.now()) / 1000))
    } else {
      setRemaining((r) => Math.max(1, r + delta))
    }
  }, [])
  const stop = useCallback(() => { endAt.current = null; setRunning(false); setDone(false) }, [])

  return { remaining, total, running, done, start, pause, resume, reset, adjust, stop }
}

/** Count-up stopwatch in seconds from a start ISO timestamp. */
export function useElapsed(startedAt: string | undefined, active = true): number {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    if (!active) return
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [active])
  if (!startedAt) return 0
  return Math.max(0, (now - new Date(startedAt).getTime()) / 1000)
}
