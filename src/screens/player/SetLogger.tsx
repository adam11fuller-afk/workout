import { useState } from 'react'
import { Button } from '../../components/Button'
import { Segmented } from '../../components/Segmented'
import { Stepper } from '../../components/Stepper'
import { fromDisplayWeight, toDisplayWeight, weightStep, type Units } from '../../lib/format'

export interface SetValues { weightLb?: number; reps: number; rir?: number }

/**
 * Weight / reps / RIR entry for one set. Remount (key) per set so `initial`
 * re-seeds. Steppers only — no keyboard needed with sweaty hands.
 */
export function SetLogger({ weighted, units, initial, onLog, logged, side }:
  { weighted: boolean; units: Units; initial: SetValues; onLog: (v: SetValues) => void; logged: boolean; side?: string }) {
  const [weight, setWeight] = useState(toDisplayWeight(initial.weightLb ?? 0, units))
  const [reps, setReps] = useState(initial.reps)
  const [rir, setRir] = useState<number | undefined>(initial.rir)
  return (
    <div className="space-y-4">
      {weighted && (
        <Stepper label={`Weight${side ? ` · ${side}` : ''}`} value={weight} onChange={setWeight} step={weightStep(units)} min={0} max={500} unit={units} accent />
      )}
      <Stepper label="Reps" value={reps} onChange={setReps} step={1} min={0} max={200} />
      <Segmented<number>
        label="RIR · reps left in the tank (optional)"
        options={[0, 1, 2, 3, 4].map((n) => ({ value: n, label: String(n) }))}
        value={rir} onChange={setRir} clearable size="sm"
      />
      <Button
        variant={logged ? 'ok' : 'primary'} size="xl" full
        onClick={() => onLog({ weightLb: weighted ? fromDisplayWeight(weight, units) : undefined, reps, rir })}
      >
        {logged ? 'Update set' : 'Log set'}
      </Button>
    </div>
  )
}
