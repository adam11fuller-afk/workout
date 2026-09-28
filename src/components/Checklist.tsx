import { useState } from 'react'
import type { WarmupStep } from '../data/types'
import { getExercise } from '../data/program'
import { Cues } from './Cues'
import { DemoLink } from './Demo'
import { fmtClock } from '../lib/dates'

export function Checklist({ steps, done, onToggle }: { steps: WarmupStep[]; done: boolean[]; onToggle: (i: number) => void }) {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <ul className="divide-y divide-line">
      {steps.map((s, i) => {
        const ex = s.exerciseId ? getExercise(s.exerciseId) : undefined
        const isDone = !!done[i]
        return (
          <li key={i} className="py-1">
            <div className="flex items-center gap-3">
              <button
                type="button" onClick={() => onToggle(i)} aria-pressed={isDone}
                className={`h-12 w-12 shrink-0 rounded-xl border flex items-center justify-center transition-colors
                  ${isDone ? 'bg-ok border-ok text-black' : 'border-line-2 bg-bg-3 text-transparent'}`}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
              </button>
              <button type="button" className="flex-1 min-w-0 text-left h-12" onClick={() => ex && setOpen(open === i ? null : i)}>
                <div className={`font-semibold ${isDone ? 'text-ink-3 line-through' : 'text-ink'}`}>{s.label}</div>
                <div className="text-xs text-ink-3">{[s.detail, s.seconds ? fmtClock(s.seconds) : undefined].filter(Boolean).join(' · ')}</div>
              </button>
              {ex && <DemoLink exercise={ex} />}
            </div>
            {open === i && ex && <Cues cues={ex.cues} className="pl-15 pb-3 pt-1" />}
          </li>
        )
      })}
    </ul>
  )
}
