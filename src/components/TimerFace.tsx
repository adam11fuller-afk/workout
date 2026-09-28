import type { ReactNode } from 'react'
import { fmtClock } from '../lib/dates'

/**
 * Big countdown face: mono numerals + progress track. `tone` colors the whole
 * thing — hot for work, cool for rest.
 */
export function TimerFace({ remaining, total, label, tone = 'cool', children, size = 'lg' }:
  { remaining: number; total: number; label?: ReactNode; tone?: 'cool' | 'hot' | 'warn'; children?: ReactNode; size?: 'lg' | 'xl' }) {
  const pct = total > 0 ? Math.max(0, Math.min(1, remaining / total)) : 0
  const color = { cool: 'text-cool', hot: 'text-hot', warn: 'text-warn' }[tone]
  const bar = { cool: 'bg-cool', hot: 'bg-hot', warn: 'bg-warn' }[tone]
  return (
    <div className="flex flex-col items-center gap-3">
      {label && <div className="eyebrow">{label}</div>}
      <div className={`num ${size === 'xl' ? 'text-[5.5rem]' : 'text-7xl'} leading-none ${color}`}>{fmtClock(remaining)}</div>
      <div className="w-full h-2 rounded-full bg-bg-3 overflow-hidden">
        <div className={`h-full ${bar} transition-[width] duration-200`} style={{ width: `${pct * 100}%` }} />
      </div>
      {children}
    </div>
  )
}
