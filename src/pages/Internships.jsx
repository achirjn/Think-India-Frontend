import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import SectionDivider from '../components/SectionDivider.jsx'
import AnimatedTestimonials from '../components/ui/AnimatedTestimonials.jsx'
import useAuth from '../hooks/useAuth.jsx'
import { authFetch } from '../utils/auth.js'
import { stripHtmlToText } from '../utils/text.js'
import { cacheKeyForUrl, swrFetch } from '../utils/swrCache.js'
import { API_BASE_URL } from '../utils/config.js'

export default function Internships() {
  // posters for successful placements
  const navigate = useNavigate()
  const [posters, setPosters] = useState([])
  const [postersLoading, setPostersLoading] = useState(true)
  const [postersError, setPostersError] = useState('')
  // upcoming internships (auth-only)
  const auth = useAuth()
  const isLoggedIn = !!(auth && auth.isLoggedIn)
  const [upcoming, setUpcoming] = useState([])
  const [upcomingLoading, setUpcomingLoading] = useState(false)
  const [upcomingError, setUpcomingError] = useState('')

  // Internship Diaries testimonials (API)
  const [diaryTestimonials, setDiaryTestimonials] = useState([])
  const [diaryLoading, setDiaryLoading] = useState(true)
  const [diaryError, setDiaryError] = useState('')

  // static placeholders for slider (memoized to avoid re-creation each render)
  const placeholderImages = useMemo(() => ([
    { src: 'https://picsum.photos/seed/ti-1/600/800', alt: 'Temp poster 1' },
    { src: 'https://picsum.photos/seed/ti-2/600/800', alt: 'Temp poster 2' },
    { src: 'https://picsum.photos/seed/ti-3/600/800', alt: 'Temp poster 3' },
    { src: 'https://picsum.photos/seed/ti-4/600/800', alt: 'Temp poster 4' },
    { src: 'https://picsum.photos/seed/ti-5/600/800', alt: 'Temp poster 5' },
    { src: 'https://picsum.photos/seed/ti-6/600/800', alt: 'Temp poster 6' },
  ]), [])

  // Load Internship Diaries from backend using SWR pattern
  useEffect(() => {
    let cancelled = false
    const cacheKey = cacheKeyForUrl(`${API_BASE_URL}/internPlacements`, 'diaries-v1')
    const TTL = 5 * 60 * 1000

    const fetchDiaries = async () => {
      const controller = new AbortController()
      const listTimeout = setTimeout(() => { try { controller.abort() } catch {} }, 8000)
      const res = await fetch(`${API_BASE_URL}/internPlacements`, { signal: controller.signal })
      clearTimeout(listTimeout)
      if (!res.ok) throw new Error('Failed to fetch internship diaries')
      const data = await res.json()
      const rows = Array.isArray(data) ? data : (data?.items || [])
      const items = rows.map((it) => ({
        _src: it?.imageUrl || it?.imageURL || it?.image_url || it?.url || '',
        name: it?.studentName || it?.name || 'Student',
        designation: it?.designation || '',
        role: it?.role || '',
        instituteName: it?.instituteName || it?.institute || it?.company || '',
        message: it?.message || it?.quote || ''
      })).filter((it) => it && typeof it._src === 'string' && it._src)
      // Build slides directly from URL
      const slides = await Promise.all(items.map(async (it) => ({ src: it._src, alt: `${it.name} • ${it.instituteName || 'Internship'}`, caption: it.instituteName || '', ...it })))
      return slides
    }

    const { cached, revalidate } = swrFetch({ key: cacheKey, fetcher: fetchDiaries, ttlMs: TTL })
    if (cached && !cancelled) {
      setDiaryTestimonials(cached)
      setDiaryLoading(false)
    }
    revalidate
      .then((fresh) => {
        if (cancelled) return
        setDiaryTestimonials(fresh)
        setDiaryLoading(false)
      })
      .catch((e) => {
        if (cancelled) return
        const msg = (e?.message || '').toLowerCase()
        if (msg.includes('cors') || msg.includes('cross-origin')) {
          setDiaryError('CORS error: Unable to access the API. Please try again later.')
        } else if (msg.includes('network') || msg.includes('fetch')) {
          setDiaryError('Network error: Unable to reach the backend. Please try again later.')
        } else {
          setDiaryError(e.message)
        }
        setDiaryLoading(false)
      })

    const onFocus = () => {
      swrFetch({ key: cacheKey, fetcher: fetchDiaries, ttlMs: TTL }).revalidate
        .then((fresh) => { if (!cancelled) setDiaryTestimonials(fresh) })
        .catch(() => {})
    }
    window.addEventListener('focus', onFocus)
    return () => { cancelled = true; window.removeEventListener('focus', onFocus) }
  }, [])

  // Removed legacy public internships fetch (/api/internships)

  // Fetch upcoming internships for logged-in users only
  useEffect(() => {
    let cancelled = false
    if (!isLoggedIn) return () => {}
    const authDiscriminator = 'logged-in'
    const cacheKey = cacheKeyForUrl(`${API_BASE_URL}/user/getUpcommingInternships`, authDiscriminator)
    const TTL = 5 * 60 * 1000

    const fetchUpcoming = async () => {
      const res = await authFetch(`${API_BASE_URL}/user/getUpcommingInternships`)
      if (!res.ok) throw new Error('Failed to fetch upcoming internships')
      let data
      try { data = await res.json() } catch { data = [] }
      const list = Array.isArray(data) ? data : (data?.items || [])
      return list
    }

    const { cached, revalidate } = swrFetch({ key: cacheKey, fetcher: fetchUpcoming, ttlMs: TTL })
    if (cached && !cancelled) {
      setUpcoming(cached)
      setUpcomingLoading(false)
    }
    revalidate
      .then((fresh) => {
        if (cancelled) return
        setUpcoming(fresh)
        setUpcomingLoading(false)
      })
      .catch((e) => {
        if (cancelled) return
        const msg = (e?.message || '').toLowerCase()
        if (msg.includes('cors') || msg.includes('cross-origin')) {
          setUpcomingError('CORS error: Unable to access the API. Please try again later.')
        } else if (msg.includes('network') || msg.includes('fetch')) {
          setUpcomingError('Network error: Unable to reach the backend. Please try again later.')
        } else {
          setUpcomingError(e.message)
        }
        setUpcomingLoading(false)
      })

    const onFocus = () => {
      swrFetch({ key: cacheKey, fetcher: fetchUpcoming, ttlMs: TTL }).revalidate
        .then((fresh) => { if (!cancelled) setUpcoming(fresh) })
        .catch(() => {})
    }
    window.addEventListener('focus', onFocus)
    return () => { cancelled = true; window.removeEventListener('focus', onFocus) }
  }, [isLoggedIn])

  // Fetch successful placements posters
  useEffect(() => {
    let cancelled = false
    const cacheKey = cacheKeyForUrl(`${API_BASE_URL}/internPlacements`, 'posters-v1')
    const TTL = 5 * 60 * 1000

    const fetchPosters = async () => {
      const res = await fetch(`${API_BASE_URL}/internPlacements`)
      if (!res.ok) throw new Error('Failed to fetch internship placements')
      const data = await res.json()
      const rows = Array.isArray(data) ? data : (data?.items || [])
      const images = rows.map((it) => {
        const src = it?.imageUrl || it?.imageURL || it?.image_url || it?.url || ''
        if (!src) return null
        return { src, alt: it.studentName ? `${it.studentName} • ${it.instituteName || 'Internship'}` : 'Internship poster', caption: it.instituteName || '' }
      }).filter(Boolean)
      return images
    }

    const { cached, revalidate } = swrFetch({ key: cacheKey, fetcher: fetchPosters, ttlMs: TTL })
    if (cached && !cancelled) {
      setPosters(cached)
      setPostersLoading(false)
    }
    revalidate
      .then((fresh) => {
        if (cancelled) return
        setPosters(fresh)
        setPostersLoading(false)
      })
      .catch((e) => {
        if (cancelled) return
        const msg = (e?.message || '').toLowerCase()
        if (msg.includes('cors') || msg.includes('cross-origin')) {
          setPostersError('CORS error: Unable to access the API. Please try again later.')
        } else if (msg.includes('network') || msg.includes('fetch')) {
          setPostersError('Network error: Unable to reach the backend. Please try again later.')
        } else {
          setPostersError(e.message)
        }
        setPostersLoading(false)
      })

    const onFocus = () => {
      swrFetch({ key: cacheKey, fetcher: fetchPosters, ttlMs: TTL }).revalidate
        .then((fresh) => { if (!cancelled) setPosters(fresh) })
        .catch(() => {})
    }
    window.addEventListener('focus', onFocus)
    return () => { cancelled = true; window.removeEventListener('focus', onFocus) }
  }, [])

  // Show diaries section only when successfully loaded with non-empty data
  const showDiaries = (!diaryLoading && !diaryError && Array.isArray(diaryTestimonials) && diaryTestimonials.length > 0)

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <motion.h1 initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 120, damping: 18 }} className="text-center text-4xl sm:text-5xl font-extrabold tracking-tight text-[color:var(--color-ashoka-blue)]">Internships</motion.h1>
      <SectionDivider variant="bars" className="mt-6" />

      
      {/* Internship Diaries slider (3-up portrait) - render only if data present */}
      {showDiaries && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          className="mt-10"
        >
          <div className="flex items-center gap-3">
            <div className="h-1.5 w-14 rounded bg-[color:var(--color-india-green)]" />
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[color:var(--color-ashoka-blue)]">Internship Diaries</h3>
          </div>
          <p className="mt-2 text-[color:var(--color-ashoka-blue)]/80">Snapshots from our students’ successful internship journeys.</p>
          <div className="mt-5">
            <AnimatedTestimonials
              testimonials={diaryTestimonials}
              autoplay={false}
              heightClass="h-[200px] sm:h-[240px] md:h-[280px] lg:h-[320px]"
            />
          </div>
        </motion.div>
      )}

      {/* Internship Drive Intro (moved below slider) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mt-12"
      >
        <p className="text-gray-700 text-lg sm:text-xl max-w-4xl mx-auto">
          Our Internship Drive connects students across premier institutions with impactful opportunities, nurturing a
          “Nation First” mindset through real-world exposure and mentorship.
        </p>
        <div className="mt-5 max-w-4xl mx-auto">
          <h3 className="text-2xl sm:text-3xl font-bold text-[color:var(--color-ashoka-blue)]">Tracks We Offer</h3>
          <div className="mt-3 h-1 w-24 bg-[color:var(--color-india-saffron)] rounded"></div>
          <ul className="mt-5 space-y-3 text-base sm:text-lg text-gray-700 list-disc pl-6">
            <li>
              <span className="font-semibold text-[color:var(--color-ashoka-blue)]">DEEKSHA (Research):</span>
              {' '}Connect with faculty at IISc, IITs, IIMs, NITs, IIITs, NLUs, IISERs and industry for research-driven work.
            </li>
            <li>
              <span className="font-semibold text-[color:var(--color-ashoka-blue)]">VIDHI (Legal):</span>
              {' '}Opportunities for law students with legal practitioners and institutions.
            </li>
            <li>
              <span className="font-semibold text-[color:var(--color-ashoka-blue)]">ANUBHUTI (Social Sector):</span>
              {' '}Work with organizations focused on community development and social impact.
            </li>
            <li>
              <span className="font-semibold text-[color:var(--color-ashoka-blue)]">NITI (Public Policy):</span>
              {' '}Engage with think tanks and research orgs in public policy and governance.
            </li>
            <li>
              <span className="font-semibold text-[color:var(--color-ashoka-blue)]">SANSADIYA:</span>
              {' '}Intern with Members of Parliament and Ministers for hands-on policy exposure.
            </li>
          </ul>
        </div>
      </motion.div>

      {/* Upcoming Internships section or signup prompt (below text section) */}
      {isLoggedIn ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mt-12"
        >
          <div className="flex items-center gap-3">
            <div className="h-1.5 w-14 rounded bg-[color:var(--color-india-saffron)]" />
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[color:var(--color-ashoka-blue)]">Upcoming Internships</h3>
          </div>
          {upcomingLoading && <div className="mt-4 text-gray-600">Loading upcoming internships…</div>}
          {upcomingError && <div className="mt-4 text-red-600">{upcomingError}</div>}
          {!upcomingLoading && !upcomingError && (
            upcoming.length ? (
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {upcoming.map((it, idx) => (
                  <div
                    key={it.id || it.title || idx}
                    className="rounded-xl border p-5 shadow-sm bg-white cursor-pointer hover:shadow-md transition"
                    onClick={() => {
                      const iid = it.id || it.uuid || it.slug || idx
                      navigate(`/internships/${encodeURIComponent(iid)}`, { state: { item: it } })
                    }}
                  >
                    <div className="h-1 w-14 bg-[color:var(--color-india-green)] rounded" />
                    <div className="mt-3 font-semibold text-[color:var(--color-ashoka-blue)]">
                      {(() => {
                        const role = it.role || it.title || 'Internship'
                        const institute = it.institute || it.company || ''
                        return institute ? `${role} — ${institute}` : role
                      })()}
                    </div>
                    {it.description && (
                      <p className="mt-1 text-sm text-gray-600">
                        {(() => {
                          const txt = stripHtmlToText(String(it.description || ''))
                          return txt.length > 180 ? txt.slice(0, 180).trimEnd() + '…' : txt
                        })()}
                      </p>
                    )}
                    {it.applyUrl && (
                      <a
                        className="mt-3 inline-block text-[color:var(--color-india-green)] font-medium"
                        href={it.applyUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Apply →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 text-gray-600">No upcomming internships. Stay with us for future opportunitities.</div>
            )
          )}
        </motion.div>
      ) : (
        <div className="mt-12 ml-3 sm:ml-8">
          <div className="flex items-start gap-3 rounded-md border-l-4 border-[color:var(--color-india-green)] bg-[color:var(--color-india-green)]/10 px-4 py-3 shadow-sm">
            <span className="mt-0.5 text-[color:var(--color-india-green)]">⚡</span>
            <p className="text-gray-800 text-lg">
              <a href="/signup" className="font-bold text-[color:var(--color-india-green)] hover:underline">Sign Up</a>{' '}for Upcoming Internships and future opportunities.
            </p>
          </div>
        </div>
      )}

      {/* Removed legacy internships listing */}
    </div>
  )
}
