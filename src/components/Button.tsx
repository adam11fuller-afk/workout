import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'cool' | 'ok'
type Size = 'sm' | 'md' | 'lg' | 'xl'

const V: Record<Variant, string> = {
  primary: 'bg-hot text-hot-ink active:bg-hot-2 border border-hot',
  secondary: 'bg-bg-3 text-ink border border-line-2 active:bg-line',
  ghost: 'bg-transparent text-ink-2 border border-transparent active:bg-bg-3',
  danger: 'bg-transparent text-bad border border-bad/40 active:bg-bad/10',
  cool: 'bg-cool text-cool-ink border border-cool active:brightness-110',
  ok: 'bg-ok text-black border border-ok active:brightness-110',
}
const S: Record<Size, string> = {
  sm: 'h-10 px-3 text-sm rounded-lg',
  md: 'h-12 px-4 text-base rounded-xl',
  lg: 'h-14 px-5 text-lg rounded-xl',
  xl: 'h-16 px-6 text-xl rounded-2xl',
}

export function Button({
  variant = 'secondary', size = 'md', full, className = '', children, ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size; full?: boolean; children: ReactNode }) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-2 font-display font-semibold uppercase tracking-wide select-none
        transition-[transform,background-color,filter] duration-100 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none
        ${V[variant]} ${S[size]} ${full ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  )
}
