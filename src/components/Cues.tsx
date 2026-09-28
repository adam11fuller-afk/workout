export function Cues({ cues, className = '' }: { cues: string[]; className?: string }) {
  return (
    <ul className={`space-y-1.5 ${className}`}>
      {cues.map((c, i) => (
        <li key={i} className="flex gap-2.5 text-[15px] leading-snug text-ink-2">
          <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-hot shrink-0" />
          <span>{c}</span>
        </li>
      ))}
    </ul>
  )
}
