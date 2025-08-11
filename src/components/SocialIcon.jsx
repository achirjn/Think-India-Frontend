export default function SocialIcon({ label, children, href = '#', className = '' }) {
  return (
    <a
      aria-label={label}
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-[color:var(--color-india-saffron)] hover:bg-white/15 transition ${className}`}
    >
      {children}
    </a>
  )
}










