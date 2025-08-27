import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * AnimatedTestimonials
 * Props:
 * - testimonials: Array<{ quote?: string, message?: string, name: string, designation?: string, role?: string, instituteName?: string, src: string }>
 * - autoplay?: boolean (default: false)
 * - heightClass?: string (applied to image wrapper to match page sizing)
 */
export default function AnimatedTestimonials({ testimonials = [], autoplay = false, heightClass = '' }) {
  const [active, setActive] = useState(0)
  const total = testimonials.length

  const handleNext = () => setActive((p) => (p + 1) % total)
  const handlePrev = () => setActive((p) => (p - 1 + total) % total)
  const isActive = (i) => i === active

  useEffect(() => {
    if (!autoplay || total <= 1) return
    const id = setInterval(handleNext, 5000)
    return () => clearInterval(id)
  }, [autoplay, total])

  const randomRotateY = () => Math.floor(Math.random() * 21) - 10

  // Ensure there is at least one item to render gracefully
  const items = useMemo(() => (Array.isArray(testimonials) && testimonials.length ? testimonials : []), [testimonials])

  if (!items.length) return null

  return (
    <div className="w-full">
      <div className="relative grid grid-cols-1 gap-3 md:grid-cols-2">
        {/* Image stack */}
        <div>
          {/* Constrain image size similar to reference */}
          <div className={`mx-auto w-full max-w-[220px] sm:max-w-[260px] md:max-w-[300px] lg:max-w-[340px] relative ${heightClass || 'h-80'} `}>
            <AnimatePresence>
              {items.map((t, index) => (
                <motion.div
                  key={t.src + index}
                  initial={{ opacity: 0, scale: 0.9, z: -100, rotate: randomRotateY() }}
                  animate={{
                    opacity: isActive(index) ? 1 : 0.75,
                    scale: isActive(index) ? 1 : 0.95,
                    z: isActive(index) ? 0 : -100,
                    rotate: isActive(index) ? 0 : randomRotateY(),
                    zIndex: isActive(index) ? 40 : items.length + 2 - index,
                    y: isActive(index) ? [0, -60, 0] : 0,
                  }}
                  exit={{ opacity: 0, scale: 0.9, z: 100, rotate: randomRotateY() }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  className="absolute inset-0 origin-bottom"
                >
                  <img
                    src={t.src}
                    alt={t.name || 'testimonial'}
                    draggable={false}
                    className="h-full w-full object-cover object-center rounded-2xl"
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Text + controls */}
        <div className="flex flex-col justify-between py-1">
          <motion.div
            key={active}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <h3 className="text-2xl font-bold text-[color:var(--color-ashoka-blue)]">{items[active].name}</h3>
            {items[active].designation ? (
              <p className="text-sm text-gray-600">{items[active].designation}</p>
            ) : null}
            {(items[active].role || items[active].instituteName) ? (
              <p className="mt-1 text-base sm:text-lg text-[color:var(--color-ashoka-blue)]">
                {items[active].role ? <span className="font-medium text-[color:var(--color-ashoka-blue)]">{items[active].role}</span> : null}
                {items[active].role && items[active].instituteName ? ' — ' : ''}
                {items[active].instituteName || ''}
              </p>
            ) : null}
            <motion.p className="mt-4 text-base sm:text-lg text-gray-700">
              {String(items[active].message || items[active].quote || '')
                .split(' ')
                .map((word, i) => (
                  <motion.span
                    key={i}
                    initial={{ filter: 'blur(10px)', opacity: 0, y: 5 }}
                    animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut', delay: 0.02 * i }}
                    className="inline-block"
                  >
                    {word}&nbsp;
                  </motion.span>
                ))}
            </motion.p>
          </motion.div>

          <div className="flex gap-3 pt-10 md:pt-0">
            <button
              onClick={handlePrev}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition"
              aria-label="Previous"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-[color:var(--color-ashoka-blue)]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={handleNext}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition"
              aria-label="Next"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-[color:var(--color-ashoka-blue)]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
