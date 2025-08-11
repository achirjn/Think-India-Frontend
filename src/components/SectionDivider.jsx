export default function SectionDivider({ variant = 'bars', className = '' }) {
  if (variant === 'bars') {
    return (
      <div className={`mx-auto w-36 ${className}`}>
        <div className="h-1 w-full grid grid-cols-3 gap-1">
          <div className="bg-[color:var(--color-india-saffron)] rounded" />
          <div className="bg-white rounded border border-gray-200" />
          <div className="bg-[color:var(--color-india-green)] rounded" />
        </div>
      </div>
    )
  }

  // default subtle line divider
  return (
    <div className={`mx-auto w-40 ${className}`}>
      <div className="h-px w-full bg-[color:var(--color-ashoka-blue)]/30" />
    </div>
  )
}


