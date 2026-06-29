import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import useAuth from '../hooks/useAuth.jsx'
import { authFetch } from '../utils/auth'
import { cacheKeyForUrl, swrFetch } from '../utils/swrCache.js'
import { API_BASE_URL } from '../utils/config.js'

export default function EventDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const auth = useAuth()
  const eventFromState = location.state?.item || location.state?.event || null
  const [event, setEvent] = useState(eventFromState)
  const [loading, setLoading] = useState(!eventFromState)
  const [error, setError] = useState('')

  const imageUtils = useMemo(() => ({
    extractBase64: (payload) => {
      if (!payload) return { base64: '', mime: '', dataUri: '' }
      if (typeof payload === 'string') {
        const trimmed = payload.trim()
        if (trimmed.startsWith('data:')) {
          const match = trimmed.match(/^data:([^;]+);base64,(.*)$/)
          return { base64: match?.[2] || '', mime: match?.[1] || '', dataUri: trimmed }
        }
        return { base64: trimmed, mime: '', dataUri: '' }
      }
      const candidates = [payload.base64Image, payload.image, payload.data, payload.base64]
      for (const c of candidates) { if (typeof c === 'string' && c) return { base64: c, mime: payload.contentType || payload.mime || 'image/jpeg', dataUri: '' } }
      return { base64: '', mime: '', dataUri: '' }
    }
  }), [])

  useEffect(() => {
    let cancelled = false
    const cacheKey = cacheKeyForUrl(`event-detail:${id}`, 'event-detail-v1')
    const TTL = 5 * 60 * 1000

    const fetchEvent = async () => {
      // try upcoming and past, pick first match by id
      const [upRes, pastRes] = await Promise.all([
        authFetch(`${API_BASE_URL}/upcommingEvents`).catch(() => null),
        authFetch(`${API_BASE_URL}/pastEvents`).catch(() => null)
      ])
      const upList = upRes?.ok ? await upRes.json() : []
      const pastList = pastRes?.ok ? await pastRes.json() : []
      const all = [...(Array.isArray(upList) ? upList : []), ...(Array.isArray(pastList) ? pastList : [])]
      const match = all.find((ev) => String(ev.id ?? ev.eventId ?? ev.eventID ?? ev.uuid) === id)
      if (!match) throw new Error('Event not found')

      const urls = match.imageUrls || match.imageUrlList || match.imageURLList || match.images || []
      let images = []
      if (Array.isArray(urls) && urls.length) {
        images = urls.map((u, idx) => (typeof u === 'string' && u) ? { id: idx, src: u } : null).filter(Boolean)
      } else {
        const single = match.imageUrl || match.imageURL || match.image_url || ''
        if (typeof single === 'string' && single) images = [{ id: 0, src: single }]
      }
      const composed = { ...match, _images: images, _imgSrc: images[0]?.src || '', _alt: match.name || match.eventName || 'Event' }
      return composed
    }

    if (eventFromState) {
      // Show state immediately but still revalidate in background
      setEvent(eventFromState)
      setLoading(false)
      swrFetch({ key: cacheKey, fetcher: fetchEvent, ttlMs: TTL }).revalidate
        .then((fresh) => { if (!cancelled) setEvent(fresh) })
        .catch(() => {})
    } else {
      const { cached, revalidate } = swrFetch({ key: cacheKey, fetcher: fetchEvent, ttlMs: TTL })
      if (cached && !cancelled) {
        setEvent(cached)
        setLoading(false)
      } else {
        setLoading(true)
      }
      revalidate
        .then((fresh) => {
          if (cancelled) return
          setEvent(fresh)
          setLoading(false)
        })
        .catch((e) => {
          if (cancelled) return
          setError(typeof e?.message === 'string' ? e.message : 'Failed to load event')
          setLoading(false)
        })
    }

    const onFocus = () => {
      swrFetch({ key: cacheKey, fetcher: fetchEvent, ttlMs: TTL }).revalidate
        .then((fresh) => { if (!cancelled) setEvent(fresh) })
        .catch(() => {})
    }
    window.addEventListener('focus', onFocus)
    return () => { cancelled = true; window.removeEventListener('focus', onFocus) }
  }, [auth?.isLoggedIn, eventFromState, id, imageUtils])

  // If arrived with state, still try to populate gallery images if missing
  useEffect(() => {
    let cancelled = false
    const maybeLoadGallery = async () => {
      if (!eventFromState || !event || Array.isArray(event._images)) return
      try {
        const urls = event.imageUrls || event.imageUrlList || event.imageURLList || event.images || []
        if (!Array.isArray(urls) || !urls.length) return
        const images = urls.map((u, idx) => (typeof u === 'string' && u) ? { id: idx, src: u } : null).filter(Boolean)
        if (!cancelled && images.length) setEvent((prev) => ({ ...(prev || {}), _images: images, _imgSrc: prev?._imgSrc || images[0]?.src }))
      } catch {}
    }
    maybeLoadGallery()
    return () => { cancelled = true }
  }, [auth?.isLoggedIn, event, eventFromState, imageUtils])

  const displayName = event?.name || event?.eventName || `Event #${id}`
  const dateValue = event?.dateTime || event?.date || event?.eventDate || event?.when
  const dateText = dateValue ? new Date(dateValue).toLocaleString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''
  const details = event?.details || event?.description || event?.eventDescription || ''
  const message = event?.message || event?.note || ''
  const slides = Array.isArray(event?._images) && event._images.length
    ? event._images.map((i) => i?.src).filter(Boolean)
    : (event?._imgSrc ? [event._imgSrc] : [])
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  useEffect(() => { setIdx(0) }, [id])
  const next = () => setIdx((p) => (slides.length ? (p + 1) % slides.length : 0))
  const prev = () => setIdx((p) => (slides.length ? (p - 1 + slides.length) % slides.length : 0))

  // Autoplay disabled: images change only via user interaction (Next/Prev or dots)
  // Keeping state for potential future use, but no interval is set.
  useEffect(() => {
    return () => {}
  }, [])

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <button
        className="mb-6 text-[color:var(--color-ashoka-blue)] hover:text-[color:var(--color-india-saffron)]"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      {loading ? (
        <div className="text-[color:var(--color-ashoka-blue)]">Loading…</div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl">{error}</div>
      ) : (
        <>
          <motion.header initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[color:var(--color-ashoka-blue)]">
              {displayName}
            </h1>
            {dateText && (
              <p className="mt-2 text-[color:var(--color-ashoka-blue)]/70">{dateText}</p>
            )}
          </motion.header>

          {/* Image Slider (16:9 aspect for slimmer height) */}
          <div className="mt-6">
            <div
              className="relative rounded-xl overflow-hidden shadow-lg bg-white"
            >
              {slides.length > 0 ? (
                <>
                  <div className="aspect-[16/9] w-full">
                    <img
                      key={idx}
                      src={slides[idx]}
                      alt={event?._alt || 'Event image'}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  {slides.length > 1 && (
                    <>
                      <button
                        aria-label="Previous image"
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-[color:var(--color-ashoka-blue)] shadow rounded-full w-9 h-9 flex items-center justify-center"
                        onClick={prev}
                      >
                        ‹
                      </button>
                      <button
                        aria-label="Next image"
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-[color:var(--color-ashoka-blue)] shadow rounded-full w-9 h-9 flex items-center justify-center"
                        onClick={next}
                      >
                        ›
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 bg-white/70 px-3 py-1 rounded-full shadow">
                        {slides.map((_, i) => (
                          <button
                            key={i}
                            aria-label={`Go to image ${i + 1}`}
                            className={`h-2.5 w-2.5 rounded-full ${i === idx ? 'bg-[color:var(--color-ashoka-blue)]' : 'bg-gray-300'}`}
                            onClick={() => setIdx(i)}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full aspect-[16/9] bg-gray-100 flex items-center justify-center text-gray-500">
                  No images available
                </div>
              )}
            </div>
          </div>

          {/* Details (render raw HTML) */}
          {details && (
            <div
              className="mt-8 text-[color:var(--color-ashoka-blue)] text-lg sm:text-xl leading-relaxed"
              dangerouslySetInnerHTML={{ __html: details }}
            />
          )}

          {/* Message (render raw HTML) */}
          {message && (
            <div
              className="mt-6 text-[color:var(--color-ashoka-blue)] text-lg sm:text-xl leading-relaxed"
              dangerouslySetInnerHTML={{ __html: message }}
            />
          )}
        </>
      )}
    </div>
  )
}
