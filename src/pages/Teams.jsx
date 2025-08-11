import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import SectionDivider from '../components/SectionDivider.jsx'

export default function Teams() {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/teams')
        if (!res.ok) throw new Error('Failed to fetch teams')
        const data = await res.json()
        setTeams(Array.isArray(data) ? data : data.teams || [])
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <motion.h1 initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 120, damping: 18 }} className="text-center text-4xl sm:text-5xl font-extrabold tracking-tight text-[color:var(--color-ashoka-blue)]">OUR TEAM</motion.h1>
      <SectionDivider variant="bars" className="mt-6" />
      {loading && <div className="mt-6 text-gray-600">Loading...</div>}
      {error && <div className="mt-6 text-red-600">{error}</div>}
      {!loading && !error && (
        <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <motion.div key={team.id || team.name} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-3xl border p-6 md:p-8 bg-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-baseline justify-between">
                <div className="text-xl font-bold text-[color:var(--color-ashoka-blue)]">{team.name}</div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(0,0,128,0.08)] text-[color:var(--color-ashoka-blue)]">{team.type || 'Core'}</span>
              </div>
              {team.members && (
                <ul className="mt-4 text-[1.05rem] leading-8 text-gray-700 list-disc list-inside space-y-1">
                  {team.members.map((m) => (
                    <li key={m.id || m}>{m.name || m}</li>
                  ))}
                </ul>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}


