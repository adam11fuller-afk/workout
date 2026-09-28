// Reactive read hooks. `useQuery` is the single seam between React and the
// storage layer — today it is Dexie's liveQuery; a synced backend would swap
// this for its own subscription without touching screens.
import { useLiveQuery } from 'dexie-react-hooks'
import type { AppSettings } from '../data/types'
import { repo } from './repo'

export function useQuery<T>(fn: () => Promise<T>, deps: unknown[] = []): T | undefined {
  return useLiveQuery(fn, deps)
}

export function useSettings(): AppSettings | undefined {
  return useQuery(() => repo.getSettings())
}

export function useSession(id: string | undefined) {
  return useQuery(() => (id ? repo.getSession(id) : Promise.resolve(undefined)), [id])
}

export function useSetLogs(sessionId: string | undefined) {
  return useQuery(() => (sessionId ? repo.listSetLogs(sessionId) : Promise.resolve([])), [sessionId])
}

export function useExerciseSettings(exerciseId: string) {
  return useQuery(() => repo.getExerciseSettings(exerciseId), [exerciseId])
}

export function useCompletedSessions(type?: AppSettings extends never ? never : 'weights' | 'kb' | 'sprints' | 'morning') {
  return useQuery(() => repo.listCompletedSessions(type), [type])
}

/** Everything needed for per-exercise history, progression and coverage. */
export function useHistoryIndex() {
  const sessions = useQuery(() => repo.listSessions())
  const logs = useQuery(() => repo.listAllSetLogs())
  return { sessions, logs, ready: !!sessions && !!logs }
}

export function useMorningLogs() {
  return useQuery(() => repo.listMorningLogs())
}

export function useInProgress() {
  return useQuery(() => repo.getInProgressSession())
}

export function useAllExerciseSettings() {
  return useQuery(() => repo.listExerciseSettings())
}
