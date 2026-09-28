import type { RepScheme, WeightsSlot } from '../data/types'

export type Units = 'lb' | 'kg'
const LB_PER_KG = 2.2046226218

export function toDisplayWeight(lb: number, units: Units): number {
  return units === 'kg' ? Math.round((lb / LB_PER_KG) * 2) / 2 : lb
}
export function fromDisplayWeight(v: number, units: Units): number {
  return units === 'kg' ? Math.round(v * LB_PER_KG * 2) / 2 : v
}
export function fmtWeight(lb: number | undefined, units: Units): string {
  if (lb === undefined || lb === null || Number.isNaN(lb)) return '—'
  const v = toDisplayWeight(lb, units)
  return `${Number.isInteger(v) ? v : v.toFixed(1)} ${units}`
}
/** Stepper increment in display units (5 lb / 2 kg) */
export const weightStep = (units: Units) => (units === 'kg' ? 2 : 5)

export function repSchemeLabel(r: RepScheme, slot?: Pick<WeightsSlot, 'perSide' | 'repLabel'>): string {
  let base: string
  switch (r.type) {
    case 'range': base = `${r.min}–${r.max}`; break
    case 'fixed': base = `${r.reps}`; break
    case 'amrap': base = Array.isArray(r.minus) ? `AMRAP −${r.minus[0]}–${r.minus[1]}` : `AMRAP −${r.minus}`; break
  }
  if (slot?.repLabel) base += ` ${slot.repLabel}`
  if (slot?.perSide) base += ' / side'
  return base
}

export function prescriptionLabel(slot: WeightsSlot, sets: number): string {
  return `${sets} × ${repSchemeLabel(slot.reps, slot)}`
}

export function repTargetMin(r: RepScheme): number {
  switch (r.type) {
    case 'range': return r.min
    case 'fixed': return r.reps
    case 'amrap': return 5
  }
}
export function repTargetMax(r: RepScheme): number | undefined {
  switch (r.type) {
    case 'range': return r.max
    case 'fixed': return r.reps
    case 'amrap': return undefined
  }
}

export const plural = (n: number, s: string, p = `${s}s`) => `${n} ${n === 1 ? s : p}`
