import Dexie, { type EntityTable } from 'dexie'
import type { AppSettings, BodyweightEntry, ExerciseSettings, MorningLog, Session, SetLog } from '../data/types'

export class WorkoutDB extends Dexie {
  sessions!: EntityTable<Session, 'id'>
  setLogs!: EntityTable<SetLog, 'id'>
  exerciseSettings!: EntityTable<ExerciseSettings, 'exerciseId'>
  settings!: EntityTable<AppSettings, 'id'>
  morningLogs!: EntityTable<MorningLog, 'date'>
  bodyweight!: EntityTable<BodyweightEntry, 'id'>

  constructor() {
    super('workout')
    this.version(1).stores({
      sessions: 'id, type, templateId, date, status, startedAt, [type+status]',
      setLogs: 'id, sessionId, exerciseId, [sessionId+exerciseId], createdAt',
      exerciseSettings: 'exerciseId',
      settings: 'id',
      morningLogs: 'date',
      bodyweight: 'id, date',
    })
  }
}

export const db = new WorkoutDB()
