interface Props<T extends string | number> {
  label?: string
  options: { value: T; label: string; hint?: string }[]
  value: T | undefined
  onChange: (v: T | undefined) => void
  /** tapping the active option clears it */
  clearable?: boolean
  size?: 'sm' | 'md'
}

export function Segmented<T extends string | number>({ label, options, value, onChange, clearable, size = 'md' }: Props<T>) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className="eyebrow">{label}</span>}
      <div className="flex rounded-xl border border-line-2 bg-bg-3 overflow-hidden">
        {options.map((o) => {
          const active = o.value === value
          return (
            <button
              key={String(o.value)} type="button"
              onClick={() => onChange(active && clearable ? undefined : o.value)}
              className={`flex-1 ${size === 'md' ? 'h-12' : 'h-10'} flex flex-col items-center justify-center font-display uppercase tracking-wide
                ${active ? 'bg-hot text-hot-ink' : 'text-ink-2 active:bg-line'} border-r border-line-2 last:border-r-0`}
            >
              <span className={size === 'md' ? 'text-lg leading-none' : 'text-sm leading-none'}>{o.label}</span>
              {o.hint && <span className={`text-[10px] leading-none mt-0.5 ${active ? 'text-hot-ink/70' : 'text-ink-3'}`}>{o.hint}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
