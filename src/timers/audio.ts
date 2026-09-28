// Web Audio beeps. iOS needs the context created/resumed inside a user
// gesture — call `unlockAudio()` from the Start button handler.
let ctx: AudioContext | null = null
let enabled = true

export function setSoundEnabled(v: boolean) { enabled = v }

export function unlockAudio() {
  try {
    if (!ctx) ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    if (ctx.state === 'suspended') void ctx.resume()
    // Play a silent tick so iOS marks the context as user-activated.
    const o = ctx.createOscillator(); const g = ctx.createGain()
    g.gain.value = 0.0001; o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.01)
  } catch { /* no audio */ }
}

function tone(freq: number, durMs: number, when = 0, type: OscillatorType = 'sine', vol = 0.25) {
  if (!enabled || !ctx) return
  try {
    const t0 = ctx.currentTime + when
    const o = ctx.createOscillator(); const g = ctx.createGain()
    o.type = type; o.frequency.value = freq
    g.gain.setValueAtTime(0.0001, t0)
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.01)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + durMs / 1000)
    o.connect(g).connect(ctx.destination)
    o.start(t0); o.stop(t0 + durMs / 1000 + 0.02)
  } catch { /* ignore */ }
}

export const sounds = {
  /** short tick for the last 3 seconds */
  tick: () => tone(880, 80, 0, 'square', 0.12),
  /** rest over / go */
  go: () => { tone(660, 120); tone(880, 120, 0.13); tone(1320, 260, 0.26) },
  /** work interval starts (high, urgent) */
  workOn: () => { tone(1200, 140, 0, 'square', 0.22); tone(1200, 140, 0.18, 'square', 0.22) },
  /** rest interval starts (low, soft) */
  workOff: () => tone(440, 300, 0, 'sine', 0.2),
  /** new EMOM minute */
  minute: () => { tone(988, 120); tone(1319, 220, 0.14) },
  /** done */
  finish: () => { tone(784, 150); tone(988, 150, 0.16); tone(1175, 150, 0.32); tone(1568, 400, 0.48) },
  /** side switch prompt */
  switchSide: () => { tone(740, 100, 0, 'triangle'); tone(740, 100, 0.15, 'triangle'); tone(740, 100, 0.3, 'triangle') },
}
