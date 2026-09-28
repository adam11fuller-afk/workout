const pad = (n: number) => String(n).padStart(2, '0')

/** Local YYYY-MM-DD */
export function dateKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
export const todayKey = () => dateKey()

export function parseKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(key: string, n: number): string {
  const d = parseKey(key)
  d.setDate(d.getDate() + n)
  return dateKey(d)
}

export function daysBetween(a: string, b: string): number {
  return Math.round((parseKey(b).getTime() - parseKey(a).getTime()) / 86_400_000)
}

/** 0 = Sunday … 6 = Saturday */
export const weekday = (d: Date = new Date()) => d.getDay()

export const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/** ISO-8601 week key, e.g. 2026-W39 */
export function isoWeekKey(d: Date = new Date()): string {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const day = t.getUTCDay() || 7
  t.setUTCDate(t.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((t.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7)
  return `${t.getUTCFullYear()}-W${pad(week)}`
}

export function fmtDuration(totalSec: number): string {
  const s = Math.max(0, Math.round(totalSec))
  const m = Math.floor(s / 60)
  const h = Math.floor(m / 60)
  if (h > 0) return `${h}h ${pad(m % 60)}m`
  return `${m}:${pad(s % 60)}`
}

export function fmtClock(totalSec: number): string {
  const s = Math.max(0, Math.ceil(totalSec))
  return `${Math.floor(s / 60)}:${pad(s % 60)}`
}

export function fmtDateShort(key: string): string {
  const d = parseKey(key)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
export function fmtDateLong(key: string): string {
  const d = parseKey(key)
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}
export function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}
