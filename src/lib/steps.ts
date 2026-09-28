// Flattens a weights workout into the order the player walks through:
// 1a set1 → 1b set1 → (rest) → 1a set2 → 1b set2 → (rest) … → 2a set1 …
import type { ExerciseSettings, RepScheme, WeightsWorkout } from '../data/types'
import { effectiveSlot } from './logic'

export interface WeightsStep {
  index: number
  blockIndex: number
  blockKey: string
  slotIndex: number
  setIndex: number
  sets: number
  exerciseId: string
  reps: RepScheme
  perSide?: boolean
  repLabel?: string
  /** superset label: "1a", "1b", "5" */
  label: string
  /** rest starts after this step */
  restAfter: number | null
}

export function buildWeightsSteps(w: WeightsWorkout, overrides: Map<string, ExerciseSettings>, deload: boolean): WeightsStep[] {
  const steps: WeightsStep[] = []
  w.blocks.forEach((block, blockIndex) => {
    const eff = block.slots.map((s) => ({ slot: s, e: effectiveSlot(s, overrides.get(s.exerciseId), deload) }))
    const maxSets = Math.max(...eff.map((x) => x.e.sets))
    for (let setIndex = 0; setIndex < maxSets; setIndex++) {
      const inRound = eff.map((x, slotIndex) => ({ x, slotIndex })).filter(({ x }) => setIndex < x.e.sets)
      inRound.forEach(({ x, slotIndex }, i) => {
        const last = i === inRound.length - 1
        steps.push({
          index: steps.length, blockIndex, blockKey: block.key, slotIndex, setIndex, sets: x.e.sets,
          exerciseId: x.slot.exerciseId, reps: x.e.reps, perSide: x.e.perSide, repLabel: x.e.repLabel,
          label: block.slots.length > 1 ? `${block.key}${'ab'[slotIndex]}` : block.key,
          restAfter: last ? (block.restSec ?? 60) : null,
        })
      })
    }
  })
  return steps
}
