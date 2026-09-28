import type { Muscle } from '../data/types'

export function MuscleTags({ muscles, className = '' }: { muscles: Muscle[]; className?: string }) {
  return (
    <div className={`text-ink-3 text-xs font-display font-semibold uppercase tracking-wider ${className}`}>
      {muscles.join(' · ')}
    </div>
  )
}
