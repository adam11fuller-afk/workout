// ---------------------------------------------------------------------------
// PROGRAM SEED. Edit exercises, cues, prescriptions here — no component
// changes needed. Pinned videos, weight overrides and rep-range overrides live
// in the database (Program screen), not here.
// ---------------------------------------------------------------------------
import type { Exercise, Program } from './types'

const ex = (e: Exercise) => [e.id, e] as const

export const EXERCISES: Record<string, Exercise> = Object.fromEntries([
  // --- Morning wake-up ------------------------------------------------------
  ex({ id: 'lymphatic-hops', name: 'Lymphatic hops', kind: 'mobility', muscles: ['Full body'],
    cues: ['Small springy heel bounces', 'Stay loose', 'Shake arms out'], demoQuery: 'lymphatic bounce exercise' }),
  ex({ id: 'arm-circles-twists', name: 'Arm circles into torso twists', kind: 'mobility', muscles: ['Shoulders', 'Core'],
    cues: ['Small to big circles', 'Then let arms swing freely as you twist'], demoQuery: 'arm circles torso twist warm up' }),
  ex({ id: 'golfer-swings', name: 'Golfer swings', kind: 'mobility', muscles: ['Core', 'Obliques'],
    cues: ['Rotate through hips, not just arms', 'Alternate directions'], demoQuery: 'golf swing mobility drill' }),
  ex({ id: 'body-wave-cat-cow', name: 'Body waves into cat-cow', kind: 'mobility', muscles: ['Core', 'Lower back'],
    cues: ['Roll wave chest to hips', 'Then slow spinal flexion/extension on all fours'], demoQuery: 'body wave exercise' }),
  ex({ id: 'reverse-lunge-reach', name: 'Reverse lunge with overhead reach', kind: 'mobility', muscles: ['Quads', 'Glutes', 'Core'],
    cues: ['Alternate legs', 'Reach tall overhead at bottom'], demoQuery: 'reverse lunge overhead reach' }),
  ex({ id: 'leg-raise-thigh-tap', name: 'Leg raises into thigh taps', kind: 'mobility', muscles: ['Abs'],
    cues: ['Lying leg raises', 'Then crunch up and tap hands to thighs'], demoQuery: 'lying leg raise' }),

  // --- Sprint drills --------------------------------------------------------
  ex({ id: 'a-skip', name: 'A-skip', kind: 'drill', muscles: ['Conditioning'],
    cues: ['Drive knee up', 'Punch the ground under hips', 'Opposite arm'], demoQuery: 'a skip sprint drill' }),
  ex({ id: 'strides', name: 'Strides', kind: 'drill', muscles: ['Conditioning'],
    cues: ['Gradual acceleration to target %', 'Relaxed shoulders'], demoQuery: 'running strides how to' }),
  ex({ id: 'sprint', name: 'Sprint', kind: 'drill', muscles: ['Conditioning', 'Hamstrings', 'Glutes'],
    cues: ['Tall posture', 'Drive arms', 'Push the ground back', 'Stay relaxed'], demoQuery: 'sprint technique beginners' }),
  ex({ id: 'hill-sprint', name: 'Hill sprint', kind: 'drill', muscles: ['Conditioning', 'Quads', 'Glutes'],
    cues: ['Lean from ankles', 'Short powerful steps', 'Drive knees'], demoQuery: 'hill sprint technique' }),

  // --- Weights A ------------------------------------------------------------
  ex({ id: 'incline-db-press', name: 'Incline DB press', kind: 'weighted', muscles: ['Upper chest', 'Front delts', 'Triceps'],
    cues: ['30–45° bench', 'Lower to deep stretch at chest', 'Press up and slightly in'], demoQuery: 'incline dumbbell press form' }),
  ex({ id: 'pull-up', name: 'Pull-ups', kind: 'bodyweight', muscles: ['Lats', 'Biceps'],
    cues: ['Full hang at bottom', 'Pull chest toward bar', 'Control the descent'], demoQuery: 'pull up proper form' }),
  ex({ id: 'bulgarian-split-squat', name: 'Bulgarian split squat', kind: 'weighted', muscles: ['Quads', 'Glutes'],
    cues: ['Rear foot on bench', 'Front foot far enough forward', 'Drop straight down'], demoQuery: 'bulgarian split squat dumbbell form' }),
  ex({ id: 'chest-supported-row', name: 'Chest-supported DB row (wide elbows)', kind: 'weighted', muscles: ['Upper back', 'Rear delts'],
    cues: ['Chest on incline bench', 'Row with elbows flared ~45–60°', 'Squeeze shoulder blades'], demoQuery: 'chest supported dumbbell row incline bench' }),
  ex({ id: 'incline-db-curl', name: 'Incline DB curl', kind: 'weighted', muscles: ['Biceps'],
    cues: ['Lie back on incline', 'Arms hang behind torso', 'Curl without swinging'], demoQuery: 'incline dumbbell curl' }),
  ex({ id: 'overhead-triceps-ext', name: 'Overhead DB triceps extension', kind: 'weighted', muscles: ['Triceps'],
    cues: ['One DB held with both hands overhead', 'Lower deep behind head', 'Elbows in'], demoQuery: 'overhead dumbbell triceps extension' }),
  ex({ id: 'db-lateral-raise', name: 'DB lateral raise', kind: 'weighted', muscles: ['Side delts'],
    cues: ['Slight forward lean', 'Lead with elbows', 'Stop at shoulder height'], demoQuery: 'dumbbell lateral raise form' }),
  ex({ id: 'hanging-knee-raise', name: 'Hanging knee raise', kind: 'bodyweight', muscles: ['Abs'],
    cues: ['Hang from bar', "Curl pelvis up, don't just lift knees", 'No swinging'], demoQuery: 'hanging knee raise' }),

  // --- Weights B ------------------------------------------------------------
  ex({ id: 'db-rdl', name: 'DB Romanian deadlift', kind: 'weighted', muscles: ['Hamstrings', 'Glutes', 'Lower back'],
    cues: ['Soft knees', 'Push hips back', 'DBs slide down thighs', 'Flat back; stop at hamstring stretch'], demoQuery: 'dumbbell romanian deadlift form' }),
  ex({ id: 'bridged-db-press', name: 'Flat DB press, hips bridged', kind: 'weighted', muscles: ['Lower chest', 'Triceps'],
    cues: ['Lie on flat bench', 'Lift hips into bridge to create a decline angle', 'Press'], demoQuery: 'dumbbell floor bridge press decline' }),
  ex({ id: 'db-hip-thrust', name: 'DB hip thrust', kind: 'weighted', muscles: ['Glutes'],
    cues: ['Upper back on bench edge', 'DB on hips', 'Drive through heels; chin tucked', 'Squeeze at top'], demoQuery: 'dumbbell hip thrust bench' }),
  ex({ id: 'chin-up', name: 'Chin-ups (underhand)', kind: 'bodyweight', muscles: ['Lats', 'Biceps'],
    cues: ['Palms facing you', 'Full hang', 'Chest to bar'], demoQuery: 'chin up form' }),
  ex({ id: 'db-pullover', name: 'DB pullover', kind: 'weighted', muscles: ['Lats', 'Chest'],
    cues: ['Across or along bench', 'Slight elbow bend', 'Lower DB behind head to stretch', 'Pull back over chest'], demoQuery: 'dumbbell pullover' }),
  ex({ id: 'rear-delt-fly', name: 'Bent-over DB rear delt fly', kind: 'weighted', muscles: ['Rear delts'],
    cues: ['Hinge forward', 'Slight elbow bend', 'Raise out to the sides, pinkies up'], demoQuery: 'bent over rear delt fly dumbbell' }),
  ex({ id: 'hammer-curl', name: 'Hammer curl', kind: 'weighted', muscles: ['Biceps', 'Forearms'],
    cues: ['Neutral grip', 'Elbows pinned', 'No swing'], demoQuery: 'hammer curl form' }),
  ex({ id: 'db-kickback', name: 'DB kickback', kind: 'weighted', muscles: ['Triceps'],
    cues: ['Hinge', 'Upper arm parallel to floor and still', 'Extend fully and squeeze'], demoQuery: 'dumbbell tricep kickback' }),
  ex({ id: 'hanging-leg-raise', name: 'Hanging leg raise', kind: 'bodyweight', muscles: ['Abs'],
    cues: ['Straight or slightly bent legs', 'Raise with control', 'No swinging'], demoQuery: 'hanging leg raise' }),

  // --- Weights C ------------------------------------------------------------
  ex({ id: 'heels-elevated-goblet', name: 'Heels-elevated goblet squat', kind: 'weighted', muscles: ['Quads'],
    cues: ['Heels on plate or wedge', 'DB at chest', 'Sit straight down, knees forward'], demoQuery: 'heels elevated goblet squat' }),
  ex({ id: 'neutral-pull-up', name: 'Neutral-grip pull-ups', kind: 'bodyweight', muscles: ['Lats'],
    cues: ['Palms facing each other if bar allows', 'Otherwise regular grip'], demoQuery: 'neutral grip pull up' }),
  ex({ id: 'standing-db-press', name: 'Standing DB overhead press', kind: 'weighted', muscles: ['Front delts', 'Side delts', 'Triceps'],
    cues: ['Brace core and glutes', 'Press straight up', "Don't lean back"], demoQuery: 'standing dumbbell shoulder press' }),
  ex({ id: 'single-leg-rdl', name: 'Single-leg DB RDL', kind: 'weighted', muscles: ['Hamstrings', 'Glutes'],
    cues: ['Hinge on one leg', 'Back leg extends behind', 'Hips square'], demoQuery: 'single leg dumbbell rdl' }),
  ex({ id: 'db-push-up', name: 'Push-ups on dumbbells', kind: 'bodyweight', muscles: ['Chest', 'Triceps'],
    cues: ['Hands on DB handles for a deeper stretch', 'Body in straight line'], demoQuery: 'deficit push up on dumbbells' }),
  ex({ id: 'bent-over-db-row', name: 'Bent-over DB row', kind: 'weighted', muscles: ['Upper back', 'Lower back'],
    cues: ['Hinge ~45°', 'Flat back', 'Row both DBs to hips'], demoQuery: 'bent over dumbbell row' }),
  ex({ id: 'lateral-into-rear-fly', name: 'Lateral raise into rear delt fly', kind: 'weighted', muscles: ['Side delts', 'Rear delts'],
    cues: ['12 lateral raises', 'Then hinge and do 12 rear delt flies', 'Same DBs'], demoQuery: 'lateral raise rear delt fly superset' }),
  ex({ id: 'curl-into-overhead-ext', name: 'DB curl into overhead extension', kind: 'weighted', muscles: ['Biceps', 'Triceps'],
    cues: ['12 curls', 'Then 12 overhead extensions'], demoQuery: 'dumbbell curl form' }),
  ex({ id: 'dead-bug', name: 'Dead bug', kind: 'bodyweight', muscles: ['Abs'],
    cues: ['Lower back pressed into floor', 'Extend opposite arm and leg slowly'], demoQuery: 'dead bug exercise' }),

  // --- Kettlebell library ---------------------------------------------------
  ex({ id: 'kb-halo', name: 'Halo', kind: 'weighted', muscles: ['Shoulders', 'Core'],
    cues: ['Hold bell upside down by horns', 'Circle slowly around head', 'Ribs down'], demoQuery: 'kettlebell halo' }),
  ex({ id: 'kb-goblet-squat', name: 'Goblet squat (+ pry)', kind: 'weighted', muscles: ['Quads', 'Glutes'],
    cues: ['Bell at chest by horns', 'Sit between heels; chest tall', 'Pry knees out with elbows at bottom'], demoQuery: 'kettlebell goblet squat' }),
  ex({ id: 'hip-hinge-drill', name: 'Hip hinge drill', kind: 'bodyweight', muscles: ['Hamstrings', 'Glutes'],
    cues: ['Push butt back toward wall', 'Flat back', 'Shins nearly vertical'], demoQuery: 'hip hinge drill kettlebell' }),
  ex({ id: 'kb-two-hand-swing', name: 'Two-hand swing', kind: 'weighted', muscles: ['Glutes', 'Hamstrings', 'Core', 'Grip'],
    cues: ["Hinge, don't squat", 'Hike bell back like a football snap', 'Snap hips so bell floats to chest height', 'Arms are ropes; exhale at top'], demoQuery: 'kettlebell swing beginner form' }),
  ex({ id: 'kb-one-arm-swing', name: 'One-arm swing', kind: 'weighted', muscles: ['Glutes', 'Hamstrings', 'Core', 'Grip', 'Obliques'],
    cues: ['Same as two-hand', 'Shoulder packed', "Don't let torso twist"], demoQuery: 'one arm kettlebell swing' }),
  ex({ id: 'kb-half-getup', name: 'Half get-up', kind: 'timed', muscles: ['Shoulders', 'Core'],
    cues: ['Press bell up; eyes on bell', 'Roll to elbow, then hand', 'Reverse'], note: 'Practice first with a shoe on your fist.', demoQuery: 'half turkish get up' }),
  ex({ id: 'kb-getup', name: 'Turkish get-up', kind: 'timed', muscles: ['Full body', 'Shoulders', 'Core'],
    cues: ['Half get-up, then bridge', 'Sweep leg to half-kneel, stand', 'Reverse', 'Arm vertical, eyes on bell throughout'], demoQuery: 'turkish get up step by step' }),
  ex({ id: 'kb-front-rack-lunge', name: 'Front-rack reverse lunge', kind: 'weighted', muscles: ['Quads', 'Glutes', 'Core'],
    cues: ['Bell on outside of forearm at shoulder, elbow tucked', 'Step straight back', 'Drive up'], demoQuery: 'kettlebell front rack reverse lunge' }),
  ex({ id: 'kb-floor-press', name: 'KB floor press', kind: 'weighted', muscles: ['Chest', 'Triceps'],
    cues: ['Lie on floor, knees bent', 'Press bell straight up', 'Pause elbow on floor'], demoQuery: 'kettlebell floor press' }),
  ex({ id: 'kb-one-arm-row', name: 'One-arm KB row', kind: 'weighted', muscles: ['Lats', 'Upper back'],
    cues: ['Hinge, free hand on knee', 'Row bell to hip'], demoQuery: 'single arm kettlebell row' }),
  ex({ id: 'kb-gorilla-row', name: 'Gorilla row', kind: 'weighted', muscles: ['Lats', 'Upper back', 'Core'],
    cues: ['Wide stance, two bells between feet', 'Hinge', 'Row one while the other hand presses down on the other bell'], demoQuery: 'kettlebell gorilla row' }),
  ex({ id: 'kb-press', name: 'One-arm KB press', kind: 'weighted', muscles: ['Shoulders', 'Triceps'],
    cues: ['From rack position', 'Squeeze glutes', 'Press straight up, biceps by ear'], demoQuery: 'kettlebell overhead press' }),
  ex({ id: 'kb-clean', name: 'KB clean', kind: 'weighted', muscles: ['Full body'],
    cues: ['Short swing that ends in rack', 'Keep bell close so it rolls onto forearm', 'No flipping or banging'], demoQuery: 'kettlebell clean technique' }),
  ex({ id: 'kb-front-squat', name: 'KB front squat', kind: 'weighted', muscles: ['Quads', 'Core'],
    cues: ['Bell in rack position', 'Squat with elbow tucked'], demoQuery: 'kettlebell front squat' }),
  ex({ id: 'kb-snatch', name: 'KB snatch (optional, advanced)', kind: 'weighted', muscles: ['Full body', 'Conditioning'],
    cues: ['Swing to overhead', 'Punch hand through so bell rolls around wrist', 'Lock out'], demoQuery: 'kettlebell snatch beginner' }),
  ex({ id: 'kb-suitcase-carry', name: 'Suitcase carry', kind: 'carry', muscles: ['Obliques', 'Grip'],
    cues: ['One bell at side', 'Walk tall', "Don't lean toward or away"], demoQuery: 'kettlebell suitcase carry' }),
  ex({ id: 'kb-farmer-carry', name: 'Farmer carry', kind: 'carry', muscles: ['Grip', 'Traps', 'Core'],
    cues: ['Bell(s) at sides', 'Shoulders back', 'Short quick steps'], demoQuery: 'kettlebell farmer carry' }),
  ex({ id: 'kb-front-rack-carry', name: 'Front-rack carry', kind: 'carry', muscles: ['Core', 'Upper back'],
    cues: ['Bell in rack position', 'Ribs down', 'Walk tall'], demoQuery: 'kettlebell front rack carry' }),
  ex({ id: 'kb-overhead-carry', name: 'Overhead carry', kind: 'carry', muscles: ['Shoulders', 'Core'],
    cues: ['Arm locked out vertically, biceps by ear', 'Ribs down'], demoQuery: 'kettlebell overhead carry' }),
  ex({ id: 'bag-rounds', name: 'Punching bag rounds', kind: 'timed', muscles: ['Conditioning'],
    cues: ['Hands up', 'Turn hips into punches', 'Breathe out on each strike'], demoQuery: 'heavy bag workout beginner' }),
])

export const PROGRAM: Program = {
  exercises: EXERCISES,

  // -------------------------------------------------------------------------
  morning: {
    id: 'morning',
    name: 'Morning wake-up',
    estMinutes: 5,
    moves: [
      { exerciseId: 'lymphatic-hops', seconds: 60 },
      { exerciseId: 'arm-circles-twists', seconds: 45 },
      { exerciseId: 'golfer-swings', seconds: 30 },
      { exerciseId: 'body-wave-cat-cow', seconds: 45 },
      { exerciseId: 'reverse-lunge-reach', seconds: 60 },
      { exerciseId: 'leg-raise-thigh-tap', seconds: 60 },
    ],
  },

  // -------------------------------------------------------------------------
  sprints: {
    id: 'sprints',
    name: 'Outdoor sprints',
    estMinutes: 20,
    warmup: [
      { label: 'Easy jog', seconds: 240 },
      { label: 'Leg swings', detail: '~20 yards' },
      { label: 'High knees', detail: '~20 yards' },
      { label: 'Butt kicks', detail: '~20 yards' },
      { exerciseId: 'a-skip', label: 'A-skips', detail: '~20 yards' },
      { exerciseId: 'strides', label: 'Stride 1', detail: '60% effort' },
      { exerciseId: 'strides', label: 'Stride 2', detail: '75% effort' },
      { exerciseId: 'strides', label: 'Stride 3', detail: '90% effort' },
    ],
    drillIds: ['a-skip', 'strides', 'sprint', 'hill-sprint'],
    sprintSeconds: [15, 20],
    restSec: 120,
    startReps: 4,
    maxReps: 8,
    deloadCapReps: 4,
    notes: [
      'Grass, a track, or a 6–10% hill. Hills are easier on the hamstrings.',
      'First rep ~90%. Every rep should be as fast as the first; if speed drops a lot, end the session.',
      'Walk back slowly. Rest 2+ minutes between reps.',
      'In cold weather, extend the warm-up.',
      'After daylight saving ends, use a lit track or reflective gear.',
    ],
    cooldown: '3–5 min walk',
  },

  // -------------------------------------------------------------------------
  weights: [
    {
      id: 'weights-A', letter: 'A', name: 'Weights A', setup: 'incline', estMinutes: 60,
      setupNotes: ['Bench on incline (30–45°) all session', 'Pull-up bar', 'Heels-elevated plate not needed'],
      blocks: [
        { key: '1', slots: [
          { exerciseId: 'incline-db-press', sets: 3, reps: { type: 'range', min: 8, max: 10 } },
          { exerciseId: 'pull-up', sets: 3, reps: { type: 'amrap', minus: [1, 2] } },
        ] },
        { key: '2', slots: [
          { exerciseId: 'bulgarian-split-squat', sets: 3, reps: { type: 'range', min: 8, max: 10 }, perSide: true },
          { exerciseId: 'chest-supported-row', sets: 3, reps: { type: 'fixed', reps: 10 } },
        ] },
        { key: '3', slots: [
          { exerciseId: 'incline-db-curl', sets: 3, reps: { type: 'range', min: 10, max: 12 } },
          { exerciseId: 'overhead-triceps-ext', sets: 3, reps: { type: 'range', min: 10, max: 12 } },
        ] },
        { key: '4', slots: [
          { exerciseId: 'db-lateral-raise', sets: 3, reps: { type: 'range', min: 12, max: 15 } },
          { exerciseId: 'hanging-knee-raise', sets: 3, reps: { type: 'fixed', reps: 12 } },
        ] },
      ],
    },
    {
      id: 'weights-B', letter: 'B', name: 'Weights B', setup: 'flat', estMinutes: 60,
      setupNotes: ['Bench flat all session', 'Pull-up bar'],
      blocks: [
        { key: '1', slots: [
          { exerciseId: 'db-rdl', sets: 3, reps: { type: 'range', min: 8, max: 10 } },
          { exerciseId: 'bridged-db-press', sets: 3, reps: { type: 'range', min: 8, max: 10 } },
        ] },
        { key: '2', slots: [
          { exerciseId: 'db-hip-thrust', sets: 3, reps: { type: 'range', min: 10, max: 12 } },
          { exerciseId: 'chin-up', sets: 3, reps: { type: 'amrap', minus: [1, 2] } },
        ] },
        { key: '3', slots: [
          { exerciseId: 'db-pullover', sets: 3, reps: { type: 'fixed', reps: 12 } },
          { exerciseId: 'rear-delt-fly', sets: 3, reps: { type: 'fixed', reps: 15 } },
        ] },
        { key: '4', slots: [
          { exerciseId: 'hammer-curl', sets: 3, reps: { type: 'range', min: 10, max: 12 } },
          { exerciseId: 'db-kickback', sets: 3, reps: { type: 'range', min: 12, max: 15 } },
        ] },
        { key: '5', slots: [
          { exerciseId: 'hanging-leg-raise', sets: 3, reps: { type: 'fixed', reps: 10 } },
        ] },
      ],
    },
    {
      id: 'weights-C', letter: 'C', name: 'Weights C', setup: 'none', estMinutes: 55,
      setupNotes: ['No bench', 'Plate or wedge for heels', 'Pull-up bar'],
      blocks: [
        { key: '1', slots: [
          { exerciseId: 'heels-elevated-goblet', sets: 3, reps: { type: 'range', min: 10, max: 12 } },
          { exerciseId: 'neutral-pull-up', sets: 3, reps: { type: 'amrap', minus: [1, 2] } },
        ] },
        { key: '2', slots: [
          { exerciseId: 'standing-db-press', sets: 3, reps: { type: 'range', min: 8, max: 10 } },
          { exerciseId: 'single-leg-rdl', sets: 3, reps: { type: 'range', min: 8, max: 10 }, perSide: true },
        ] },
        { key: '3', slots: [
          { exerciseId: 'db-push-up', sets: 3, reps: { type: 'amrap', minus: 2 } },
          { exerciseId: 'bent-over-db-row', sets: 3, reps: { type: 'fixed', reps: 10 } },
        ] },
        { key: '4', slots: [
          { exerciseId: 'lateral-into-rear-fly', sets: 2, reps: { type: 'fixed', reps: 12 }, repLabel: 'each' },
          { exerciseId: 'curl-into-overhead-ext', sets: 2, reps: { type: 'fixed', reps: 12 }, repLabel: 'each' },
        ] },
        { key: '5', slots: [
          { exerciseId: 'dead-bug', sets: 3, reps: { type: 'fixed', reps: 10 }, perSide: true },
        ] },
      ],
    },
  ],

  // -------------------------------------------------------------------------
  kb: [
    {
      id: 'kb-A', letter: 'A', name: 'KB-A · Swings & get-ups', estMinutes: 30,
      warmup: KB_WARMUP(),
      blocks: {
        beginner: [
          { type: 'getup', key: '1', title: 'Get-ups', exerciseId: 'kb-half-getup', minutes: 5 },
          { type: 'emom', key: '2', title: 'Swings · EMOM', exerciseId: 'kb-two-hand-swing', minutes: 10, repsPerMinute: 10 },
          { type: 'rounds', key: '3', title: 'Strength pair', rounds: 3, restSec: 60,
            slots: [
              { exerciseId: 'kb-goblet-squat', reps: 10 },
              { exerciseId: 'kb-floor-press', reps: 8, perSide: true },
            ] },
          { type: 'carry', key: '4', title: 'Carry', rounds: 2, slots: [{ exerciseId: 'kb-suitcase-carry', distanceYd: 40, perSide: true }] },
        ],
        standard: [
          { type: 'getup', key: '1', title: 'Get-ups', exerciseId: 'kb-getup', minutes: 6 },
          { type: 'emom', key: '2', title: 'Swings · EMOM', exerciseId: 'kb-one-arm-swing', minutes: 10, repsPerMinute: 10, switchHands: true },
          { type: 'rounds', key: '3', title: 'Strength pair', rounds: 3, restSec: 60,
            slots: [
              { exerciseId: 'kb-front-rack-lunge', reps: 6, perSide: true },
              { exerciseId: 'kb-floor-press', reps: 8, perSide: true },
            ] },
          { type: 'carry', key: '4', title: 'Carry', rounds: 2, slots: [{ exerciseId: 'kb-suitcase-carry', distanceYd: 40, perSide: true }] },
        ],
      },
    },
    {
      id: 'kb-B', letter: 'B', name: 'KB-B · Circuit, intervals & carries', estMinutes: 30,
      warmup: KB_WARMUP(),
      blocks: {
        beginner: [
          { type: 'rounds', key: '1', title: 'Circuit', rounds: 4, restSec: 60,
            slots: [
              { exerciseId: 'kb-goblet-squat', reps: 10 },
              { exerciseId: 'kb-one-arm-row', reps: 10, perSide: true },
              { exerciseId: 'kb-press', reps: 8, perSide: true },
            ] },
          { type: 'interval', key: '2', title: 'Intervals · 15s on / 15s off', exerciseId: 'kb-two-hand-swing', onSec: 15, offSec: 15, minutes: 8 },
          { type: 'carry', key: '3', title: 'Carry medley', rounds: 2, slots: [
            { exerciseId: 'kb-farmer-carry', distanceYd: 30 },
            { exerciseId: 'kb-front-rack-carry', distanceYd: 30 },
            { exerciseId: 'kb-overhead-carry', distanceYd: 30 },
          ] },
          { type: 'bag', key: '4', title: 'Bag finisher', exerciseId: 'bag-rounds', rounds: 3, hardSec: 60, easySec: 60, optional: true },
        ],
        standard: [
          { type: 'rounds', key: '1', title: 'KB complex', rounds: 4, restSec: 60, perSideRounds: true, continuous: true,
            progressionNote: 'When the complex feels easy at 4 rounds, add a 5th before going heavier.',
            slots: [
              { exerciseId: 'kb-clean', reps: 5 },
              { exerciseId: 'kb-front-squat', reps: 5 },
              { exerciseId: 'kb-press', reps: 5 },
              { exerciseId: 'kb-gorilla-row', reps: 5 },
            ] },
          { type: 'interval', key: '2', title: 'Intervals · 15s on / 15s off', exerciseId: 'kb-one-arm-swing', altExerciseId: 'kb-snatch', onSec: 15, offSec: 15, minutes: 8 },
          { type: 'carry', key: '3', title: 'Carry medley', rounds: 2, slots: [
            { exerciseId: 'kb-farmer-carry', distanceYd: 30 },
            { exerciseId: 'kb-front-rack-carry', distanceYd: 30 },
            { exerciseId: 'kb-overhead-carry', distanceYd: 30 },
          ] },
          { type: 'bag', key: '4', title: 'Bag finisher', exerciseId: 'bag-rounds', rounds: 3, hardSec: 60, easySec: 60, optional: true },
        ],
      },
    },
  ],

  kbProgressionRules: [
    'When 10 × 10 swings feel smooth and powerful, move up a bell.',
    'When the complex feels easy at 4 rounds, add a 5th before going heavier.',
    'Switch Beginner → Standard after 4–6 weeks, or once two-hand swings feel smooth. Only switch when you choose.',
    'Snatches only once swing and clean are solid (separate toggle in Settings).',
  ],
  kbGoals: [
    '100 one-arm swings in 5 minutes with a 32 kg (70 lb) bell',
    '10 get-ups in 10 minutes with a 32 kg (70 lb) bell',
  ],
}

function KB_WARMUP() {
  return [
    { exerciseId: 'kb-halo', label: 'Halos', detail: '10 each direction' },
    { exerciseId: 'kb-goblet-squat', label: 'Goblet squat hold with pry', detail: '30 seconds', seconds: 30 },
    { exerciseId: 'hip-hinge-drill', label: 'Hip hinges', detail: '10 reps' },
    { exerciseId: 'kb-half-getup', label: 'Slow half get-up', detail: '1 per side' },
  ]
}

// -- Lookups ----------------------------------------------------------------

export const WEIGHTS_ORDER = ['weights-A', 'weights-B', 'weights-C'] as const
export const KB_ORDER = ['kb-A', 'kb-B'] as const

export function getExercise(id: string): Exercise {
  const e = EXERCISES[id]
  if (!e) throw new Error(`Unknown exercise: ${id}`)
  return e
}

export function getWeightsWorkout(id: string) {
  return PROGRAM.weights.find((w) => w.id === id)
}
export function getKbWorkout(id: string) {
  return PROGRAM.kb.find((w) => w.id === id)
}

/** All templates as a flat list for the Program screen. */
export const TEMPLATES = [
  { id: 'morning', type: 'morning' as const, name: PROGRAM.morning.name, sub: 'Daily · ~5 min' },
  { id: 'sprints', type: 'sprints' as const, name: PROGRAM.sprints.name, sub: 'Monday · ~20 min' },
  ...PROGRAM.kb.map((k) => ({ id: k.id, type: 'kb' as const, name: k.name, sub: 'Wednesday · ~30 min' })),
  ...PROGRAM.weights.map((w) => ({ id: w.id, type: 'weights' as const, name: w.name, sub: `Saturday · ~${w.estMinutes} min · bench ${w.setup}` })),
]
