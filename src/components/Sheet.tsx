import { useEffect, type ReactNode } from 'react'

export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title?: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-bg-2 border-t border-line-2 rounded-t-3xl max-h-[88dvh] flex flex-col rise safe-b">
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <div className="w-10 h-1.5 rounded-full bg-line-2 absolute left-1/2 -translate-x-1/2 top-2" />
          <div className="display text-2xl mt-2">{title}</div>
          <button type="button" onClick={onClose} aria-label="close" className="h-11 w-11 -mr-2 mt-1 flex items-center justify-center text-ink-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
        <div className="overflow-y-auto px-4 pb-6">{children}</div>
      </div>
    </div>
  )
}
