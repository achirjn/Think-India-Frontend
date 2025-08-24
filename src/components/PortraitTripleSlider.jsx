import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function PortraitTripleSlider({
  images = [],
  intervalMs = 4500,
  className = '',
  heightClass = 'h-[54vh] sm:h-[58vh] md:h-[62vh] lg:h-[66vh]',
  showDots = true,
  autoplay = false,
}) {
  const pages = useMemo(() => {
    if (!images || images.length === 0) return [[]]
    const chunked = []
    for (let i = 0; i < images.length; i += 3) {
      chunked.push(images.slice(i, i + 3))
    }
    return chunked
  }, [images])

  const [index, setIndex] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!autoplay) return
    if (pages.length <= 1) return
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % pages.length)
    }, intervalMs)
    return () => clearInterval(timerRef.current)
  }, [autoplay, intervalMs, pages.length])

  const goTo = (i) => setIndex((i + pages.length) % pages.length)
  const goNext = () => goTo(index + 1)
  const goPrev = () => goTo(index - 1)

  const variants = {
    enter: (direction) => ({ x: direction > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({ x: direction < 0 ? 40 : -40, opacity: 0 })
  }

  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      <div className={`w-full ${heightClass}`}>
        <AnimatePresence mode="popLayout" initial={false} custom={1}>
          <motion.div
            key={index}
            custom={1}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="grid h-full grid-cols-3 gap-3 sm:gap-4"
          >
            {(pages[index] || []).map((img, i) => (
              <div key={img.src + i} className="relative h-full w-full rounded-xl overflow-hidden">
                <img
                  src={img.src}
                  alt={img.alt || `Slide ${i + 1}`}
                  className="h-full w-full object-cover transform scale-[1.03] will-change-transform"
                  style={{ aspectRatio: '3 / 4' }}
                />
                {img.caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                    <p className="text-xs sm:text-sm text-white/90 font-medium line-clamp-2">{img.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {pages.length > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center h-10 w-10 rounded-full bg-white/80 hover:bg-white shadow ring-1 ring-black/10"
            aria-label="Previous"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-[color:var(--color-ashoka-blue)]"><path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
          </button>
          <button
            type="button"
            onClick={goNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center h-10 w-10 rounded-full bg-white/80 hover:bg-white shadow ring-1 ring-black/10"
            aria-label="Next"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-[color:var(--color-ashoka-blue)]"><path d="M8.59 16.59 10 18l6-6-6-6-1.41 1.41L13.17 12z"/></svg>
          </button>
        </>
      )}

      {showDots && pages.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {pages.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-2.5 w-2.5 rounded-full transition ${i === index ? 'bg-[color:var(--color-india-saffron)] scale-110' : 'bg-black/30 hover:bg-black/60'}`}
              aria-label={`Go to set ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

