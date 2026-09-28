import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { Button } from '../components/Button'
import { Card, Tag } from '../components/Card'
import { Cues } from '../components/Cues'
import { Demo } from '../components/Demo'
import { LineChart } from '../components/LineChart'
import { MuscleTags } from '../components/MuscleTags'
import { Stepper } from '../components/Stepper'
import { TopBar } from '../components/TopBar'
import { EXERCISES, PROGRAM } from '../data/program'
import type { ExerciseSettings } from '../data/types'
import { useExerciseSettings, useHistoryIndex, useSettings } from '../db/hooks'
import { repo } from '../db/repo'
import { fmtDateShort } from '../lib/dates'
import { fmtWeight, fromDisplayWeight, plural, toDisplayWeight, weightStep } from '../lib/format'
import { groupExerciseHistory, sessionMap } from '../lib/logic'
import { parseYoutubeId } from '../lib/youtube'
import { fmtSet } from './player/shared'

export default function ExerciseDetail() {
  const { exerciseId = '' } = useParams()
  const ex = EXERCISES[exerciseId]
  const settings = useSettings()
  const ov = useExerciseSettings(exerciseId)
  const { sessions, logs, ready } = useHistoryIndex()
  const [url, setUrl] = useState('')
  useEffect(() => { setUrl(ov?.pinnedVideoUrl ?? '') }, [ov?.pinnedVideoUrl])
  if (!ex) return <div className="p-6">Unknown exercise.</div>
  if (!settings || !ready) return null
  const units = settings.units

  // Seed prescription (first slot found) for the rep-range editor defaults.
  const seedSlot = PROGRAM.weights.flatMap((w) => w.blocks.flatMap((b) => b.slots)).find((s) => s.exerciseId === exerciseId)
  const seedRange = seedSlot?.reps.type === 'range' ? { min: seedSlot.reps.min, max: seedSlot.reps.max } : seedSlot?.reps.type === 'fixed' ? { min: seedSlot.reps.reps, max: seedSlot.reps.reps } : undefined
  const save = (patch: Partial<ExerciseSettings>) => repo.saveExerciseSettings({ exerciseId, ...(ov ?? {}), ...patch })
  const pinId = url ? parseYoutubeId(url) : null
  const edited = !!(ov?.targetWeightLb || ov?.repRange || ov?.sets)

  const history = groupExerciseHistory(logs!.filter((l) => l.exerciseId === exerciseId), sessionMap(sessions!))
  const weightPts = history.filter((h) => h.topWeight != null).map((h) => ({ x: h.date, y: toDisplayWeight(h.topWeight!, units) }))
  const repPts = history.map((h) => ({ x: h.date, y: h.totalReps }))

  return (
    <div>
      <TopBar back="/program" title={ex.name} eyebrow={ex.kind} sub={<MuscleTags muscles={ex.muscles} />} />
      <div className="px-4 space-y-4">
        <Card className="space-y-3">
          {ex.note && <div className="text-warn text-sm">{ex.note}</div>}
          <Cues cues={ex.cues} />
          <Demo exercise={ex} />
        </Card>

        <Card className="space-y-3">
          <div className="eyebrow">Pin a demo video</div>
          <p className="text-ink-3 text-xs">Paste a YouTube link. It then plays inside the app instead of opening a search. Stored on this device, not in the program file.</p>
          <input
            value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://youtu.be/…" inputMode="url" autoCapitalize="off" autoCorrect="off"
            className="w-full h-12 rounded-xl border border-line-2 bg-bg-3 px-3 text-sm outline-none focus:border-hot"
          />
          <div className="flex gap-2">
            <Button full variant="primary" disabled={!pinId || url === (ov?.pinnedVideoUrl ?? '')} onClick={() => save({ pinnedVideoUrl: url.trim() })}>{pinId || !url ? 'Pin video' : 'Not a YouTube link'}</Button>
            {ov?.pinnedVideoUrl && <Button onClick={() => { void save({ pinnedVideoUrl: undefined }); setUrl('') }}>Unpin</Button>}
          </div>
        </Card>

        {(ex.kind === 'weighted' || seedSlot) && (
          <Card className="space-y-4">
            <div className="flex items-center justify-between"><div className="eyebrow">Overrides</div>{edited && <Tag tone="info">edited</Tag>}</div>
            {ex.kind === 'weighted' && (
              <Stepper label={`Target weight${ov?.targetWeightLb ? '' : ' (0 = use history)'}`} value={toDisplayWeight(ov?.targetWeightLb ?? 0, units)} step={weightStep(units)} min={0} max={500} unit={units}
                onChange={(v) => save({ targetWeightLb: v > 0 ? fromDisplayWeight(v, units) : undefined })} size="md" />
            )}
            {seedSlot && seedRange && seedSlot.reps.type !== 'amrap' && (
              <div className="grid grid-cols-2 gap-2">
                <Stepper label="Reps min" value={ov?.repRange?.min ?? seedRange.min} step={1} min={1} max={50} size="md"
                  onChange={(v) => save({ repRange: { min: v, max: Math.max(v, ov?.repRange?.max ?? seedRange.max) } })} />
                <Stepper label="Reps max" value={ov?.repRange?.max ?? seedRange.max} step={1} min={1} max={50} size="md"
                  onChange={(v) => save({ repRange: { min: Math.min(v, ov?.repRange?.min ?? seedRange.min), max: v } })} />
              </div>
            )}
            {seedSlot && (
              <Stepper label="Sets" value={ov?.sets ?? seedSlot.sets} step={1} min={1} max={6} size="md" onChange={(v) => save({ sets: v })} />
            )}
            {edited && (
              <Button full onClick={() => save({ targetWeightLb: undefined, repRange: undefined, sets: undefined })}>Reset to program defaults</Button>
            )}
          </Card>
        )}

        {history.length > 0 ? (
          <>
            <div className="eyebrow">History · {plural(history.length, "session")}</div>
            {weightPts.length > 0 && <LineChart title={`Top-set weight (${units})`} points={weightPts} />}
            <LineChart title="Total reps" points={repPts} color="var(--color-cool)" />
            <Card className="p-0 divide-y divide-line">
              {[...history].reverse().map((h) => (
                <div key={h.sessionId} className="px-4 py-2.5 flex items-start gap-3">
                  <div className="num text-xs text-ink-3 w-14 shrink-0 pt-0.5">{fmtDateShort(h.date)}</div>
                  <div className="flex-1 num text-sm text-ink-2 leading-snug">{[...h.sets].sort((a, b) => a.setIndex - b.setIndex).map((s) => fmtSet(s, units)).join(' · ')}</div>
                  <div className="num text-sm text-right shrink-0">{h.topWeight != null ? fmtWeight(h.topWeight, units).replace(/\s.*/, '') : ''}<div className="text-[10px] text-ink-3">{h.totalReps} reps</div></div>
                </div>
              ))}
            </Card>
          </>
        ) : (
          <div className="text-ink-3 text-sm pb-4">No completed sessions with this exercise yet.</div>
        )}
      </div>
    </div>
  )
}
