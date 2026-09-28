// ---------------------------------------------------------------------------
// Program (seed) types. Everything in src/data/program.ts is typed by this.
// ---------------------------------------------------------------------------

export type Muscle =
  | 'Upper chest' | 'Lower chest' | 'Chest'
  | 'Front delts' | 'Side delts' | 'Rear delts' | 'Shoulders'
  | 'Lats' | 'Upper back' | 'Traps' | 'Lower back'
  | 'Biceps' | 'Triceps' | 'Forearms' | 'Grip'
  | 'Quads' | 'Hamstrings' | 'Glutes' | 'Calves'
  | 'Abs' | 'Obliques' | 'Core'
  | 'Full body' | 'Conditioning'

export const MUSCLE_ORDER: Muscle[] = [
  'Upper chest', 'Lower chest', 'Chest',
  'Front delts', 'Side delts', 'Rear delts', 'Shoulders',
  'Lats', 'Upper back', 'Traps', 'Lower back',
  'Biceps', 'Triceps', 'Forearms', 'Grip',
  'Quads', 'Hamstrings', 'Glutes', 'Calves',
  'Abs', 'Obliques', 'Core',
  'Full body', 'Conditioning',
]

export type ExerciseKind =
  | 'weighted'    // load + reps (dumbbell / kettlebell)
  | 'bodyweight'  // reps only (pull-ups, push-ups, dead bug)
  | 'timed'       // duration-based (get-ups, intervals, bag rounds)
  | 'carry'       // load + distance
  | 'drill'       // sprint drills / strides
  | 'mobility'    // morning routine moves

export interface Exercise {
  id: string
  name: string
  kind: ExerciseKind
  muscles: Muscle[]
  cues: string[]
  demoQuery: string
  /** Optional note shown under the name (e.g. "Practice first with a shoe on your fist"). */
  note?: string
}

/** Rep prescription for a set-based exercise. */
export type RepScheme =
  | { type: 'range'; min: number; max: number }
  | { type: 'fixed'; reps: number }
  | { type: 'amrap'; minus: [number, number] | number } // AMRAP minus 1–2

export interface WeightsSlot {
  exerciseId: string
  sets: number
  reps: RepScheme
  perSide?: boolean
  /** Shown after the rep scheme, e.g. "each" for "2 x 12 each". */
  repLabel?: string
}

/** A superset pair (1a/1b) or a standalone exercise (5). */
export interface WeightsBlock {
  key: string           // "1", "2", "5"
  slots: WeightsSlot[]  // 2 for a superset, 1 for standalone
  restSec?: number      // default 60
}

export type BenchSetup = 'incline' | 'flat' | 'none'

export interface WeightsWorkout {
  id: 'weights-A' | 'weights-B' | 'weights-C'
  letter: 'A' | 'B' | 'C'
  name: string
  setup: BenchSetup
  setupNotes: string[]
  blocks: WeightsBlock[]
  estMinutes: number
}

// -- Kettlebell -------------------------------------------------------------

export type KbPhase = 'beginner' | 'standard'

export interface RoundSlot {
  exerciseId: string
  reps: number
  perSide?: boolean
}

export type KbBlock =
  | { type: 'getup'; key: string; title: string; exerciseId: string; minutes: number }
  | { type: 'emom'; key: string; title: string; exerciseId: string; minutes: number; repsPerMinute: number; switchHands?: boolean }
  | {
      type: 'rounds'; key: string; title: string; rounds: number; restSec: number
      slots: RoundSlot[]
      /** "per side without setting the bell down" (complex) */
      perSideRounds?: boolean
      continuous?: boolean
      progressionNote?: string
    }
  | { type: 'carry'; key: string; title: string; rounds: number; slots: { exerciseId: string; distanceYd: number; perSide?: boolean }[] }
  | { type: 'interval'; key: string; title: string; exerciseId: string; altExerciseId?: string; onSec: number; offSec: number; minutes: number }
  | { type: 'bag'; key: string; title: string; exerciseId: string; rounds: number; hardSec: number; easySec: number; optional: true }

export interface WarmupStep {
  exerciseId?: string
  label: string
  detail?: string
  seconds?: number
}

export interface KbWorkout {
  id: 'kb-A' | 'kb-B'
  letter: 'A' | 'B'
  name: string
  warmup: WarmupStep[]
  blocks: Record<KbPhase, KbBlock[]>
  estMinutes: number
}

// -- Sprints ----------------------------------------------------------------

export interface SprintProgram {
  id: 'sprints'
  name: string
  warmup: WarmupStep[]
  drillIds: string[]
  sprintSeconds: [number, number]
  restSec: number
  startReps: number
  maxReps: number
  deloadCapReps: number
  notes: string[]
  cooldown: string
  estMinutes: number
}

// -- Morning routine --------------------------------------------------------

export interface MorningMove {
  exerciseId: string
  seconds: number
}

export interface MorningRoutine {
  id: 'morning'
  name: string
  moves: MorningMove[]
  estMinutes: number
}

export interface Program {
  exercises: Record<string, Exercise>
  morning: MorningRoutine
  sprints: SprintProgram
  weights: WeightsWorkout[]
  kb: KbWorkout[]
  kbProgressionRules: string[]
  kbGoals: string[]
}

// ---------------------------------------------------------------------------
// Persisted (IndexedDB) types
// ---------------------------------------------------------------------------

export type SessionType = 'weights' | 'kb' | 'sprints' | 'morning'
export type SessionStatus = 'in_progress' | 'completed' | 'abandoned'

export type SprintLocation = 'grass' | 'track' | 'hill'

export interface PlayerCursor {
  /** warm-up checklist → main blocks → summary */
  phase: 'warmup' | 'main' | 'summary'
  /** Index into the flat step list (weights) or block list (KB). */
  step: number
}

export interface Session {
  id: string
  type: SessionType
  templateId: string        // weights-A | kb-B | sprints | morning
  date: string              // YYYY-MM-DD local
  startedAt: string         // ISO
  endedAt?: string
  durationSec?: number
  status: SessionStatus
  notes?: string
  deload: boolean
  kbPhase?: KbPhase
  cursor?: PlayerCursor
  sprint?: {
    prescribedReps: number
    location?: SprintLocation
    endedEarly?: boolean
    variant: SprintVariant
  }
  /** Warm-up checklist ticks (index → done) */
  warmupDone?: boolean[]
}

export type SetKind = 'reps' | 'timed' | 'carry' | 'sprint'

export interface SetLog {
  id: string
  sessionId: string
  exerciseId: string
  blockKey: string
  /** 0-based set / round / rep index */
  setIndex: number
  kind: SetKind
  side?: 'L' | 'R'
  weightLb?: number
  reps?: number
  rir?: number             // 0–4
  roundsCompleted?: number
  roundChecks?: boolean[]
  distanceYd?: number
  effort?: number          // sprints: 1–10
  seconds?: number
  createdAt: string
}

export interface ExerciseSettings {
  exerciseId: string
  pinnedVideoUrl?: string
  targetWeightLb?: number
  repRange?: { min: number; max: number }
  sets?: number
}

export type SprintVariant = 'flat' | 'hill' | 'long'

export interface AppSettings {
  id: 'app'
  programStartDate: string      // YYYY-MM-DD
  kbPhase: KbPhase
  snatchEnabled: boolean
  units: 'lb' | 'kg'
  restTimerSec: number
  soundEnabled: boolean
  vibrationEnabled: boolean
  sprintReps: number            // current prescribed reps (4–8)
  sprintVariant: SprintVariant
  /** ISO week key (e.g. 2026-W39) the recovery note was dismissed for */
  recoveryDismissedWeek?: string
  /** ISO week key the KB phase-switch prompt was dismissed for */
  kbPromptDismissedWeek?: string
  createdAt: string
}

export interface MorningLog {
  date: string   // YYYY-MM-DD (primary key)
  completedAt: string
}

export interface BodyweightEntry {
  id: string
  date: string
  weightLb: number
}

export interface ExportBundle {
  app: 'workout'
  version: 1
  exportedAt: string
  settings: AppSettings | undefined
  sessions: Session[]
  setLogs: SetLog[]
  exerciseSettings: ExerciseSettings[]
  morningLogs: MorningLog[]
  bodyweight: BodyweightEntry[]
}
