let enabled = true
export function setVibrationEnabled(v: boolean) { enabled = v }
/** No-op on iOS (Safari has no vibration API); works on Android. */
export function vibrate(pattern: number | number[]) {
  if (!enabled) return
  try { navigator.vibrate?.(pattern) } catch { /* ignore */ }
}
export const buzz = {
  short: () => vibrate(60),
  go: () => vibrate([120, 60, 120]),
  long: () => vibrate([300, 100, 300, 100, 500]),
}
