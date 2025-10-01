import { useCallback, useRef } from 'react'

/**
 * HoverCard adds a subtle spotlight/radial gradient effect that follows
 * the cursor over the card. Works well on light cards as an accent.
 */
export function HoverCard({ children, className = '' }) {
	const containerRef = useRef(null)

	const handleMouseMove = useCallback((event) => {
		const target = containerRef.current
		const rect = target.getBoundingClientRect()
		const x = event.clientX - rect.left
		const y = event.clientY - rect.top
		target.style.setProperty('--hover-x', `${x}px`)
		target.style.setProperty('--hover-y', `${y}px`)
	}, [])

	return (
		<div
			ref={containerRef}
			onMouseMove={handleMouseMove}
			className={`relative group overflow-hidden rounded-xl ${className}`}
		>
			{/* Spotlight layer (above content but pointer-events-none) */}
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-200 group-hover:opacity-100"
				style={{
					background:
						'radial-gradient(360px 360px at var(--hover-x) var(--hover-y), rgba(255,153,51,0.55), transparent 45%), radial-gradient(420px 420px at var(--hover-x) var(--hover-y), rgba(19,136,8,0.35), transparent 60%), radial-gradient(180px 180px at var(--hover-x) var(--hover-y), rgba(255,255,255,0.28), transparent 65%)',
					zIndex: 2,
					mixBlendMode: 'soft-light',
				}}
			/>
			{/* Content layer */}
			<div className="relative z-[1] transition-transform duration-200 group-hover:scale-[1.015] group-hover:-translate-y-0.5 group-hover:saturate-110">{children}</div>
		</div>
	)
}

/**
{{ ... }}
 * renders children. Included to mirror the API suggested in the snippet.
 */
export function HoverEffect({ children, className = '' }) {
	return <div className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>{children}</div>
}

export default HoverCard
