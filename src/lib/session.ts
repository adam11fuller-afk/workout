import type { AppSettings, Session, SessionType } from '../data/types'
import { repo, uid } from '../db/repo'
import { todayKey } from './dates'
import { isDeloadWeek, sprintRepsToday } from './logic'

export async function startSession(type: SessionType, templateId: string, settings: AppSettings): Promise<string> {
  const id = uid()
  const deload = isDeloadWeek(settings.programStartDate)
  const s: Session = {
    id, type, templateId,
    date: todayKey(),
    startedAt: new Date().toISOString(),
    status: 'in_progress',
    deload,
    kbPhase: type === 'kb' ? settings.kbPhase : undefined,
    cursor: { phase: type === 'morning' ? 'main' : 'warmup', step: 0 },
    sprint: type === 'sprints' ? { prescribedReps: sprintRepsToday(settings, deload), variant: settings.sprintVariant } : undefined,
  }
  await repo.createSession(s)
  return id
}

export async function completeSession(s: Session, notes: string | undefined, extra: Partial<Session> = {}) {
  const endedAt = new Date().toISOString()
  const durationSec = Math.round((new Date(endedAt).getTime() - new Date(s.startedAt).getTime()) / 1000)
  await repo.updateSession(s.id, { status: 'completed', endedAt, durationSec, notes: notes?.trim() || undefined, ...extra })
  if (s.type === 'morning') await repo.markMorningDone(s.date)
}

export function templateName(s: Pick<Session, 'type' | 'templateId'>): string {
  switch (s.type) {
    case 'weights': return `Weights ${s.templateId.split('-')[1] ?? ''}`.trim()
    case 'kb': return `KB-${s.templateId.split('-')[1] ?? ''}`
    case 'sprints': return 'Sprints'
    case 'morning': return 'Morning routine'
  }
}

export const TYPE_TONE: Record<SessionType, string> = {
  weights: 'bg-hot', kb: 'bg-warn', sprints: 'bg-cool', morning: 'bg-info',
}
