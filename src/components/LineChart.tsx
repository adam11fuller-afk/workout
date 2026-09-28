import { useRef, useState } from 'react'
import { fmtDateShort } from '../lib/dates'

export interface Pt { x: string; y: number }

/**
 * Single-series line chart (one axis, direct label on the last point, tap /
 * hover crosshair). Two measures of different scale → two of these stacked,
 * never a dual axis. `secondary` is for a same-scale overlay (e.g. rolling avg).
 */
export function LineChart({ points, unit = '', color = 'var(--color-hot)', height = 150, title, secondary }:
  { points: Pt[]; unit?: string; color?: string; height?: number; title: string; secondary?: { points: Pt[]; label: string; color?: string } }) {
  const W = 340, H = height, padL = 34, padR = 14, padT = 14, padB = 24
  const ref = useRef<SVGSVGElement>(null)
  const [hover, setHover] = useState<number | null>(null)
  const all = [...points, ...(secondary?.points ?? [])]
  if (points.length === 0) return <div className="card p-4 text-ink-3 text-sm">{title}: no data yet.</div>

  const ys = all.map((p) => p.y)
  let yMin = Math.min(...ys), yMax = Math.max(...ys)
  if (yMin === yMax) { yMin -= 1; yMax += 1 }
  const span = yMax - yMin
  yMin -= span * 0.1; yMax += span * 0.1
  const xs = [...new Set(all.map((p) => p.x))].sort()
  const xi = (x: string) => xs.indexOf(x)
  const X = (x: string) => padL + (xs.length === 1 ? (W - padL - padR) / 2 : (xi(x) / (xs.length - 1)) * (W - padL - padR))
  const Y = (y: number) => padT + (1 - (y - yMin) / (yMax - yMin)) * (H - padT - padB)
  const path = (pts: Pt[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${X(p.x).toFixed(1)},${Y(p.y).toFixed(1)}`).join(' ')
  const ticks = [yMin + (yMax - yMin) * 0.15, (yMin + yMax) / 2, yMax - (yMax - yMin) * 0.15].map((v) => Math.round(v * 10) / 10)
  const last = points[points.length - 1]
  const fmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1))

  const onMove = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect()
    const px = ((e.clientX - r.left) / r.width) * W
    let best = 0, bd = Infinity
    points.forEach((p, i) => { const d = Math.abs(X(p.x) - px); if (d < bd) { bd = d; best = i } })
    setHover(best)
  }
  const hp = hover != null ? points[hover] : null
  const tipX = hp ? Math.min(Math.max(padL, X(hp.x) - 44), W - padR - 88) : 0

  return (
    <div className="card p-3">
      <div className="flex items-baseline justify-between mb-1">
        <div className="eyebrow">{title}</div>
        {secondary && (
          <div className="flex items-center gap-3 text-[11px] text-ink-3">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: color }} />daily</span>
            <span className="flex items-center gap-1"><span className="h-0.5 w-3" style={{ background: secondary.color ?? 'var(--color-ink-2)' }} />{secondary.label}</span>
          </div>
        )}
      </div>
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} width="100%" style={{ touchAction: 'pan-y' }} onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={() => setHover(null)}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={padL} x2={W - padR} y1={Y(t)} y2={Y(t)} stroke="var(--color-line)" strokeWidth="1" />
            <text x={padL - 6} y={Y(t) + 3} textAnchor="end" fontSize="10" fill="var(--color-ink-3)" fontFamily="var(--font-mono)">{fmt(t)}</text>
          </g>
        ))}
        <text x={padL} y={H - 6} fontSize="10" fill="var(--color-ink-3)">{fmtDateShort(xs[0])}</text>
        {xs.length > 1 && <text x={W - padR} y={H - 6} fontSize="10" fill="var(--color-ink-3)" textAnchor="end">{fmtDateShort(xs[xs.length - 1])}</text>}
        {secondary && secondary.points.length > 1 && (
          <path d={path(secondary.points)} fill="none" stroke={secondary.color ?? 'var(--color-ink-2)'} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        )}
        {points.length > 1 && <path d={path(points)} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />}
        {points.map((p, i) => (
          <circle key={i} cx={X(p.x)} cy={Y(p.y)} r={hover === i ? 6 : 4} fill={color} stroke="var(--color-bg-2)" strokeWidth="2" />
        ))}
        {!hp && <text x={Math.min(X(last.x), W - padR - 2)} y={Y(last.y) - 9} textAnchor="end" fontSize="11" fill="var(--color-ink)" fontFamily="var(--font-mono)" fontWeight="700">{fmt(last.y)}{unit}</text>}
        {hp && (
          <g>
            <line x1={X(hp.x)} x2={X(hp.x)} y1={padT} y2={H - padB} stroke="var(--color-line-2)" strokeDasharray="3 3" />
            <rect x={tipX} y={2} width="88" height="18" rx="4" fill="var(--color-bg-3)" stroke="var(--color-line-2)" />
            <text x={tipX + 44} y={15} textAnchor="middle" fontSize="11" fill="var(--color-ink)" fontFamily="var(--font-mono)">{fmtDateShort(hp.x)} · {fmt(hp.y)}{unit}</text>
          </g>
        )}
      </svg>
    </div>
  )
}
