import { motion } from 'framer-motion'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

export default function InternshipDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const internship = location.state?.item || location.state?.internship || null

  return (
    <section className="container-responsive py-responsive">
      <button
        className="mb-6 text-[color:var(--color-ashoka-blue)] hover:text-[color:var(--color-india-saffron)]"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      <motion.header initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[color:var(--color-ashoka-blue)]">
          {internship?.title || internship?.company || `Internship #${id}`}
        </h1>
        {internship?.location && (
          <p className="mt-2 text-[color:var(--color-ashoka-blue)]/70">{internship.location}</p>
        )}
      </motion.header>

      {internship?.description && (
        <div className="mt-6 prose max-w-none">
          <p className="text-gray-700 whitespace-pre-line">{internship.description}</p>
        </div>
      )}

      {internship?.applyUrl && (
        <a className="mt-6 inline-block text-[color:var(--color-india-green)] font-semibold" href={internship.applyUrl} target="_blank" rel="noreferrer">
          Apply →
        </a>
      )}
    </section>
  )
}
