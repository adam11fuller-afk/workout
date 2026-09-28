import type { HTMLAttributes, ReactNode } from 'react'

export function Card({ className = '', children, ...rest }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return <div {...rest} className={`card p-4 ${className}`}>{children}</div>
}

export function Banner({ tone, title, children, onDismiss }: { tone: 'warn' | 'info' | 'hot' | 'ok'; title: string; children?: ReactNode; onDismiss?: () => void }) {
  const cls = {
    warn: 'border-warn/50 bg-warn/10 text-warn',
    info: 'border-info/50 bg-info/10 text-info',
    hot: 'border-hot/50 bg-hot/10 text-hot',
    ok: 'border-ok/50 bg-ok/10 text-ok',
  }[tone]
  return (
    <div className={`rounded-card border px-4 py-3 flex gap-3 items-start ${cls}`}>
      <div className="flex-1 min-w-0">
        <div className="font-display font-bold uppercase tracking-wide text-base">{title}</div>
        {children && <div className="text-sm text-ink-2 mt-0.5">{children}</div>}
      </div>
      {onDismiss && (
        <button type="button" onClick={onDismiss} aria-label="dismiss" className="h-9 w-9 -mr-2 -mt-1 flex items-center justify-center text-current/70">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      )}
    </div>
  )
}

export function Tag({ children, tone = 'default' }: { children: ReactNode; tone?: 'default' | 'hot' | 'cool' | 'ok' | 'warn' | 'info' }) {
  const cls = {
    default: 'border-line-2 text-ink-2',
    hot: 'border-hot/60 text-hot',
    cool: 'border-cool/60 text-cool',
    ok: 'border-ok/60 text-ok',
    warn: 'border-warn/60 text-warn',
    info: 'border-info/60 text-info',
  }[tone]
  return <span className={`inline-flex items-center h-6 px-2 rounded-md border text-[11px] font-display font-semibold uppercase tracking-wider ${cls}`}>{children}</span>
}
