import { Link } from 'react-router'
import { TEMPLATES } from '../data/program'
import { TopBar } from '../components/TopBar'
import { TYPE_TONE } from '../lib/session'

export default function Program() {
  return (
    <div>
      <TopBar eyebrow="Browse & edit" title="Program" />
      <div className="px-4 space-y-2">
        {TEMPLATES.map((t, i) => (
          <Link key={t.id} to={`/program/${t.id}`} className={`card p-4 flex items-center gap-3 active:bg-bg-3 rise d${Math.min(5, i + 1)}`}>
            <div className={`h-12 w-12 shrink-0 rounded-xl ${TYPE_TONE[t.type]} text-black display text-2xl flex items-center justify-center`}>
              {t.id.includes('-') ? t.id.split('-')[1] : t.type === 'sprints' ? 'S' : 'M'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="display text-2xl truncate">{t.name}</div>
              <div className="text-ink-2 text-sm truncate">{t.sub}</div>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-ink-3"><path d="M9 6l6 6-6 6" /></svg>
          </Link>
        ))}
        <div className="pt-4 text-ink-3 text-sm">
          Tap a session, then an exercise, to change its working weight, rep range, or pin a demo video.
          The program itself (exercises, cues, sets) is defined in <span className="font-mono text-ink-2">src/data/program.ts</span>.
        </div>
      </div>
    </div>
  )
}
