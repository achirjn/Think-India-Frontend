import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth.jsx'
import { authFetch } from '../utils/auth'

export default function UserPastEvents() {
  const { isLoggedIn, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [events, setEvents] = useState([])

  useEffect(() => {
    if (authLoading) return
    if (!isLoggedIn) navigate('/login')
  }, [authLoading, isLoggedIn, navigate])

  const imageUtils = useMemo(() => ({
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
      if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith('\'') && cleaned.endsWith('\''))) {
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
        if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith('\'') && trimmed.endsWith('\''))) {
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
  }), [])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (authLoading || !isLoggedIn) return
      setLoading(true)
      setError('')
      try {
        // Authenticated endpoint for past events
        const url = 'http://localhost:8082/user/pastEvents'
        const res = await authFetch(url, { headers: { 'Accept': 'application/json' } })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        const list = Array.isArray(data) ? data : []

        // Load ALL images for removable gallery UI
        const withImages = await Promise.all(list.map(async (ev, i) => {
          const imageIdList = ev.imageIdList || ev.imageIDs || ev.imageIds || []
          const alt = ev.name || ev.eventName || `Event ${i + 1}`
          const images = []
          if (Array.isArray(imageIdList)) {
            for (const id of imageIdList) {
              try {
                let imgRes = await fetch(`http://localhost:8082/image/${encodeURIComponent(id)}`, { headers: { 'Accept': 'application/json, text/plain, */*' } })
                if (!imgRes.ok) imgRes = await fetch(`http://localhost:8082/image/${encodeURIComponent(id)}`, { mode: 'cors' })
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
                images.push({ id, src })
              } catch {}
            }
          }
          return { ...ev, _alt: alt, _images: images, _imgSrc: images[0]?.src || '' }
        }))

        if (!cancelled) setEvents(withImages)
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load events')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [authLoading, isLoggedIn, imageUtils])

  const removeImage = (eventIndex, imgIndex) => {
    setEvents((prev) => prev.map((ev, i) => {
      if (i !== eventIndex) return ev
      const nextImages = (ev._images || []).filter((_, j) => j !== imgIndex)
      return { ...ev, _images: nextImages, _imgSrc: nextImages[0]?.src || '' }
    }))
  }

  if (authLoading || !isLoggedIn) {
    return (
      <section className="container-responsive py-responsive">
        <div className="text-center text-[color:var(--color-ashoka-blue)]">Loading...</div>
      </section>
    )
  }

  return (
    <section className="container-responsive py-responsive">
      <header className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[color:var(--color-ashoka-blue)]">Past Events</h1>
      </header>

      {error && <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-xl">{error}</div>}

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 rounded-2xl bg-gray-200 animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <p className="text-[color:var(--color-ashoka-blue)]/80">No past events.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((ev, idx) => (
            <motion.article 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.03 }}
              className="relative overflow-hidden rounded-2xl bg-[var(--bg-saffron-50)] shadow-sm"
            >
              <div className="aspect-[16/9] w-full overflow-hidden">
                {ev._imgSrc ? (
                  <img src={ev._imgSrc} alt={ev._alt} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-gray-100" />
                )}
              </div>
              <div className="p-5">
                <h3 className="text-xl font-bold text-[color:var(--color-ashoka-blue)]">{ev.name || ev.eventName || 'Event'}</h3>
                {Array.isArray(ev._images) && ev._images.length > 0 && (
                  <div className="mt-4">
                    <div className="text-sm font-medium text-[color:var(--color-ashoka-blue)] mb-2">Images</div>
                    <div className="flex flex-wrap gap-2">
                      {ev._images.map((img, iImg) => (
                        <div key={iImg} className="relative">
                          <img
                            src={img.src}
                            alt={`${ev._alt} ${iImg + 1}`}
                            className="h-16 w-24 object-cover rounded-md border"
                            onClick={() => setEvents(prev => prev.map((e2, idx2) => idx2 === idx ? { ...e2, _imgSrc: img.src } : e2))}
                          />
                          <button
                            type="button"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-600 text-white text-xs"
                            title="Remove from view"
                            onClick={() => removeImage(idx, iImg)}
                          >×</button>
                        </div>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-gray-500">Removing an image here only hides it on your device; it does not delete it from the server.</p>
                  </div>
                )}
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </section>
  )
}
