import { useState } from 'react'
import type { Exercise } from '../data/types'
import { useExerciseSettings } from '../db/hooks'
import { parseYoutubeId, youtubeEmbedUrl, youtubeSearchUrl } from '../lib/youtube'
import { Button } from './Button'

const PlayIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
)

/**
 * Demo affordance for an exercise. With a pinned video → inline
 * youtube-nocookie embed (mounted on tap so scrolling stays cheap). Without →
 * opens a YouTube search for the exercise's demoQuery.
 */
export function Demo({ exercise, compact }: { exercise: Exercise; compact?: boolean }) {
  const settings = useExerciseSettings(exercise.id)
  const [playing, setPlaying] = useState(false)
  const id = settings?.pinnedVideoUrl ? parseYoutubeId(settings.pinnedVideoUrl) : null

  if (id) {
    if (!playing) {
      return (
        <button
          type="button" onClick={() => setPlaying(true)}
          className={`w-full ${compact ? 'h-12' : 'h-14'} rounded-xl border border-line-2 bg-bg-3 flex items-center justify-center gap-2 text-ink font-display font-semibold uppercase tracking-wide active:bg-line`}
        >
          <span className="text-hot"><PlayIcon /></span> Play pinned demo
        </button>
      )
    }
    return (
      <div className="rounded-xl overflow-hidden border border-line-2 bg-black">
        <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
          <iframe
            className="absolute inset-0 w-full h-full" src={youtubeEmbedUrl(id)} title={`${exercise.name} demo`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen
          />
        </div>
        <button type="button" onClick={() => setPlaying(false)} className="w-full h-10 text-xs eyebrow text-ink-2">Hide video</button>
      </div>
    )
  }

  return (
    <a
      href={youtubeSearchUrl(exercise.demoQuery)} target="_blank" rel="noopener noreferrer"
      className={`w-full ${compact ? 'h-12' : 'h-14'} rounded-xl border border-line-2 bg-bg-3 flex items-center justify-center gap-2 text-ink font-display font-semibold uppercase tracking-wide active:bg-line`}
    >
      <span className="text-hot"><PlayIcon /></span> Watch demo
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-ink-3"><path d="M7 17L17 7M9 7h8v8" /></svg>
    </a>
  )
}

/** Small icon-only link used in lists. */
export function DemoLink({ exercise }: { exercise: Exercise }) {
  return (
    <Button size="sm" variant="ghost" onClick={() => window.open(youtubeSearchUrl(exercise.demoQuery), '_blank', 'noopener')}>
      <span className="text-hot"><PlayIcon /></span> Demo
    </Button>
  )
}
