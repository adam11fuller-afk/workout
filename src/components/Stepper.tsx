import { useRef, useState } from 'react'

interface Props {
  label: string
  value: number
  onChange: (v: number) => void
  step: number
  min?: number
  max?: number
  unit?: string
  /** allow typing a value by tapping the number */
  editable?: boolean
  size?: 'md' | 'lg'
  accent?: boolean
}

/** Big-thumb −/+ control. Hold a button to auto-repeat. */
export function Stepper({ label, value, onChange, step, min = 0, max = 9999, unit, editable = true, size = 'lg', accent }: Props) {
  const [editing, setEditing] = useState(false)
  const timer = useRef<number | null>(null)
  const clamp = (v: number) => Math.min(max, Math.max(min, Math.round(v * 100) / 100))

  const bump = (dir: 1 | -1) => onChange(clamp(value + dir * step))
  const startHold = (dir: 1 | -1) => {
    bump(dir)
    let delay = 380
    const tick = () => {
      bump(dir)
      delay = Math.max(70, delay * 0.8)
      timer.current = window.setTimeout(tick, delay)
    }
    timer.current = window.setTimeout(tick, 450)
  }
  const endHold = () => { if (timer.current) { window.clearTimeout(timer.current); timer.current = null } }

  const h = size === 'lg' ? 'h-16' : 'h-14'
  const numCls = size === 'lg' ? 'text-4xl' : 'text-3xl'
  return (
    <div className="flex flex-col gap-1.5">
      <span className="eyebrow">{label}</span>
      <div className={`flex items-stretch rounded-2xl border overflow-hidden ${accent ? 'border-hot/50' : 'border-line-2'} bg-bg-3`}>
        <button
          type="button" aria-label={`decrease ${label}`}
          className={`${h} w-16 shrink-0 text-3xl font-display text-ink-2 active:bg-line`}
          onPointerDown={(e) => { e.preventDefault(); startHold(-1) }} onPointerUp={endHold} onPointerLeave={endHold} onPointerCancel={endHold}
        >−</button>
        <div className="flex-1 flex items-center justify-center border-x border-line-2 min-w-0" onClick={() => editable && setEditing(true)}>
          {editing ? (
            <input
              autoFocus type="number" inputMode="decimal" step={step} defaultValue={value}
              className={`num ${numCls} w-full bg-transparent text-center outline-none`}
              onBlur={(e) => { const v = parseFloat(e.target.value); if (!Number.isNaN(v)) onChange(clamp(v)); setEditing(false) }}
              onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
            />
          ) : (
            <div className="flex items-baseline gap-1.5">
              <span className={`num ${numCls} ${accent ? 'text-hot' : 'text-ink'}`}>{Number.isInteger(value) ? value : value.toFixed(1)}</span>
              {unit && <span className="eyebrow">{unit}</span>}
            </div>
          )}
        </div>
        <button
          type="button" aria-label={`increase ${label}`}
          className={`${h} w-16 shrink-0 text-3xl font-display text-ink-2 active:bg-line`}
          onPointerDown={(e) => { e.preventDefault(); startHold(1) }} onPointerUp={endHold} onPointerLeave={endHold} onPointerCancel={endHold}
        >+</button>
      </div>
    </div>
  )
}
