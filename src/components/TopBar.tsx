import type { ReactNode } from 'react'
import { Link } from 'react-router'

export function TopBar({ eyebrow, title, back, right, sub }: { eyebrow?: string; title: ReactNode; back?: string; right?: ReactNode; sub?: ReactNode }) {
  return (
    <header className="px-4 pt-4 pb-3 flex items-end justify-between gap-3">
      <div className="min-w-0">
        {back && (
          <Link to={back} className="inline-flex items-center gap-1 text-ink-2 h-9 -ml-1 pr-2 text-sm font-medium">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
            Back
          </Link>
        )}
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1 className="display text-4xl text-ink mt-0.5 truncate">{title}</h1>
        {sub && <div className="text-ink-2 text-sm mt-1">{sub}</div>}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </header>
  )
}
