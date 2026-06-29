import { motion } from 'framer-motion'
import { useEffect } from 'react'
import AshokaChakra from './AshokaChakra.jsx'
import { localCacheSet, cacheKeyForUrl } from '../utils/swrCache.js'

const LoadingPage = () => {
  // Prewarm: fetch glimpses list and first image; cache for HomePage
  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()
    const timeoutId = setTimeout(() => { try { controller.abort() } catch { } }, 8000)

    const cacheKey = cacheKeyForUrl('https://api.thinkindiasvnit.in/glimpses', 'glimpses-v1')

    const run = async () => {
      try {
        const res = await fetch('https://api.thinkindiasvnit.in/glimpses', {
          method: 'GET', headers: { 'Accept': 'application/json' }, signal: controller.signal
        })
        if (!res.ok) return
        const listRaw = await res.json()
        const list = Array.isArray(listRaw) ? listRaw : []
        const first = list.find((ev) => !!(ev?.imageUrl || ev?.imageURL || ev?.image_url || ev?.url))
        const src = first?.imageUrl || first?.imageURL || first?.image_url || first?.url || ''
        const alt = first?.name || first?.eventName || 'Glimpse'
        if (!cancelled && src) {
          localCacheSet(cacheKey, [{ src, alt }], 15 * 60 * 1000)
        }
      } catch { }
    }

    run()
    return () => {
      cancelled = true
      clearTimeout(timeoutId)
      try { controller.abort() } catch { }
    }
  }, [])
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-[color:var(--color-india-saffron)] via-white to-[color:var(--color-india-green)]"
    >
      {/* Loading Content */}
      <div className="text-center">
        {/* Rotating Ashoka Chakra */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <AshokaChakra size={120} opacity={0.8} />
        </motion.div>
      </div>
    </motion.div>
  )
}

export default LoadingPage
