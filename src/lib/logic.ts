// ---------------------------------------------------------------------------
// Training rules: rotation, deload, double progression, recovery flag,
// setup list, coverage, streaks, rolling averages.
// ---------------------------------------------------------------------------
import { KB_ORDER, PROGRAM, WEIGHTS_ORDER, getExercise } from '../data/program'
import type {
  AppSettings, BodyweightEntry, Exercise, ExerciseSettings, KbWorkout, MorningLog, Muscle, RepScheme,
  Session, SessionType, SetLog, WeightsSlot, WeightsWorkout,
} from '../data/types'
import { MUSCLE_ORDER } from '../data/types'
import { addDays, daysBetween, isoWeekKey, todayKey, weekday } from './dates'

// -- Rotation (completion-based, not calendar-based) -------------------------

function nextInRotation<T extends string>(order: readonly T[], completed: Session[], type: SessionType): T {
  const last = completed
    .filter((s) => s.type === type && s.status === 'completed')
    .sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1))[0]
  if (!last) return order[0]
  const i = order.indexOf(last.templateId as T)
  return order[(i + 1) % order.length]
}
export const nextWeightsId = (completed: Session[]): WeightsWorkout['id'] => nextInRotation(WEIGHTS_ORDER, completed, 'weights')
export const nextKbId = (completed: Session[]): KbWorkout['id'] => nextInRotation(KB_ORDER, completed, 'kb')

// -- Deload ------------------------------------------------------------------

/** 1-based week number counting from the program start date. */
export function programWeek(programStartDate: string, today = todayKey()): number {
  const d = daysBetween(programStartDate, today)
  return Math.max(1, Math.floor(d / 7) + 1)
}
export function isDeloadWeek(programStartDate: string, today = todayKey()): boolean {
  return programWeek(programStartDate, today) % 4 === 0
}
/** Cut volume by ~⅓: 3 → 2, 4 → 3, 2 stays 2. */
export function deloadSets(n: number): number {
  return n >= 3 ? Math.ceil((n * 2) / 3) : n
}

// -- Today's plan -------------------------------------------------------------

export interface PlannedSession { type: SessionType; templateId: string; name: string; sub: string }

export function nextUpSessions(completed: Session[]): PlannedSession[] {
  const w = nextWeightsId(completed)
  const k = nextKbId(completed)
  const ww = PROGRAM.weights.find((x) => x.id === w)!
  const kk = PROGRAM.kb.find((x) => x.id === k)!
  return [
    { type: 'sprints', templateId: 'sprints', name: PROGRAM.sprints.name, sub: `~${PROGRAM.sprints.estMinutes} min · outdoors` },
    { type: 'kb', templateId: k, name: kk.name, sub: `~${kk.estMinutes} min` },
    { type: 'weights', templateId: w, name: ww.name, sub: `~${ww.estMinutes} min · bench ${ww.setup}` },
  ]
}

/** What the Today screen should headline for this weekday (Mon/Wed/Sat). */
export function scheduledFor(date: Date, completed: Session[]): PlannedSession | undefined {
  const next = nextUpSessions(completed)
  switch (weekday(date)) {
    case 1: return next.find((n) => n.type === 'sprints')
    case 3: return next.find((n) => n.type === 'kb')
    case 6: return next.find((n) => n.type === 'weights')
    default: return undefined
  }
}

// -- Prescription with overrides + deload -----------------------------------

export interface EffectiveSlot { sets: number; reps: RepScheme; perSide?: boolean; repLabel?: string }

export function effectiveSlot(slot: WeightsSlot, ov: ExerciseSettings | undefined, deload: boolean): EffectiveSlot {
  let sets = ov?.sets ?? slot.sets
  let reps: RepScheme = slot.reps
  if (ov?.repRange && slot.reps.type !== 'amrap') reps = { type: 'range', min: ov.repRange.min, max: ov.repRange.max }
  if (deload) sets = deloadSets(sets)
  return { sets, reps, perSide: slot.perSide, repLabel: slot.repLabel }
}

// -- Per-exercise history -----------------------------------------------------

export interface ExerciseSessionEntry {
  sessionId: string
  date: string
  startedAt: string
  sets: SetLog[]
  topWeight: number | undefined
  topReps: number | undefined   // reps on the top-weight set (or max reps if bodyweight)
  totalReps: number
  allHitTop: (max: number) => boolean
}

/** Groups an exercise's set logs by completed session, oldest → newest. */
export function groupExerciseHistory(logs: SetLog[], sessions: Map<string, Session>): ExerciseSessionEntry[] {
  const bySession = new Map<string, SetLog[]>()
  for (const l of logs) {
    const s = sessions.get(l.sessionId)
    if (!s || s.status !== 'completed') continue
    if (l.kind !== 'reps') continue
    if (!bySession.has(l.sessionId)) bySession.set(l.sessionId, [])
    bySession.get(l.sessionId)!.push(l)
  }
  const out: ExerciseSessionEntry[] = []
  for (const [sessionId, sets] of bySession) {
    const s = sessions.get(sessionId)!
    const weighted = sets.filter((x) => x.weightLb != null)
    let topWeight: number | undefined
    let topReps: number | undefined
    if (weighted.length) {
      topWeight = Math.max(...weighted.map((x) => x.weightLb!))
      topReps = Math.max(...weighted.filter((x) => x.weightLb === topWeight).map((x) => x.reps ?? 0))
    } else {
      topReps = Math.max(...sets.map((x) => x.reps ?? 0))
    }
    out.push({
      sessionId, date: s.date, startedAt: s.startedAt, sets, topWeight, topReps,
      totalReps: sets.reduce((a, x) => a + (x.reps ?? 0), 0),
      allHitTop: (max) => sets.length > 0 && sets.every((x) => (x.reps ?? 0) >= max),
    })
  }
  return out.sort((a, b) => (a.startedAt < b.startedAt ? -1 : 1))
}

// -- Double progression -------------------------------------------------------

export type Progression =
  | { badge: 'up'; weightLb: number; text: string }
  | { badge: 'same'; weightLb: number | undefined; text: string }
  | { badge: 'none'; weightLb: number | undefined; text: string }

export const WEIGHT_INCREMENT_LB = 5

export function progressionFor(exercise: Exercise, scheme: RepScheme, history: ExerciseSessionEntry[], ov?: ExerciseSettings): Progression {
  const last = history[history.length - 1]
  if (!last) {
    return {
      badge: 'none', weightLb: ov?.targetWeightLb,
      text: exercise.kind === 'weighted'
        ? 'First time. Pick a weight you can do for the top of the range with 1–2 reps left.'
        : 'First time. Stop 1–2 reps short of failure.',
    }
  }
  if (exercise.kind !== 'weighted' || scheme.type === 'amrap') {
    return { badge: 'none', weightLb: last.topWeight, text: 'Beat last time by a rep if you can. RIR 1–2.' }
  }
  const max = scheme.type === 'range' ? scheme.max : scheme.reps
  const lastWeight = last.topWeight ?? ov?.targetWeightLb
  if (lastWeight != null && last.allHitTop(max)) {
    return { badge: 'up', weightLb: lastWeight + WEIGHT_INCREMENT_LB, text: `Every set hit ${max} last time. Go up ${WEIGHT_INCREMENT_LB} lb.` }
  }
  return { badge: 'same', weightLb: lastWeight, text: 'Same weight. Aim for more reps than last time.' }
}

// -- Recovery flag -------------------------------------------------------------

function declined(prev: ExerciseSessionEntry, cur: ExerciseSessionEntry): boolean {
  if (prev.topWeight != null && cur.topWeight != null) {
    if (cur.topWeight < prev.topWeight) return true
    if (cur.topWeight === prev.topWeight) return (cur.topReps ?? 0) < (prev.topReps ?? 0)
    return false
  }
  return (cur.topReps ?? 0) < (prev.topReps ?? 0)
}

/** True when top-set weight or reps dropped two sessions in a row. */
export function exerciseIsRegressing(history: ExerciseSessionEntry[]): boolean {
  const n = history.length
  if (n < 3) return false
  return declined(history[n - 3], history[n - 2]) && declined(history[n - 2], history[n - 1])
}

/** True when the last two sprint sessions were ended early for slowing. */
export function sprintsSlowing(sprintSessions: Session[]): boolean {
  const done = sprintSessions.filter((s) => s.type === 'sprints' && s.status === 'completed')
    .sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1))
  return done.length >= 2 && !!done[0].sprint?.endedEarly && !!done[1].sprint?.endedEarly
}

export const thisWeekKey = () => isoWeekKey(new Date())

// -- Setup list ------------------------------------------------------------------

/** Unique dumbbell/bell weights to lay out, from planned working weights. */
export function weightsToLayOut(plannedWeights: (number | undefined)[]): number[] {
  return [...new Set(plannedWeights.filter((w): w is number => w != null && w > 0))].sort((a, b) => a - b)
}

// -- Coverage ------------------------------------------------------------------------

export function coverageByMuscle(logs: SetLog[], sessions: Map<string, Session>, days = 21, today = todayKey()): { muscle: Muscle; sets: number }[] {
  const since = addDays(today, -(days - 1))
  const counts = new Map<Muscle, number>()
  for (const m of MUSCLE_ORDER) counts.set(m, 0)
  for (const l of logs) {
    const s = sessions.get(l.sessionId)
    if (!s || s.status !== 'completed' || s.date < since) continue
    if (l.kind === 'sprint') continue
    let ex: Exercise
    try { ex = getExercise(l.exerciseId) } catch { continue }
    if (ex.kind === 'mobility' || ex.kind === 'drill') continue
    for (const m of ex.muscles) counts.set(m, (counts.get(m) ?? 0) + 1)
  }
  return MUSCLE_ORDER.map((muscle) => ({ muscle, sets: counts.get(muscle) ?? 0 }))
}

/** Muscles the program can train at all (so the coverage view doesn't flag e.g. calves). */
export function programMuscles(): Set<Muscle> {
  const set = new Set<Muscle>()
  for (const w of PROGRAM.weights) for (const b of w.blocks) for (const s of b.slots) for (const m of getExercise(s.exerciseId).muscles) set.add(m)
  for (const k of PROGRAM.kb) for (const phase of ['beginner', 'standard'] as const) for (const b of k.blocks[phase]) {
    const ids: string[] = []
    if ('exerciseId' in b) ids.push(b.exerciseId)
    if ('slots' in b) ids.push(...b.slots.map((s) => s.exerciseId))
    for (const id of ids) for (const m of getExercise(id).muscles) set.add(m)
  }
  return set
}

// -- Morning streak ---------------------------------------------------------------------

export function morningStreak(logs: MorningLog[], today = todayKey()): { current: number; doneToday: boolean } {
  const days = new Set(logs.map((l) => l.date))
  const doneToday = days.has(today)
  let d = doneToday ? today : addDays(today, -1)
  let n = 0
  while (days.has(d)) { n++; d = addDays(d, -1) }
  return { current: n, doneToday }
}

// -- Bodyweight rolling average -----------------------------------------------------

export function rolling7(entries: BodyweightEntry[]): { date: string; weightLb: number; avg: number | undefined }[] {
  const sorted = [...entries].sort((a, b) => (a.date < b.date ? -1 : 1))
  return sorted.map((e) => {
    const from = addDays(e.date, -6)
    const win = sorted.filter((x) => x.date >= from && x.date <= e.date)
    const avg = win.length >= 3 ? win.reduce((a, x) => a + x.weightLb, 0) / win.length : undefined
    return { date: e.date, weightLb: e.weightLb, avg }
  })
}

// -- KB phase prompt / sprints -------------------------------------------------------

export function shouldPromptKbSwitch(settings: AppSettings, today = todayKey()): boolean {
  if (settings.kbPhase !== 'beginner') return false
  if (programWeek(settings.programStartDate, today) < 5) return false
  return settings.kbPromptDismissedWeek !== isoWeekKey(new Date())
}

export function sprintRepsToday(settings: AppSettings, deload: boolean): number {
  return deload ? Math.min(settings.sprintReps, PROGRAM.sprints.deloadCapReps) : settings.sprintReps
}

export function sessionMap(sessions: Session[]): Map<string, Session> {
  return new Map(sessions.map((s) => [s.id, s]))
}
