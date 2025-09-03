import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Button from './Button.jsx'
import ImageSlider from './ImageSlider.jsx'

export default function LoggedInHero({ userName = '', apiEndpoint = '' }) {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Define loadImages function outside useEffect so it can be referenced elsewhere
  const loadImages = async () => {
    setLoading(true)
    setError(null)
    try {
      // Mirror Glimpses section fetching from App.jsx
      let res = await fetch('https://api.thinkindiasvnit.in/glimpses', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      })
      if (!res.ok) {
        res = await fetch('https://api.thinkindiasvnit.in/glimpses', { method: 'GET', mode: 'cors' })
      }
      if (!res.ok) throw new Error(`Failed to fetch glimpses: HTTP ${res.status}`)

      const events = await res.json()
      const list = Array.isArray(events) ? events : []

      const imageUtils = {
        detectMime: (b64) => {
          if (!b64 || typeof b64 !== 'string') return ''
          const head = b64.slice(0, 16)
          if (head.startsWith('/9j/')) return 'image/jpeg'
          if (head.startsWith('iVBORw0KGgo')) return 'image/png'
          if (head.startsWith('R0lGOD')) return 'image/gif'
          if (head.startsWith('UklGR')) return 'image/webp'
          return ''
        },
        sanitizeBase64: (raw) => {
          if (!raw || typeof raw !== 'string') return ''
          let cleaned = raw.trim()
          if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
            try { cleaned = JSON.parse(cleaned) } catch {}
          }
          cleaned = String(cleaned).replace(/^data:[^;]+;base64,/, '')
          return cleaned.replace(/[^A-Za-z0-9+/=]/g, '')
        },
        extractBase64: (payload) => {
          let mime = '', dataUri = '', base64 = ''
          if (payload == null) return { base64, mime, dataUri }
          if (typeof payload === 'string') {
            const trimmed = payload.trim()
            if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
              try {
                const unwrapped = JSON.parse(trimmed)
                if (typeof unwrapped === 'string') return imageUtils.extractBase64(unwrapped)
              } catch {}
            }
            if (trimmed.startsWith('data:')) {
              dataUri = trimmed
              const match = trimmed.match(/^data:([^;]+);base64,(.*)$/)
              if (match) { mime = match[1]; base64 = match[2] }
              return { base64, mime, dataUri }
            }
            base64 = imageUtils.sanitizeBase64(trimmed)
            return { base64, mime, dataUri }
          }
          const candidates = [payload.base64Image, payload.base64, payload.data, payload.image, payload.base64EncodedImage]
          for (const c of candidates) {
            if (typeof c === 'string' && c.trim()) return imageUtils.extractBase64(c)
          }
          mime = payload.imageType || payload.mimeType || payload.contentType || mime
          const anyString = Object.values(payload).find((v) => typeof v === 'string')
          if (anyString) return imageUtils.extractBase64(anyString)
          return { base64, mime, dataUri }
        }
      }

      const slides = await Promise.all(
        list.map(async (ev, i) => {
          const imageId = ev.imageId ?? ev.imageID ?? ev.image_id ?? ev.imageid
          const alt = ev.eventName || `Event ${i + 1}`
          if (imageId === undefined || imageId === null) return { src: '', alt }
          try {
            let imgRes = await fetch(`https://api.thinkindiasvnit.in/image/${encodeURIComponent(imageId)}`, {
              method: 'GET',
              headers: { 'Accept': 'application/json, text/plain, */*' },
            })
            if (!imgRes.ok) {
              imgRes = await fetch(`https://api.thinkindiasvnit.in/image/${encodeURIComponent(imageId)}`, { method: 'GET', mode: 'cors' })
            }
            if (!imgRes.ok) throw new Error('image fetch error')
            const contentType = imgRes.headers.get('content-type') || ''
            let base64 = '', mime = '', dataUri = ''

            if (contentType.includes('application/json')) {
              const json = await imgRes.json()
              const ext = imageUtils.extractBase64(json)
              base64 = imageUtils.sanitizeBase64(ext.base64)
              mime = ext.mime || imageUtils.detectMime(base64) || 'image/jpeg'
              dataUri = ext.dataUri
            } else {
              const text = await imgRes.text()
              const maybeJson = text.trim()
              if (maybeJson.startsWith('{') || maybeJson.startsWith('[') || (maybeJson.startsWith('"') && maybeJson.endsWith('"'))) {
                try {
                  const parsed = JSON.parse(maybeJson)
                  const ext = imageUtils.extractBase64(parsed)
                  base64 = imageUtils.sanitizeBase64(ext.base64)
                  mime = ext.mime || imageUtils.detectMime(base64) || 'image/jpeg'
                  dataUri = ext.dataUri
                } catch {
                  base64 = imageUtils.sanitizeBase64(maybeJson)
                  mime = imageUtils.detectMime(base64) || 'image/jpeg'
                }
              } else {
                base64 = imageUtils.sanitizeBase64(maybeJson)
                mime = imageUtils.detectMime(base64) || 'image/jpeg'
              }
            }
            const src = dataUri || (base64 ? `data:${mime};base64,${base64}` : '')
            return { src, alt }
          } catch {
            return { src: '', alt }
          }
        })
      )

      const normalized = slides.filter((s) => s.src)
      setImages(normalized)
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
    const run = async () => {
      if (!cancelled) await loadImages()
    }
    run()
    return () => { cancelled = true }
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
                to="/user/events"
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