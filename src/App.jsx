import './App.css'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import AshokaChakra from './components/AshokaChakra.jsx'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import Internships from './pages/Internships.jsx'
import Teams from './pages/Teams.jsx'
import Blogs from './pages/Blogs.jsx'
import BlogDetail from './pages/BlogDetail.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import SocialIcon from './components/SocialIcon.jsx'
import ImageSlider from './components/ImageSlider.jsx'
import Admin from './pages/Admin.jsx'

function NavBar() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')
  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 120, damping: 16 }}
      className="sticky top-0 z-50 border-b"
    >
      <div className="bg-gradient-to-r from-[color:var(--color-india-saffron)] via-white to-[color:var(--color-india-green)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full overflow-hidden ring-2 ring-[color:var(--color-ashoka-blue)]">
                <div className="h-full w-full bg-gradient-to-b from-[color:var(--color-india-saffron)] via-white to-[color:var(--color-india-green)]" />
              </div>
              <span className="font-extrabold text-xl md:text-2xl tracking-wide text-[color:var(--color-ashoka-blue)]">Think India</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-base md:text-lg font-semibold">
              <Link className="hover:text-[color:var(--color-ashoka-blue)]" to="/#about">About</Link>
              <Link className="hover:text-[color:var(--color-ashoka-blue)]" to="/internships">Internships</Link>
              <Link className="hover:text-[color:var(--color-ashoka-blue)]" to="/teams">Teams</Link>
              <Link className="hover:text-[color:var(--color-ashoka-blue)]" to="/blogs">Blogs</Link>
              <Link className="hover:text-[color:var(--color-ashoka-blue)]" to="/#events">Events</Link>
              <Link className="hover:text-[color:var(--color-ashoka-blue)]" to="/#contact">Contact Us</Link>
            </nav>
            <div className="flex items-center gap-3">
              {isAdminRoute ? (
                <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/admin"
                    className="inline-flex items-center rounded-md border border-[color:var(--color-ashoka-blue)] bg-white px-4 py-2 text-[color:var(--color-ashoka-blue)] shadow hover:bg-white"
                  >
                    Admin
                  </Link>
                </motion.div>
              ) : (
                <>
                  <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      to="/admin"
                      className="hidden sm:inline-flex items-center rounded-md border border-[color:var(--color-ashoka-blue)] bg-white px-4 py-2 text-[color:var(--color-ashoka-blue)] shadow hover:bg-white"
                    >
                      Admin
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      to="/login"
                      className="hidden sm:inline-flex items-center rounded-md border border-[color:var(--color-ashoka-blue)] bg-white px-4 py-2 text-[color:var(--color-ashoka-blue)] shadow hover:bg-white"
                    >
                      Login
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      to="/signup"
                      className="hidden sm:inline-flex items-center rounded-md bg-[color:var(--color-ashoka-blue)] px-4 py-2 text-white shadow hover:opacity-90"
                    >
                      Sign up
                    </Link>
                  </motion.div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="h-1 w-full grid grid-cols-3">
        <div className="bg-[color:var(--color-india-saffron)]" />
        <div className="bg-white" />
        <div className="bg-[color:var(--color-india-green)]" />
      </div>
    </motion.header>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden min-h-[calc(100vh-4rem)] flex items-center">
      <div className="absolute inset-0 -z-10">
        <div className="h-full bg-gradient-to-b from-[color:var(--color-india-saffron)] via-white to-[color:var(--color-india-green)]" />
      </div>
      <AshokaChakra className="pointer-events-none absolute -right-24 top-10 -z-10" size={700} opacity={0.12} />
      <AshokaChakra className="pointer-events-none absolute -left-40 bottom-10 -z-10" size={420} opacity={0.08} rotate={30} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
        <motion.div initial={{ y: 24, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true, amount: 0.6 }} transition={{ type: 'spring', stiffness: 120, damping: 18 }} className="max-w-3xl text-[color:var(--color-ashoka-blue)]">
          <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight"><span className="text-[color:var(--color-india-saffron)]">Think</span> <span className="text-[color:var(--color-india-green)]">India</span></h1>
          <p className="mt-6 text-xl">
            A forum for students from premier institutions across India.
          </p>
          <p className="mt-2 text-lg">
            Bringing together the best talents with a "Nation First" attitude for national reconstruction.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <motion.a whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} href="#join" className="inline-flex items-center rounded-xl bg-[color:var(--color-india-saffron)] px-6 py-3 text-white font-semibold shadow-md">Join Our Mission</motion.a>
            <motion.a whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} href="#initiatives" className="inline-flex items-center rounded-xl bg-[color:var(--color-india-green)] px-6 py-3 text-white font-semibold shadow-md">Learn More</motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function Section({ id, title, children }) {
  return (
    <section id={id} className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.h2 initial={{ y: 16, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ type: 'spring', stiffness: 120, damping: 18 }} className="text-3xl font-extrabold text-[color:var(--color-ashoka-blue)]">{title}</motion.h2>
        <motion.div initial={{ y: 18, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true, amount: 0.3 }} transition={{ delay: 0.05, type: 'spring', stiffness: 120, damping: 18 }} className="mt-6">
          {children}
        </motion.div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="text-white" style={{ backgroundColor: 'var(--color-footer-blue)' }}>
      <div className="h-1 w-full grid grid-cols-3">
        <div className="bg-[color:var(--color-india-saffron)]" />
        <div className="bg-white" />
        <div className="bg-[color:var(--color-india-green)]" />
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="text-center md:text-left">
            <div className="mx-auto md:mx-0 h-12 w-12 rounded bg-white flex items-center justify-center text-[10px] font-bold text-[color:var(--color-footer-blue)]">TI</div>
            <div className="mt-4 text-2xl font-extrabold">Think India</div>
            <p className="mt-3 text-white/75 max-w-sm mx-auto md:mx-0">Empowering students to shape the future of India.</p>
          </div>
          <div className="text-center md:text-left">
            <div className="text-lg font-semibold">Quick Links</div>
            <div className="my-2 h-0.5 w-16 mx-auto md:mx-0 bg-white/30" />
            <ul className="mt-2 space-y-2 text-white/80">
              <li><Link className="hover:text-white" to="/">Home</Link></li>
              <li><a className="hover:text-white" href="#about">About</a></li>
              <li><a className="hover:text-white" href="#events">Events</a></li>
              <li><Link className="hover:text-white" to="/teams">Team</Link></li>
              <li><a className="hover:text-white" href="#contact">Contact</a></li>
            </ul>
          </div>
          <div className="text-center md:text-left">
            <div className="text-lg font-semibold">Resources</div>
            <div className="my-2 h-0.5 w-16 mx-auto md:mx-0 bg-white/30" />
            <ul className="mt-2 space-y-2 text-white/80">
              <li><Link className="hover:text-white" to="/blogs">Blog</Link></li>
              <li><Link className="hover:text-white" to="/internships">Internships</Link></li>
            </ul>
          </div>
          <div className="text-center md:text-left">
            <div className="text-lg font-semibold">Follow Us</div>
            <div className="my-2 h-0.5 w-16 mx-auto md:mx-0 bg-white/30" />
            <div className="mt-3 flex justify-center md:justify-start gap-4">
              <SocialIcon label="LinkedIn">in</SocialIcon>
              <SocialIcon label="Instagram">◎</SocialIcon>
              <SocialIcon label="Facebook">f</SocialIcon>
              <SocialIcon label="Twitter">t</SocialIcon>
              <SocialIcon label="YouTube">▶</SocialIcon>
              <SocialIcon label="Email">✉</SocialIcon>
            </div>
          </div>
        </div>
        <div className="mt-10 flex items-center justify-between border-t border-white/10 pt-6 text-xs text-white/70">
          <div>© {new Date().getFullYear()} Think India. All rights reserved.</div>
        </div>
      </div>
      <div className="h-1 w-full grid grid-cols-3">
        <div className="bg-[color:var(--color-india-saffron)]" />
        <div className="bg-white" />
        <div className="bg-[color:var(--color-india-green)]" />
      </div>
    </footer>
  )
}

function ContactSection() {
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setSubmitError('')
    setSubmitSuccess('')
    const form = event.currentTarget
    try {
      const formData = new FormData()
      formData.append('Name', form.name.value || '')
      formData.append('Email', form.email.value || '')
      formData.append('Message', form.message.value || '')

      let res = await fetch('http://localhost:8082/recommend', {
        method: 'POST',
        body: formData,
        mode: 'cors',
      })
      if (!res.ok) {
        // retry without explicit cors if needed
        res = await fetch('http://localhost:8082/recommend', { method: 'POST', body: formData })
      }
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      // backend returns plain text id (e.g., 1)
      const txt = await res.text().catch(() => '')
      setSubmitSuccess(txt ? 'Thanks! Your recommendation has been submitted.' : 'Thanks! Your recommendation has been submitted.')
      form.reset()
    } catch (e) {
      setSubmitError(typeof e?.message === 'string' ? e.message : 'Failed to submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="contact" className="py-20 my-20">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(80%_60%_at_10%_10%,#0F1C3F_0%,#0F1C3F_40%,#111827_100%)]" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-2 items-start">
            <div className="text-white">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">GET IN TOUCH</h2>
              <div className="mt-3 flex items-center gap-4">
                <span className="h-1 w-16 bg-[color:var(--color-india-saffron)] rounded" />
                <span className="h-1 w-12 bg-white/90 rounded" />
                <span className="h-1 w-16 bg-[color:var(--color-india-green)] rounded" />
              </div>
              <p className="mt-8 max-w-xl text-white/85 text-base">
                Interested in joining us but do not know where to start? Do you have a mind-blowing idea that you
                need help with? Reach out to us, we are happy to help!
              </p>
              <div className="mt-8 space-y-4">
                <div className="text-white/90">
                  <div className="font-semibold">Contact</div>
                  <div className="mt-1">Phone: <a className="underline hover:text-white" href="tel:+919876543210">+91 98765 43210</a></div>
                  <div>Email: <a className="underline hover:text-white" href="mailto:contact@thinkindia.org">contact@thinkindia.org</a></div>
                </div>
                <div>
                  <div className="font-semibold mb-2">Follow us</div>
                  <div className="flex flex-wrap gap-3">
                    <SocialIcon label="LinkedIn" href="https://linkedin.com">in</SocialIcon>
                    <SocialIcon label="Instagram" href="https://instagram.com">◎</SocialIcon>
                    <SocialIcon label="Facebook" href="https://facebook.com">f</SocialIcon>
                    <SocialIcon label="Twitter" href="https://twitter.com">t</SocialIcon>
                    <SocialIcon label="YouTube" href="https://youtube.com">▶</SocialIcon>
                    <SocialIcon label="Email" href="mailto:contact@thinkindia.org">✉</SocialIcon>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-xl ring-1 ring-[color:var(--color-india-green)]/40">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                    <input id="name" name="name" type="text" className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-ashoka-blue)]" />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
                    <input id="email" name="email" type="email" required className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-ashoka-blue)]" />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message <span className="text-red-500">*</span></label>
                    <textarea id="message" name="message" required rows="4" className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-ashoka-blue)]" />
                  </div>
                  {submitError && (
                    <div className="text-sm text-red-600">{submitError}</div>
                  )}
                  {submitSuccess && (
                    <div className="text-sm text-green-600">{submitSuccess}</div>
                  )}
                  <div className="flex justify-end">
                    <button type="submit" disabled={submitting} aria-label="Send" className="h-12 w-12 rounded-full bg-black text-white grid place-content-center shadow hover:opacity-90 disabled:opacity-60">
                      {submitting ? '…' : '→'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function HomePage() {
  const [eventImages, setEventImages] = useState([])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        // Fetch events list
        let res = await fetch('http://localhost:8082/events', {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
        })
        if (!res.ok) {
          res = await fetch('http://localhost:8082/events', { method: 'GET', mode: 'cors' })
        }
        if (!res.ok) throw new Error(`Failed to fetch events: HTTP ${res.status}`)

        const events = await res.json()
        const list = Array.isArray(events) ? events : []

        const detectImageMime = (b64) => {
          if (!b64 || typeof b64 !== 'string') return ''
          const head = b64.slice(0, 16)
          if (head.startsWith('/9j/')) return 'image/jpeg'
          if (head.startsWith('iVBORw0KGgo')) return 'image/png'
          if (head.startsWith('R0lGOD')) return 'image/gif'
          if (head.startsWith('UklGR')) return 'image/webp'
          return ''
        }

        const sanitizeBase64 = (raw) => {
          if (!raw || typeof raw !== 'string') return ''
          let cleaned = raw.trim()
          if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
            try { cleaned = JSON.parse(cleaned) } catch {}
          }
          cleaned = String(cleaned).replace(/^data:[^;]+;base64,/, '')
          cleaned = cleaned.replace(/[^A-Za-z0-9+/=]/g, '')
          return cleaned
        }

        const extractBase64 = (payload) => {
          let mime = ''
          let dataUri = ''
          let base64 = ''
          if (payload == null) return { base64, mime, dataUri }
          if (typeof payload === 'string') {
            const trimmed = payload.trim()
            if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
              try {
                const unwrapped = JSON.parse(trimmed)
                if (typeof unwrapped === 'string') return extractBase64(unwrapped)
              } catch {}
            }
            if (trimmed.startsWith('data:')) {
              dataUri = trimmed
              const match = trimmed.match(/^data:([^;]+);base64,(.*)$/)
              if (match) { mime = match[1]; base64 = match[2] }
              return { base64, mime, dataUri }
            }
            base64 = sanitizeBase64(trimmed)
            return { base64, mime, dataUri }
          }
          const candidates = [payload.base64Image, payload.base64, payload.data, payload.image, payload.base64EncodedImage]
          for (const c of candidates) {
            if (typeof c === 'string' && c.trim()) return extractBase64(c)
          }
          mime = payload.imageType || payload.mimeType || payload.contentType || mime
          const anyString = Object.values(payload).find((v) => typeof v === 'string')
          if (anyString) return extractBase64(anyString)
          return { base64, mime, dataUri }
        }

        // Fetch each image by imageId
        const slides = await Promise.all(
          list.map(async (ev, i) => {
            const imageId = ev.imageId ?? ev.imageID ?? ev.image_id ?? ev.imageid
            const alt = ev.eventName || `Event ${i + 1}`
            if (imageId === undefined || imageId === null) return { src: '', alt }
            try {
              let imgRes = await fetch(`http://localhost:8082/image/${encodeURIComponent(imageId)}`, {
                method: 'GET',
                headers: { 'Accept': 'application/json, text/plain, */*' },
              })
              if (!imgRes.ok) {
                imgRes = await fetch(`http://localhost:8082/image/${encodeURIComponent(imageId)}`, { method: 'GET', mode: 'cors' })
              }
              if (!imgRes.ok) throw new Error('image fetch error')
              const contentType = imgRes.headers.get('content-type') || ''
              let base64 = ''
              let mime = ''
              let dataUri = ''
              if (contentType.includes('application/json')) {
                const json = await imgRes.json()
                const ext = extractBase64(json)
                base64 = sanitizeBase64(ext.base64)
                mime = ext.mime || detectImageMime(base64) || 'image/jpeg'
                dataUri = ext.dataUri
              } else {
                const text = await imgRes.text()
                const maybeJson = text.trim()
                if (maybeJson.startsWith('{') || maybeJson.startsWith('[') || (maybeJson.startsWith('"') && maybeJson.endsWith('"'))) {
                  try {
                    const parsed = JSON.parse(maybeJson)
                    const ext = extractBase64(parsed)
                    base64 = sanitizeBase64(ext.base64)
                    mime = ext.mime || detectImageMime(base64) || 'image/jpeg'
                    dataUri = ext.dataUri
                  } catch {
                    base64 = sanitizeBase64(maybeJson)
                    mime = detectImageMime(base64) || 'image/jpeg'
                  }
                } else {
                  base64 = sanitizeBase64(maybeJson)
                  mime = detectImageMime(base64) || 'image/jpeg'
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
        if (!cancelled && normalized.length) setEventImages(normalized)
      } catch {
        // Ignore; ImageSlider will use its fallback slides
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <>
      <Hero />
      <Section id="about" title="About Us">
        <p className="text-gray-700 max-w-3xl">
          Think India is a student and young professionals movement aiming to bring together intellectuals, policymakers, and leaders to work towards a prosperous and self-reliant Bharat.
        </p>
      </Section>
      <Section id="initiatives" title="Key Initiatives">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: 'Internships', desc: 'Meaningful opportunities in governance, policy, and industry.', barClass: 'bg-[color:var(--color-india-saffron)]' },
            { title: 'Research', desc: 'Collaborative projects addressing national priorities.', barClass: 'bg-white' },
            { title: 'Leadership', desc: 'Workshops and programs that build character and capability.', barClass: 'bg-[color:var(--color-india-green)]' },
          ].map((card) => (
            <div
              key={card.title}
              className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[color:var(--color-ashoka-blue)]/30 hover:shadow-lg"
            >
              <div className={`pointer-events-none absolute inset-x-0 top-0 h-1 ${card.barClass}`} />
              <div className="mt-2 text-lg font-semibold text-[color:var(--color-ashoka-blue)]">{card.title}</div>
              <p className="mt-2 text-gray-600">{card.desc}</p>
            </div>
          ))}
        </div>
      </Section>
      <Section id="events" title="Events">
        <ImageSlider className="mb-2" intervalMs={2000} images={eventImages} />
      </Section>
      <ContactSection />
    </>
  )
}

export default function App() {
  // Smooth-scroll to in-page anchors when the hash changes, even across routes
  function ScrollToHash() {
    const location = useLocation()
    const initializedRef = useRef(false)
    useEffect(() => {
      // On initial load, ignore any existing hash so we land on the Hero
      if (!initializedRef.current) {
        initializedRef.current = true
        if (location.hash) {
          // remove hash without adding a new history entry
          window.history.replaceState({}, '', location.pathname + location.search)
        }
        window.scrollTo({ top: 0, behavior: 'auto' })
        return
      }

      if (location.hash) {
        const id = location.hash.replace('#', '')
        setTimeout(() => {
          const el = document.getElementById(id)
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 0)
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }, [location.pathname, location.hash])
    return null
  }

  return (
    <BrowserRouter>
      <ScrollToHash />
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/internships" element={<Internships />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blogs/:slug" element={<BlogDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
