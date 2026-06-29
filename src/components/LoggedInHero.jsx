import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Button from './Button.jsx'
import ImageSlider from './ImageSlider.jsx'
import { localCacheGet, localCacheSet, cacheKeyForUrl } from '../utils/swrCache.js'
import { API_BASE_URL } from '../utils/config.js'

export default function LoggedInHero({ userName = '', apiEndpoint = '' }) {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Enhanced loader with progressive fetch, cross-tab cache and abort handling
  const loadImages = async ({ signal, controllersMap, ttlMs = 15 * 60 * 1000 } = {}) => {
    setLoading(true)
    setError(null)
    const cacheKey = cacheKeyForUrl(`${API_BASE_URL}/glimpses`, 'logged-hero-v1')
    const homeCacheKey = cacheKeyForUrl(`${API_BASE_URL}/glimpses`, 'glimpses-v1')

    // Serve cached immediately (cross-tab)
    try {
      // Prefer using the HomePage Glimpses cache if available, since it's the same endpoint
      let cached = localCacheGet(homeCacheKey)
      if (!cached || !Array.isArray(cached) || !cached.length) {
        cached = localCacheGet(cacheKey)
      }
      if (cached && Array.isArray(cached) && cached.length) {
        setImages(cached)
        setLoading(false)
      }
    } catch {}

    try {
      // Fetch list
      let res = await fetch(`${API_BASE_URL}/glimpses`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal
      })
      if (!res.ok) {
        res = await fetch(`${API_BASE_URL}/glimpses`, { method: 'GET', mode: 'cors', signal })
      }
      if (!res.ok) throw new Error(`Failed to fetch glimpses: HTTP ${res.status}`)

      const events = await res.json()
      const listRaw = Array.isArray(events) ? events : []
      // Dedupe image URLs while preserving order
      const seen = new Set()
      const slides = []
      for (const ev of listRaw) {
        const url = ev?.imageUrl || ev?.imageURL || ev?.image_url || ev?.url
        if (!url || typeof url !== 'string') continue
        if (seen.has(url)) continue
        seen.add(url)
        slides.push({ src: url, alt: ev.eventName || 'Event' })
      }

      const head = slides.slice(0, 2)
      const tail = slides.slice(2)

      if (head.length) {
        setImages(head)
      }

      // Append the rest progressively (no additional fetches needed)
      if (tail.length) {
        let current = [...head]
        for (let i = 0; i < tail.length; i++) {
          current = [...current, tail[i]]
          setImages(current)
          try { localCacheSet(cacheKey, current, ttlMs) } catch {}
          await new Promise((r) => setTimeout(r, 0))
        }
      }
    } catch (e) {
      console.error('Error loading images:', e)
      setError('Failed to load images. Please try again later.')
    } finally {
      setLoading(false)
    }
  }
  
  // Call loadImages when component mounts or apiEndpoint changes
  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()
    const imgControllers = new Map()
    const run = async () => {
      if (!cancelled) await loadImages({ signal: controller.signal, controllersMap: imgControllers, ttlMs: 15 * 60 * 1000 })
    }
    run()
    return () => {
      cancelled = true
      try { controller.abort() } catch {}
      imgControllers.forEach((ac) => { try { ac.abort() } catch {} })
      imgControllers.clear()
    }
  }, [])
  
  return (
    <section className="relative overflow-hidden min-h-fit lg:min-h-screen flex items-center lg:items-stretch">
      {/* Tricolor background for logged-in hero */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.0 }}
        className="absolute inset-0 -z-10"
      >
        <div className="h-full bg-gradient-to-b from-[color:var(--color-india-saffron)] via-white to-[color:var(--color-india-green)]" />
      </motion.div>
      <div className="container-responsive py-4 sm:py-6 md:py-8 lg:py-0 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 items-center lg:items-stretch lg:min-h-screen">
        {/* Left side - Text content */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="order-2 lg:order-1 flex flex-col items-start mt-6 sm:mt-10 lg:mt-14 lg:py-10"
        >
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[color:var(--color-ashoka-blue)] leading-tight"
          >
            Contribute to a Stronger India
          </motion.h1>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-2 text-base text-gray-700 max-w-md"
          >
            Discover new events, internships, and research opportunities tailored for you.
          </motion.p>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-6 w-full max-w-md"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="secondary" 
                className="whitespace-nowrap flex-1"
                as={Link}
                to="/internships"
              >
                Explore Opportunities
              </Button>
              <Button 
                variant="primary" 
                className="whitespace-nowrap flex-1"
                as={Link}
                to="/events"
              >
                Register for Upcoming Events
              </Button>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Right side - Image slider */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="order-1 lg:order-2 w-full h-full lg:mt-6 lg:max-w-[90%] lg:mx-auto"
        >
          {loading ? (
            <div className="w-full h-[46vh] sm:h-[55vh] md:h-[60vh] lg:h-[75vh] xl:h-[75vh] 2xl:h-[75vh] max-h-screen bg-gray-200 rounded-xl animate-pulse"></div>
          ) : error ? (
            <div className="w-full h-[46vh] sm:h-[55vh] md:h-[60vh] lg:h-[75vh] xl:h-[75vh] 2xl:h-[75vh] max-h-screen bg-gray-100 rounded-xl flex items-center justify-center">
              <div className="text-center p-6">
                <p className="text-red-500 mb-2">{error}</p>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => {
                    setLoading(true);
                    setError(null);
                    // Retry loading images after a short delay
                    setTimeout(() => {
                      loadImages();
                    }, 500);
                  }}
                >
                  Retry
                </Button>
              </div>
            </div>
          ) : (
            <ImageSlider 
              images={images} 
              intervalMs={8000} 
              className="rounded-xl shadow-xl"
              showTitle={false}
              showDots={false}
            />
          )}
        </motion.div>
      </div>
    </section>
  )
}