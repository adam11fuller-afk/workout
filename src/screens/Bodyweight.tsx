import { useState } from 'react'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { LineChart } from '../components/LineChart'
import { Stepper } from '../components/Stepper'
import { TopBar } from '../components/TopBar'
import { useQuery, useSettings } from '../db/hooks'
import { repo, uid } from '../db/repo'
import { addDays, fmtDateShort, todayKey } from '../lib/dates'
import { fmtWeight, fromDisplayWeight, toDisplayWeight } from '../lib/format'
import { rolling7 } from '../lib/logic'

export default function Bodyweight() {
  const settings = useSettings()
  const entries = useQuery(() => repo.listBodyweight())
  const [date, setDate] = useState(todayKey())
  const [w, setW] = useState<number | null>(null)
  if (!settings || !entries) return null
  const units = settings.units
  const last = entries[entries.length - 1]
  const value = w ?? toDisplayWeight(entries.find((e) => e.date === date)?.weightLb ?? last?.weightLb ?? 180, units)
  const series = rolling7(entries)
  const avgNow = series[series.length - 1]?.avg
  const weekAgo = series.filter((s) => s.date <= addDays(todayKey(), -7)).at(-1)?.avg
  const delta = avgNow != null && weekAgo != null ? avgNow - weekAgo : undefined
  const deltaLabel = delta == null ? '—' : `${delta > 0 ? '+' : delta < 0 ? '−' : ''}${toDisplayWeight(Math.abs(delta), units).toFixed(1)}`

  const save = async () => {
    const existing = entries.find((e) => e.date === date)
    await repo.upsertBodyweight({ id: existing?.id ?? uid(), date, weightLb: fromDisplayWeight(value, units) })
    setW(null)
  }

  return (
    <div>
      <TopBar back="/settings" title="Bodyweight" eyebrow="Judge by weekly averages" />
      <div className="px-4 space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <Card><div className="eyebrow">7-day avg</div><div className="num text-3xl mt-1">{avgNow != null ? fmtWeight(avgNow, units).replace(/\s.*/, '') : '—'}<span className="eyebrow ml-1">{units}</span></div></Card>
          <Card><div className="eyebrow">vs last week</div><div className={`num text-3xl mt-1 ${delta != null && delta < 0 ? 'text-ok' : 'text-ink'}`}>{deltaLabel}<span className="eyebrow ml-1">{units}</span></div></Card>
        </div>
        <Card className="space-y-3">
          <input type="date" value={date} max={todayKey()} onChange={(e) => { setDate(e.target.value); setW(null) }} className="w-full h-12 rounded-xl border border-line-2 bg-bg-3 px-3 num" />
          <Stepper label="Weight" value={value} onChange={setW} step={units === 'kg' ? 0.1 : 0.2} min={50} max={600} unit={units} accent />
          <Button variant="primary" size="lg" full onClick={save}>Save {fmtDateShort(date)}</Button>
        </Card>
        {series.length > 0 && (
          <LineChart
            title={`Daily (${units})`} points={series.map((s) => ({ x: s.date, y: toDisplayWeight(s.weightLb, units) }))} color="var(--color-ink-3)"
            secondary={{ label: '7-day average', points: series.filter((s) => s.avg != null).map((s) => ({ x: s.date, y: toDisplayWeight(s.avg!, units) })), color: 'var(--color-hot)' }}
          />
        )}
        {entries.length > 0 && (
          <Card className="p-0 divide-y divide-line">
            {[...series].reverse().slice(0, 30).map((s) => {
              const e = entries.find((x) => x.date === s.date)!
              return (
                <div key={s.date} className="px-4 min-h-12 py-2 flex items-center gap-3">
                  <div className="num text-xs text-ink-3 w-14">{fmtDateShort(s.date)}</div>
                  <div className="num flex-1">{fmtWeight(s.weightLb, units)}</div>
                  <div className="num text-sm text-ink-2">{s.avg != null ? `avg ${fmtWeight(s.avg, units).replace(/\s.*/, '')}` : ''}</div>
                  <button type="button" className="h-10 w-10 text-ink-3" aria-label="delete" onClick={() => repo.deleteBodyweight(e.id)}>×</button>
                </div>
              )
            })}
          </Card>
        )}
      </div>
    </div>
  )
}
