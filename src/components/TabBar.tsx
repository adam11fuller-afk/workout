import { NavLink } from 'react-router'

const tabs = [
  { to: '/', label: 'Today', icon: <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4M12 8a4 4 0 100 8 4 4 0 000-8z" /> },
  { to: '/program', label: 'Program', icon: <path d="M4 6h16M4 12h16M4 18h10" /> },
  { to: '/history', label: 'History', icon: <path d="M4 5h16v15H4zM4 10h16M8 3v4M16 3v4" /> },
  { to: '/coverage', label: 'Coverage', icon: <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" /> },
  { to: '/settings', label: 'Settings', icon: <path d="M4 7h10M18 7h2M4 17h4M12 17h8M14 4v6M8 14v6" /> },
]

export function TabBar() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-bg/90 backdrop-blur border-t border-line safe-b">
      <div className="grid grid-cols-5 h-16">
        {tabs.map((t) => (
          <NavLink
            key={t.to} to={t.to} end={t.to === '/'}
            className={({ isActive }) => `flex flex-col items-center justify-center gap-1 ${isActive ? 'text-hot' : 'text-ink-3'}`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{t.icon}</svg>
            <span className="eyebrow !text-[10px] !tracking-[0.12em] text-current">{t.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
