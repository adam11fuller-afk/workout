export function youtubeSearchUrl(query: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
}

/** Extracts a YouTube video id from watch / youtu.be / shorts / embed URLs. */
export function parseYoutubeId(url: string): string | null {
  const s = url.trim()
  if (/^[\w-]{11}$/.test(s)) return s
  try {
    const u = new URL(s)
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1).split('/')[0] || null
    if (u.hostname.includes('youtube')) {
      const v = u.searchParams.get('v')
      if (v) return v
      const m = u.pathname.match(/\/(shorts|embed|live|v)\/([\w-]{11})/)
      if (m) return m[2]
    }
  } catch { /* not a URL */ }
  return null
}

export function youtubeEmbedUrl(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`
}
