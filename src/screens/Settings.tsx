import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Segmented } from '../components/Segmented'
import { Stepper } from '../components/Stepper'
import { TopBar } from '../components/TopBar'
import type { ExportBundle, KbPhase, SprintVariant } from '../data/types'
import { useSettings } from '../db/hooks'
import { repo } from '../db/repo'
import { todayKey } from '../lib/dates'
import { isDeloadWeek, programWeek } from '../lib/logic'

export default function Settings() {
  const s = useSettings()
  const fileRef = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState<string | null>(null)
  if (!s) return null

  const exportJson = async () => {
    const bundle = await repo.exportAll()
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `workout-backup-${todayKey()}.json`; a.click()
    setTimeout(() => URL.revokeObjectURL(url), 5000)
    setMsg(`Exported ${bundle.sessions.length} sessions, ${bundle.setLogs.length} sets.`)
  }
  const importJson = async (file: File) => {
    try {
      const bundle = JSON.parse(await file.text()) as ExportBundle
      if (bundle.app !== 'workout') throw new Error('Not a Workout backup')
      if (!confirm(`Replace everything on this device with ${bundle.sessions?.length ?? 0} sessions from ${bundle.exportedAt?.slice(0, 10)}?`)) return
      await repo.importAll(bundle)
      setMsg('Import complete.')
    } catch (e) {
      setMsg(`Import failed: ${(e as Error).message}`)
    }
  }

  return (
    <div>
      <TopBar title="Settings" />
      <div className="px-4 space-y-4">
        <Card className="space-y-4">
          <div className="eyebrow">Program</div>
          <label className="block">
            <span className="eyebrow block mb-1.5">Program start date (for deload counting)</span>
            <input
              type="date" value={s.programStartDate} max={todayKey()}
              onChange={(e) => e.target.value && repo.saveSettings({ programStartDate: e.target.value })}
              className="w-full h-14 rounded-xl border border-line-2 bg-bg-3 px-4 num text-xl"
            />
            <span className="text-ink-3 text-xs mt-1 block">
              Week {programWeek(s.programStartDate)} now{isDeloadWeek(s.programStartDate) ? ' · deload week' : ''}. Every 4th week is a deload.
            </span>
          </label>
          <Segmented<KbPhase>
            label="Kettlebell phase"
            options={[{ value: 'beginner', label: 'Beginner', hint: 'two-hand · half get-ups' }, { value: 'standard', label: 'Standard', hint: 'one-arm · full get-ups' }]}
            value={s.kbPhase} onChange={(v) => v && repo.saveSettings({ kbPhase: v })}
          />
          <Toggle label="Snatches in KB-B intervals" hint="Only once swing and clean are solid. Standard phase only." value={s.snatchEnabled} onChange={(v) => repo.saveSettings({ snatchEnabled: v })} />
          <Stepper label="Sprint reps (current prescription)" value={s.sprintReps} step={1} min={4} max={8} onChange={(v) => repo.saveSettings({ sprintReps: v })} size="md" />
          <Segmented<SprintVariant>
            label="Sprint variant"
            options={[{ value: 'flat', label: 'Flat', hint: '15s' }, { value: 'hill', label: 'Hills' }, { value: 'long', label: 'Long', hint: '20s' }]}
            value={s.sprintVariant} onChange={(v) => v && repo.saveSettings({ sprintVariant: v })}
          />
        </Card>

        <Card className="space-y-4">
          <div className="eyebrow">Timers & feedback</div>
          <Stepper label="Default rest timer" value={s.restTimerSec} step={15} min={15} max={300} unit="sec" onChange={(v) => repo.saveSettings({ restTimerSec: v })} size="md" />
          <Toggle label="Sound" value={s.soundEnabled} onChange={(v) => repo.saveSettings({ soundEnabled: v })} />
          <Toggle label="Vibration" hint="Android only. iPhones ignore web vibration." value={s.vibrationEnabled} onChange={(v) => repo.saveSettings({ vibrationEnabled: v })} />
          <Segmented<'lb' | 'kg'> label="Units" options={[{ value: 'lb', label: 'lb' }, { value: 'kg', label: 'kg' }]} value={s.units} onChange={(v) => v && repo.saveSettings({ units: v })} />
        </Card>

        <Card className="space-y-3">
          <div className="eyebrow">Data</div>
          <Link to="/bodyweight" className="block"><Button full size="lg">Bodyweight log</Button></Link>
          <div className="flex gap-2">
            <Button full size="lg" onClick={exportJson}>Export JSON</Button>
            <Button full size="lg" onClick={() => fileRef.current?.click()}>Import JSON</Button>
            <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void importJson(f); e.target.value = '' }} />
          </div>
          {msg && <div className="text-sm text-ink-2">{msg}</div>}
          <Button variant="danger" full onClick={async () => { if (confirm('Delete ALL local data? Export first if you want a backup.')) { await repo.wipe(); setMsg('Wiped.') } }}>
            Wipe all data
          </Button>
        </Card>

        <div className="text-ink-3 text-xs px-1 pb-4">
          Everything is stored on this device (IndexedDB). Export a backup now and then. Add to Home Screen for the full-screen, offline app.
        </div>
      </div>
    </div>
  )
}

export function Toggle({ label, hint, value, onChange }: { label: string; hint?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!value)} className="w-full flex items-center justify-between gap-3 min-h-12 text-left" aria-pressed={value}>
      <div>
        <div className="font-semibold">{label}</div>
        {hint && <div className="text-ink-3 text-xs">{hint}</div>}
      </div>
      <span className={`relative h-8 w-14 rounded-full border transition-colors ${value ? 'bg-hot border-hot' : 'bg-bg-3 border-line-2'}`}>
        <span className={`absolute top-0.5 h-6.5 w-6.5 rounded-full bg-ink transition-transform ${value ? 'translate-x-7' : 'translate-x-0.5'}`} />
      </span>
    </button>
  )
}
