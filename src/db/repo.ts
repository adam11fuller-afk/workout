// ---------------------------------------------------------------------------
// Storage interface. The UI only talks to `repo`. Swap DexieRepo for a synced
// implementation later (e.g. Supabase) without touching components.
// ---------------------------------------------------------------------------
import type {
  AppSettings, BodyweightEntry, ExerciseSettings, ExportBundle, MorningLog, Session, SetLog,
} from '../data/types'
import { db } from './db'
import { todayKey } from '../lib/dates'

export interface WorkoutRepo {
  // settings
  getSettings(): Promise<AppSettings>
  ensureSettings(): Promise<void>
  saveSettings(patch: Partial<AppSettings>): Promise<void>
  // sessions
  getSession(id: string): Promise<Session | undefined>
  listSessions(): Promise<Session[]>
  listCompletedSessions(type?: Session['type']): Promise<Session[]>
  getInProgressSession(): Promise<Session | undefined>
  createSession(s: Session): Promise<void>
  updateSession(id: string, patch: Partial<Session>): Promise<void>
  deleteSession(id: string): Promise<void>
  // set logs
  listSetLogs(sessionId: string): Promise<SetLog[]>
  listSetLogsForExercise(exerciseId: string): Promise<SetLog[]>
  listAllSetLogs(): Promise<SetLog[]>
  upsertSetLog(log: SetLog): Promise<void>
  deleteSetLog(id: string): Promise<void>
  // exercise overrides
  getExerciseSettings(exerciseId: string): Promise<ExerciseSettings | undefined>
  listExerciseSettings(): Promise<ExerciseSettings[]>
  saveExerciseSettings(s: ExerciseSettings): Promise<void>
  // morning
  listMorningLogs(): Promise<MorningLog[]>
  markMorningDone(date: string): Promise<void>
  unmarkMorningDone(date: string): Promise<void>
  // bodyweight
  listBodyweight(): Promise<BodyweightEntry[]>
  upsertBodyweight(e: BodyweightEntry): Promise<void>
  deleteBodyweight(id: string): Promise<void>
  // backup
  exportAll(): Promise<ExportBundle>
  importAll(bundle: ExportBundle): Promise<void>
  wipe(): Promise<void>
}

export const DEFAULT_SETTINGS: AppSettings = {
  id: 'app',
  programStartDate: todayKey(),
  kbPhase: 'beginner',
  snatchEnabled: false,
  units: 'lb',
  restTimerSec: 60,
  soundEnabled: true,
  vibrationEnabled: true,
  sprintReps: 4,
  sprintVariant: 'flat',
  createdAt: new Date().toISOString(),
}

class DexieRepo implements WorkoutRepo {
  /** Read-only (safe inside liveQuery). Defaults are merged in; nothing is written. */
  async getSettings() {
    const s = await db.settings.get('app')
    return s ? { ...DEFAULT_SETTINGS, ...s } : DEFAULT_SETTINGS
  }
  /** Called once at startup so the start date is fixed on first launch. */
  async ensureSettings() {
    const s = await db.settings.get('app')
    if (!s) await db.settings.put({ ...DEFAULT_SETTINGS, programStartDate: todayKey(), createdAt: new Date().toISOString() })
  }
  async saveSettings(patch: Partial<AppSettings>) {
    const cur = await this.getSettings()
    await db.settings.put({ ...cur, ...patch, id: 'app' })
  }

  getSession(id: string) { return db.sessions.get(id) }
  listSessions() { return db.sessions.orderBy('startedAt').reverse().toArray() }
  async listCompletedSessions(type?: Session['type']) {
    const all = type
      ? await db.sessions.where('[type+status]').equals([type, 'completed']).toArray()
      : await db.sessions.where('status').equals('completed').toArray()
    return all.sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1))
  }
  async getInProgressSession() {
    const list = await db.sessions.where('status').equals('in_progress').toArray()
    return list.sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1))[0]
  }
  createSession(s: Session) { return db.sessions.add(s).then(() => undefined) }
  updateSession(id: string, patch: Partial<Session>) { return db.sessions.update(id, patch).then(() => undefined) }
  async deleteSession(id: string) {
    await db.transaction('rw', db.sessions, db.setLogs, async () => {
      await db.setLogs.where('sessionId').equals(id).delete()
      await db.sessions.delete(id)
    })
  }

  listSetLogs(sessionId: string) { return db.setLogs.where('sessionId').equals(sessionId).sortBy('createdAt') }
  listSetLogsForExercise(exerciseId: string) { return db.setLogs.where('exerciseId').equals(exerciseId).sortBy('createdAt') }
  listAllSetLogs() { return db.setLogs.toArray() }
  upsertSetLog(log: SetLog) { return db.setLogs.put(log).then(() => undefined) }
  deleteSetLog(id: string) { return db.setLogs.delete(id) }

  getExerciseSettings(exerciseId: string) { return db.exerciseSettings.get(exerciseId) }
  listExerciseSettings() { return db.exerciseSettings.toArray() }
  saveExerciseSettings(s: ExerciseSettings) { return db.exerciseSettings.put(s).then(() => undefined) }

  listMorningLogs() { return db.morningLogs.orderBy('date').reverse().toArray() }
  markMorningDone(date: string) { return db.morningLogs.put({ date, completedAt: new Date().toISOString() }).then(() => undefined) }
  unmarkMorningDone(date: string) { return db.morningLogs.delete(date) }

  listBodyweight() { return db.bodyweight.orderBy('date').toArray() }
  upsertBodyweight(e: BodyweightEntry) { return db.bodyweight.put(e).then(() => undefined) }
  deleteBodyweight(id: string) { return db.bodyweight.delete(id) }

  async exportAll(): Promise<ExportBundle> {
    return {
      app: 'workout', version: 1, exportedAt: new Date().toISOString(),
      settings: await db.settings.get('app'),
      sessions: await db.sessions.toArray(),
      setLogs: await db.setLogs.toArray(),
      exerciseSettings: await db.exerciseSettings.toArray(),
      morningLogs: await db.morningLogs.toArray(),
      bodyweight: await db.bodyweight.toArray(),
    }
  }
  async importAll(b: ExportBundle) {
    if (b.app !== 'workout') throw new Error('Not a Workout backup file')
    await db.transaction('rw', [db.settings, db.sessions, db.setLogs, db.exerciseSettings, db.morningLogs, db.bodyweight], async () => {
      await Promise.all([db.settings.clear(), db.sessions.clear(), db.setLogs.clear(), db.exerciseSettings.clear(), db.morningLogs.clear(), db.bodyweight.clear()])
      if (b.settings) await db.settings.put({ ...DEFAULT_SETTINGS, ...b.settings, id: 'app' })
      await db.sessions.bulkPut(b.sessions ?? [])
      await db.setLogs.bulkPut(b.setLogs ?? [])
      await db.exerciseSettings.bulkPut(b.exerciseSettings ?? [])
      await db.morningLogs.bulkPut(b.morningLogs ?? [])
      await db.bodyweight.bulkPut(b.bodyweight ?? [])
    })
  }
  async wipe() {
    await db.transaction('rw', [db.settings, db.sessions, db.setLogs, db.exerciseSettings, db.morningLogs, db.bodyweight], async () => {
      await Promise.all([db.settings.clear(), db.sessions.clear(), db.setLogs.clear(), db.exerciseSettings.clear(), db.morningLogs.clear(), db.bodyweight.clear()])
    })
  }
}

export const repo: WorkoutRepo = new DexieRepo()

export const uid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
