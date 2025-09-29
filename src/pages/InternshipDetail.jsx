import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import useAuth from '../hooks/useAuth.jsx'
import { authFetch } from '../utils/auth.js'

export default function InternshipDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const auth = useAuth()

  const [item, setItem] = useState(location.state?.item || location.state?.internship || null)
  const [loading, setLoading] = useState(!item)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    const fetchOne = async () => {
      if (item || !id) return
      try {
        setLoading(true)
        setError('')
        // Fetch upcoming internships (auth required) and find by id
        const res = await authFetch('https://api.thinkindiasvnit.in/user/getUpcommingInternships')
        if (!res.ok) throw new Error('Failed to fetch internships')
        let list = []
        try { list = await res.json() } catch { list = [] }
        const found = (Array.isArray(list) ? list : (list?.items || [])).find((it) => String(it.id ?? it.uuid ?? it.slug) === String(id))
        if (!cancelled) setItem(found || null)
      } catch (e) {
        if (!cancelled) setError(e.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchOne()
    return () => { cancelled = true }
  }, [id, item, auth?.isLoggedIn])

  const role = item?.role || item?.title || 'Role not specified'
  const institute = item?.institute || item?.company || ''
  const description = item?.description || ''
  const eligibility = item?.eligibility || item?.eligiblity || ''
  const startDate = item?.startDate || item?.start || item?.start_time
  const durationDays = item?.duration || item?.durationDays || item?.days
  const heading = institute ? `${role} — ${institute}` : role

  const formattedStart = startDate
    ? new Date(startDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : ''
  const durationText = (d) => {
    const n = Number(d)
    if (!Number.isFinite(n) || n <= 0) return ''
    if (n % 30 === 0) {
      const months = n / 30
      return `${months} month${months > 1 ? 's' : ''}`
    }
    if (n % 7 === 0) {
      const weeks = Math.round(n / 7)
      return `${weeks} week${weeks > 1 ? 's' : ''}`
    }
    return `${n} day${n > 1 ? 's' : ''}`
  }

  // Build slides from potential image fields (only show slider if images exist)
  const imageUrls = (item?.imageUrls || item?.imageUrlList || item?.imageURLList || item?.images || [])
  const slides = Array.isArray(imageUrls) && imageUrls.length
    ? imageUrls.map((u) => (typeof u === 'string' && u) ? u : null).filter(Boolean)
    : (typeof item?.imageUrl === 'string' && item?.imageUrl ? [item.imageUrl] : [])
  const [idx, setIdx] = useState(0)
  useEffect(() => { setIdx(0) }, [id])
  const next = () => setIdx((p) => (slides.length ? (p + 1) % slides.length : 0))
  const prev = () => setIdx((p) => (slides.length ? (p - 1 + slides.length) % slides.length : 0))

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
        <div className="text-red-600">{error}</div>
      ) : !item ? (
        <div className="text-gray-600">Internship not found.</div>
      ) : (
        <>
          <motion.header initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[color:var(--color-ashoka-blue)]">
              {heading}
            </h1>
          </motion.header>

          {/* Share actions */}
          <div className="mt-3 flex gap-2">
            <button
              className="text-sm px-3 py-1.5 rounded-md border border-gray-300 bg-white text-[color:var(--color-ashoka-blue)] hover:bg-gray-50"
              onClick={() => {
                const url = window.location.href
                try { navigator.clipboard.writeText(url) } catch {}
              }}
            >
              Copy link
            </button>
            {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
              <button
                className="text-sm px-3 py-1.5 rounded-md border border-gray-300 bg-white text-[color:var(--color-ashoka-blue)] hover:bg-gray-50"
                onClick={async () => {
                  try { await navigator.share({ title: heading, url: window.location.href }) } catch {}
                }}
              >
                Share
              </button>
            )}
          </div>

          {/* Image Slider - only render if at least one image */}
          {slides.length > 0 && (
            <div className="mt-6">
              <div className="relative rounded-xl overflow-hidden shadow-lg bg-white border border-gray-200">
                {/* Flexible height to fit square (1:1) and portrait (2:3, 3:4) posters */}
                <div className="w-full bg-gray-50 flex items-center justify-center"
                     style={{ minHeight: '280px', height: '60vh', maxHeight: '760px' }}>
                  <img
                    key={idx}
                    src={slides[idx]}
                    alt={heading || 'Internship image'}
                    className="max-h-full max-w-full object-contain"
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
              </div>
            </div>
          )}

          {/* Description - render as raw HTML without headings/backgrounds */}
          {description && (
            <div
              className="mt-8 max-w-3xl text-[color:var(--color-ashoka-blue)] text-lg sm:text-xl leading-relaxed sm:leading-8 tracking-normal"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          )}

          {/* Eligibility - render as raw HTML without headings/backgrounds */}
          {eligibility && (
            <div
              className="mt-6 max-w-3xl text-[color:var(--color-ashoka-blue)] text-lg sm:text-xl leading-relaxed sm:leading-8 tracking-normal"
              dangerouslySetInnerHTML={{ __html: eligibility }}
            />
          )}
        </>
      )}
    </div>
  )
}
