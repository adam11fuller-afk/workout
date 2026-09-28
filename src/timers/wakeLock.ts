import { useEffect } from 'react'

let sentinel: WakeLockSentinel | null = null
let holders = 0

async function acquire() {
  try {
    if (!('wakeLock' in navigator)) return
    if (sentinel && !sentinel.released) return
    sentinel = await navigator.wakeLock.request('screen')
  } catch { /* denied / unsupported */ }
}
function release() {
  try { void sentinel?.release() } catch { /* ignore */ }
  sentinel = null
}
function onVisibility() {
  if (document.visibilityState === 'visible' && holders > 0) void acquire()
}

/** Keeps the screen awake while the component is mounted. */
export function useWakeLock(active = true) {
  useEffect(() => {
    if (!active) return
    holders++
    void acquire()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      holders--
      document.removeEventListener('visibilitychange', onVisibility)
      if (holders <= 0) { holders = 0; release() }
    }
  }, [active])
}
