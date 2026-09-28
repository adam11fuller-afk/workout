# Workout

Personal training app for the phone: weights (A → B → C), kettlebell (KB-A / KB-B, beginner or standard), Monday sprints, and a daily morning wake-up. Guides each session with timers, logs every set, shows demos, tracks progress. Single user, offline-first, installable.

**Stack:** Vite + React + TypeScript + Tailwind v4 · Dexie (IndexedDB) · vite-plugin-pwa · react-router. No backend.

## Run it locally

```bash
npm install
npm run dev        # http://localhost:5173 (use --host to open on your phone over Wi-Fi)
npm run build      # type-check + production build → dist/
npm run preview    # serve dist/ exactly as Cloudflare will
```

To test on your phone before deploying: `npm run dev -- --host`, then open the LAN URL it prints (e.g. `http://192.168.1.20:5173`) on the phone. PWA install and Wake Lock need HTTPS, so use the deployed site for those.

## Deploy (Cloudflare Pages, free)

One-time setup:

1. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**.
2. Pick the `workout` GitHub repo.
3. Build settings: framework preset **Vite**, build command `npm run build`, output directory `dist`. Node version: add an environment variable `NODE_VERSION` = `22` (Vite 8 needs ≥ 20.19).
4. Save and deploy. You get `https://workout-XXX.pages.dev`; rename the project to get `https://workout.pages.dev` if free.

After that, every push to `main` redeploys in about a minute. `public/_redirects` sends all routes to `index.html` so deep links work.

Vercel works identically (import the repo, framework Vite, output `dist`), if you'd rather.

## Install on the phone

iPhone: open the site in Safari → Share → **Add to Home Screen**. Android: Chrome → menu → **Install app**. It opens full screen, works offline, and keeps the screen awake during a session.

Notes for iPhone: web apps can't vibrate on iOS (sound still works — take the phone off silent, the beeps use the media channel once you tap Start). Pinned YouTube demos need a connection; everything else is offline.

## How it's organised

```
src/
  data/program.ts     ← THE PROGRAM. Exercises, cues, demo queries, sets/reps, KB blocks. Edit here.
  data/types.ts       ← Types for the seed file and the database.
  db/db.ts            ← Dexie schema (sessions, setLogs, exerciseSettings, settings, morningLogs, bodyweight).
  db/repo.ts          ← WorkoutRepo interface + Dexie implementation. Swap for a synced backend later.
  db/hooks.ts         ← useQuery seam (Dexie liveQuery today) + convenience hooks.
  lib/logic.ts        ← Rotation, deload, double progression, recovery flag, coverage, streaks.
  lib/steps.ts        ← Flattens a weights workout into the a/b superset order the player walks.
  timers/             ← Web Audio beeps, vibration, Wake Lock, wall-clock countdown, work/rest intervals.
  components/         ← Button, Stepper, Segmented, TimerFace, Demo (search link or pinned embed), charts…
  screens/            ← Today, Program, ExerciseDetail, History, SessionDetail, Coverage, Settings, Bodyweight
  screens/player/     ← Weights / KB / Sprint / Morning players, set logger, rest timer, summary
```

### Rules the app encodes

- **Rotation is completion-based.** Weights advance A → B → C only when a session is marked complete; KB alternates A/B the same way. Miss a Saturday and next time still shows the one you missed.
- **Today** headlines Monday = sprints, Wednesday = next KB, Saturday = next weights; other days show the morning routine plus "do a session anyway".
- **Supersets** (1a/1b) alternate set by set; the rest timer auto-starts after each "b" set (default 60 s, ±15 s, changeable in Settings).
- **Double progression:** if every working set last time hit the top of the rep range, a "Go up · +5 lb" badge shows; otherwise "same weight, more reps".
- **Deload every 4th week** from the program start date (Settings): banner, sets 3 → 2, rounds/EMOM/interval minutes cut by a third, sprints capped at 4.
- **Recovery flag:** top-set weight or reps down two sessions in a row on any lift, or sprints ended early twice running → a dismissable "consider reducing volume" note on Today, once per week.
- **Setup card** at the start of each weights session: bench position and the dumbbells to lay out (from progression targets).
- **Sprints** track prescribed reps (4 → 8, "ready to progress" toggle on the summary), then hills / 20 s variants.
- **KB phase** (Beginner default / Standard) in Settings; a prompt appears after week 4 but never switches by itself. Snatches are a separate toggle.

### Data

Everything lives in IndexedDB on the device. **Settings → Export JSON** for backups; Import replaces the local data. Pinned videos and per-exercise overrides (weight, rep range, sets) are in the database, not the seed file, so program edits and personal tweaks don't collide.
