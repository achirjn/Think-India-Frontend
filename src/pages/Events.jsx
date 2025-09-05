import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import SectionDivider from '../components/SectionDivider.jsx'
import { HoverCard } from '../components/ui/card-hover-effect.jsx'
import Button from '../components/Button.jsx'
import { publicFetch } from '../utils/auth'

export default function Events() {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [upcoming, setUpcoming] = useState([])
  const [past, setPast] = useState([])

  // Image helpers reused from user events
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
  }), [])

  const parseDate = (ev) => {
    const d = ev.dateTime || ev.date || ev.eventDate || ev.event_date || ev.when || null
    if (!d) return null
    const dt = new Date(d)
    return isNaN(dt.getTime()) ? null : dt
  }

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        // Public endpoints
        const [upRes, pastRes] = await Promise.all([
          publicFetch('https://api.thinkindiasvnit.in/upcommingEvents', { headers: { Accept: 'application/json' } }),
          publicFetch('https://api.thinkindiasvnit.in/pastEvents', { headers: { Accept: 'application/json' } })
        ])
        if (!upRes.ok && !pastRes.ok) throw new Error(`Failed to fetch events: UPC ${upRes.status}, PAST ${pastRes.status}`)

        const upListRaw = upRes.ok ? await upRes.json() : []
        const pastListRaw = pastRes.ok ? await pastRes.json() : []
        const upList = Array.isArray(upListRaw) ? upListRaw : []
        const pastList = Array.isArray(pastListRaw) ? pastListRaw : []

        const loadFirstImage = async (ev, i) => {
          const ids = ev.imageIdList || ev.imageIDs || ev.imageIds || []
          const firstId = Array.isArray(ids) && ids.length ? ids[0] : null
          const alt = ev.eventName || ev.name || `Event ${i + 1}`
          let src = ''
          if (firstId !== null && firstId !== undefined) {
            try {
              let imgRes = await publicFetch(`/image/${encodeURIComponent(firstId)}`, { headers: { 'Accept': 'application/json, text/plain, */*' } })
              if (!imgRes.ok) imgRes = await publicFetch(`/image/${encodeURIComponent(firstId)}`, { mode: 'cors' })
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
                  } catch {
                    base64 = imageUtils.sanitizeBase64(maybeJson)
                    mime = imageUtils.detectMime(base64) || 'image/jpeg'
                  }
                } else {
                  base64 = imageUtils.sanitizeBase64(maybeJson)
                  mime = imageUtils.detectMime(base64) || 'image/jpeg'
                }
              }
              src = dataUri || (base64 ? `data:${mime};base64,${base64}` : '')
            } catch { src = '' }
          }
          return {
            ...ev,
            _imgSrc: src,
            _alt: alt,
            _date: parseDate(ev),
            _name: ev.eventName || ev.name || 'Event',
            _desc: ev.details || ev.description || ev.eventDescription || ev.summary || '',
            _register: ev.registrationLink || ev.formLink || ev.registerUrl || ev.link || ''
          }
        }

        const [upWith, pastWith] = await Promise.all([
          Promise.all(upList.map((ev, i) => loadFirstImage(ev, i))),
          Promise.all(pastList.map((ev, i) => loadFirstImage(ev, i)))
        ])

        if (!cancelled) {
          setUpcoming(upWith)
          setPast(pastWith)
        }
      } catch (e) {
        if (!cancelled) {
          const msg = (e?.message || '').toLowerCase()
          if (msg.includes('cors') || msg.includes('cross-origin')) {
            setError('CORS error: Unable to access the API. Please try again later.')
          } else if (msg.includes('network') || msg.includes('fetch')) {
            setError('Network error: Unable to reach the backend. Please try again later.')
          } else {
            setError(`Failed to load events: ${e.message || ''}`.trim())
          }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [imageUtils])

  return (
    <section className="relative overflow-hidden min-h-fit py-8 sm:py-10 md:py-12">
      <div className="container-responsive">
        <header className="mb-8 sm:mb-10 md:mb-12">
          <motion.h1 
            initial={{ y: 30, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            transition={{ type: 'spring', stiffness: 120, damping: 18, delay: 0.1 }} 
            className="text-center text-4xl sm:text-5xl font-extrabold tracking-tight text-[color:var(--color-ashoka-blue)]"
          >
            Events
          </motion.h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <SectionDivider variant="bars" className="mt-6" />
          </motion.div>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl">{error}</div>
        )}

        {/* Upcoming Events */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[color:var(--color-ashoka-blue)] mb-4">Upcoming Events</h2>
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-64 rounded-2xl bg-gray-200 animate-pulse" />
              ))}
            </div>
          ) : upcoming.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
              <p className="text-[color:var(--color-ashoka-blue)] font-semibold">No upcoming events</p>
              <p className="mt-1 text-[color:var(--color-ashoka-blue)]/70">Stay with us for interesting events in the future.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((ev, idx) => (
                <HoverCard key={idx} className="rounded-xl">
                  <motion.article
                    whileHover={{ y: -8, scale: 1.02, boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="group rounded-xl overflow-hidden border bg-white shadow-lg flex flex-col cursor-pointer"
                    onClick={() => {
                      const name = (ev.eventName || ev.name || `Event ${idx + 1}`).toString()
                      const slug = name
                        .toLowerCase()
                        .replace(/[^a-z0-9\s-]/g, '')
                        .trim()
                        .replace(/\s+/g, '-')
                      navigate(`/events/${slug}`, { state: { item: ev } })
                    }}
                  >
                    <motion.div className="aspect-[16/9] w-full overflow-hidden" whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
                      {ev._imgSrc ? (
                        <img src={ev._imgSrc} alt={ev._alt} className="h-full w-full object-cover transition-transform duration-300" />
                      ) : (
                        <div className="h-full w-full bg-gray-100" />
                      )}
                    </motion.div>
                    <div className="p-5">
                      <motion.h3
                        whileHover={{ x: 5 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="text-xl font-bold text-[color:var(--color-ashoka-blue)] group-hover:text-[color:var(--color-india-saffron)] transition-colors"
                      >
                        {ev._name}
                      </motion.h3>
                      {ev._date && (
                        <p className="mt-1 text-sm text-[color:var(--color-ashoka-blue)]/70">{ev._date.toLocaleString()}</p>
                      )}
                      {ev._desc && (
                        <p className="mt-2 text-[color:var(--color-ashoka-blue)]/80 line-clamp-3">{ev._desc}</p>
                      )}
                      <div className="mt-4">
                        {ev._register ? (
                          <a href={ev._register} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                            <Button className="bg-[color:var(--color-india-saffron)] text-white" onClick={(e) => e.stopPropagation()}>Register</Button>
                          </a>
                        ) : (
                          <Button variant="secondary" disabled>Registration opening soon</Button>
                        )}
                      </div>
                    </div>
                  </motion.article>
                </HoverCard>
              ))}
            </div>
          )}
        </section>

        {/* Past Events */}
        <section className="mb-6">
          <h2 className="text-2xl font-bold text-[color:var(--color-ashoka-blue)] mb-4">Past Events</h2>
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 rounded-2xl bg-gray-200 animate-pulse" />
              ))}
            </div>
          ) : past.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
              <p className="text-[color:var(--color-ashoka-blue)] font-semibold">No past events to show</p>
              <p className="mt-1 text-[color:var(--color-ashoka-blue)]/70">Check back later for highlights from our previous activities.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {past.map((ev, idx) => (
                <HoverCard key={idx} className="rounded-xl">
                  <motion.article
                    whileHover={{ y: -8, scale: 1.02, boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="group rounded-xl overflow-hidden border bg-white shadow-lg flex flex-col cursor-pointer"
                    onClick={() => {
                      const name = (ev.eventName || ev.name || `Event ${idx + 1}`).toString()
                      const slug = name
                        .toLowerCase()
                        .replace(/[^a-z0-9\s-]/g, '')
                        .trim()
                        .replace(/\s+/g, '-')
                      navigate(`/events/${slug}`, { state: { item: ev } })
                    }}
                  >
                    <motion.div className="aspect-[16/9] w-full overflow-hidden" whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
                      {ev._imgSrc ? (
                        <img src={ev._imgSrc} alt={ev._alt} className="h-full w-full object-cover transition-transform duration-300" />
                      ) : (
                        <div className="h-full w-full bg-gray-100" />
                      )}
                    </motion.div>
                    <div className="p-5">
                      <motion.h3
                        whileHover={{ x: 5 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="text-xl font-bold text-[color:var(--color-ashoka-blue)] group-hover:text-[color:var(--color-india-saffron)] transition-colors"
                      >
                        {ev._name}
                      </motion.h3>
                      {ev._date && (
                        <p className="mt-1 text-sm text-[color:var(--color-ashoka-blue)]/70">{ev._date.toLocaleDateString()}</p>
                      )}
                      {ev._desc && (
                        <p className="mt-2 text-[color:var(--color-ashoka-blue)]/80 line-clamp-3">{ev._desc}</p>
                      )}
                    </div>
                  </motion.article>
                </HoverCard>
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  )
}
