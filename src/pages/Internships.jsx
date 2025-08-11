import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import SectionDivider from '../components/SectionDivider.jsx'

export default function Internships() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/internships')
        if (!res.ok) throw new Error('Failed to fetch internships')
        const data = await res.json()
        setItems(Array.isArray(data) ? data : data.items || [])
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <motion.h1 initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 120, damping: 18 }} className="text-center text-4xl sm:text-5xl font-extrabold tracking-tight text-[color:var(--color-ashoka-blue)]">Internships</motion.h1>
      <SectionDivider variant="bars" className="mt-6" />
      {loading && <div className="mt-6 text-gray-600">Loading...</div>}
      {error && <div className="mt-6 text-red-600">{error}</div>}
      {!loading && !error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <motion.div key={it.id || it.title} whileHover={{ y: -4 }} className="rounded-xl border p-5 shadow-sm bg-white">
              <div className="h-1 w-14 bg-[color:var(--color-india-saffron)] rounded" />
              <div className="mt-3 font-semibold text-[color:var(--color-ashoka-blue)]">{it.title}</div>
              <p className="mt-1 text-sm text-gray-600">{it.description}</p>
              {it.applyUrl && (
                <a className="mt-3 inline-block text-[color:var(--color-india-green)] font-medium" href={it.applyUrl} target="_blank" rel="noreferrer">Apply →</a>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}


