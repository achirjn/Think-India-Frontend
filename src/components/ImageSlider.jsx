import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function buildDataSvg({ width = 1600, height = 900, bg = '#0F1C3F', label = 'Slide' }) {
  const svg = encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'>
      <defs>
        <linearGradient id='g' x1='0' x2='1' y1='0' y2='1'>
          <stop offset='0' stop-color='${bg}'/>
          <stop offset='1' stop-color='#111827'/>
        </linearGradient>
      </defs>
      <rect width='100%' height='100%' fill='url(#g)'/>
      <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='140' font-family='Poppins, Arial, sans-serif' font-weight='700'>${label}</text>
    </svg>`
  )
  return `data:image/svg+xml;charset=utf-8,${svg}`
}

export default function ImageSlider({ images, intervalMs = 2000, className = '' }) {
  const fallback = useMemo(
    () => [
      { src: buildDataSvg({ label: 'Event 1', bg: '#0F1C3F' }), alt: 'Event 1' },
      { src: buildDataSvg({ label: 'Event 2', bg: '#0B4F2E' }), alt: 'Event 2' },
      { src: buildDataSvg({ label: 'Event 3', bg: '#C76A11' }), alt: 'Event 3' },
      { src: buildDataSvg({ label: 'Event 4', bg: '#0F1C3F' }), alt: 'Event 4' },
    ],
    []
  )

  const slides = images && images.length > 0 ? images : fallback
  const [index, setIndex] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length)
    }, intervalMs)
    return () => clearInterval(timerRef.current)
  }, [intervalMs, slides.length])

  const goTo = (i) => setIndex(i % slides.length)

  return (
    <div className={`relative w-full overflow-hidden rounded-2xl bg-black ${className}`}>
      <div className="aspect-[19/9] w-full">
        <AnimatePresence mode="popLayout">
          <motion.img
            key={index}
            src={slides[index].src}
            alt={slides[index].alt}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0.2, scale: 0.98 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="h-full w-full object-cover"
          />
        </AnimatePresence>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent h-20" />

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-2.5 w-2.5 rounded-full transition ${i === index ? 'bg-[color:var(--color-india-saffron)] scale-110' : 'bg-white/70 hover:bg-white'}`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}










