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

          {/* Description */}
          {description && (
            <div className="mt-6 rounded-xl border p-5 bg-white/70">
              <h3 className="text-lg font-semibold text-[color:var(--color-ashoka-blue)]">Description</h3>
              <p className="mt-2 text-gray-700 whitespace-pre-line">{description}</p>
            </div>
          )}

          {/* Eligibility */}
          {eligibility && (
            <div className="mt-6 rounded-xl border p-5 bg-white/70">
              <h3 className="text-lg font-semibold text-[color:var(--color-ashoka-blue)]">Eligibility</h3>
              <p className="mt-2 text-gray-700 whitespace-pre-line">{eligibility}</p>
            </div>
          )}

          {/* Start date and duration */}
          {(formattedStart || durationDays) && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {formattedStart && (
                <div className="rounded-xl border p-5 bg-white/70">
                  <h3 className="text-lg font-semibold text-[color:var(--color-ashoka-blue)]">Start Date</h3>
                  <p className="mt-2 text-gray-700">{formattedStart}</p>
                </div>
              )}
              {durationDays && (
                <div className="rounded-xl border p-5 bg-white/70">
                  <h3 className="text-lg font-semibold text-[color:var(--color-ashoka-blue)]">Duration</h3>
                  <p className="mt-2 text-gray-700">{durationText(durationDays)}</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
