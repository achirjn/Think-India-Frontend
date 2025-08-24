import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { authFetch, isAuthenticated, removeToken, getToken } from '../utils/auth'

const TABS = [
  { key: 'blogs', label: 'Blogs' },
  { key: 'teams', label: 'Teams' },
  { key: 'events', label: 'Events' },
  { key: 'glimpses', label: 'Glimpses' },
  { key: 'recommendations', label: 'Recommendations' },
  { key: 'internships', label: 'Internships' },
]

export default function Admin() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('blogs')
  
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login')
      return
    }
    // Check admin rights
    if (localStorage.getItem('is_admin') !== 'true') {
      window.alert('Access Denied!')
      navigate('/')
      return
    }
  }, [navigate])

  const handleLogout = () => {
    removeToken()
    localStorage.removeItem('is_admin')
    navigate('/login')
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10"
    >
      <motion.div 
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18, delay: 0.1 }}
        className="flex justify-between items-center"
      >
        <motion.h1
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 120, damping: 18, delay: 0.2 }}
          className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[color:var(--color-ashoka-blue)]"
        >
          Admin Dashboard
        </motion.h1>
      </motion.div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="mt-8 flex flex-wrap gap-3"
      >
        {TABS.map((t, index) => (
          <motion.button
            key={t.key}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 15, 
              delay: 0.4 + index * 0.1 
            }}
            whileHover={{ 
              scale: 1.05, 
              y: -2,
              boxShadow: "0 10px 20px rgba(0,0,0,0.1)"
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab(t.key)}
            className={`rounded-full px-4 py-2 text-sm font-semibold border transition-all duration-200 ${
              activeTab === t.key
                ? 'bg-[color:var(--color-ashoka-blue)] text-white border-[color:var(--color-ashoka-blue)] shadow-lg'
                : 'bg-white text-[color:var(--color-ashoka-blue)] border-[color:var(--color-ashoka-blue)] hover:bg-[rgba(0,0,128,0.04)]'
            }`}
          >
            {t.label}
          </motion.button>
        ))}
      </motion.div>

      <motion.div 
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-8"
      >
        {activeTab === 'blogs' && <BlogsPanel />}
        {activeTab === 'teams' && <TeamsPanel />}
        {activeTab === 'events' && <EventsPanel />}
        {activeTab === 'glimpses' && <GlimpsesPanel />}
        {activeTab === 'recommendations' && <RecommendationsPanel />}
        {activeTab === 'internships' && <InternshipsPanel />}
      </motion.div>
    </motion.div>
  )
}

function useJsonFetch() {
  const common = useMemo(
    () => ({ headers: { 'Content-Type': 'application/json' } }),
    [],
  )
  
  const get = async (url) => {
    const res = await authFetch(url)
    if (!res.ok) throw new Error(await safeMessage(res))
    return res.json()
  }
  
  const post = async (url, body) => {
    const isFormData = body instanceof FormData
    const options = {
      method: 'POST',
      body: isFormData ? body : JSON.stringify(body)
    }
    
    if (!isFormData) {
      options.headers = { 'Content-Type': 'application/json' }
    }
    
    const res = await authFetch(url, options)
    if (!res.ok) throw new Error(await safeMessage(res))
    return res.json()
  }
  
  const patch = async (url, body) => {
    const res = await authFetch(url, { method: 'PATCH', body: JSON.stringify(body), ...common })
    if (!res.ok) throw new Error(await safeMessage(res))
    return res.json()
  }
  
  return { get, post, patch }
}

async function safeMessage(res) {
  try {
    const data = await res.json()
    return data?.message || data?.error || res.statusText
  } catch {
    return res.statusText
  }
}

function PanelShell({ title, description, children, footer }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="rounded-2xl border bg-white shadow-sm overflow-hidden"
    >
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="p-6 bg-[color:var(--color-ashoka-blue)] text-white border-b border-white/20"
      >
        <motion.div 
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-xl font-bold"
        >
          {title}
        </motion.div>
        {description && (
          <motion.p 
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="mt-1 text-sm text-white/90"
          >
            {description}
          </motion.p>
        )}
      </motion.div>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="p-6"
      >
        {children}
      </motion.div>
      {footer && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="p-4 border-t bg-gray-50"
        >
          {footer}
        </motion.div>
      )}
    </motion.div>
  )
}

function BlogsPanel() {
  const { get, post } = useJsonFetch()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ title: '', excerpt: '', coverImage: null })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')
  const [deleting, setDeleting] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      // Fetch all public blogs for management list
      let res = await fetch('http://localhost:8082/blogPageGetAllBlogs', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      })
      if (!res.ok) {
        // retry with CORS fallback if needed
        res = await fetch('http://localhost:8082/blogPageGetAllBlogs', { method: 'GET', mode: 'cors' })
      }
      if (!res.ok) throw new Error(res.statusText)
      const data = await res.json().catch(() => [])
      setItems(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(typeof e?.message === 'string' ? e.message : 'Failed to load blogs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')
    try {
      // Build form-data exactly as backend expects (Title, Excerpt, Cover_image)
      const formData = new FormData()
      formData.append('Title', form.title)
      formData.append('Excerpt', form.excerpt)
      if (form.coverImage) {
        formData.append('Cover_image', form.coverImage)
      }
      // Use authenticated fetch for admin endpoint
      let res = await authFetch('http://localhost:8082/api/admin/createBlog', {
        method: 'POST',
        body: formData
      })
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      const text = await res.text().catch(() => '') // backend may return plain text or empty body
      setSuccess(text ? `Created blog (id: ${text})` : 'Created blog successfully')
      setForm({ title: '', excerpt: '', coverImage: null })
      try { await load() } catch {}
    } catch (e) {
      // Avoid trying to parse HTML error pages as JSON
      setError(typeof e?.message === 'string' ? e.message : 'Failed to create blog')
    } finally {
      setSubmitting(false)
    }
  }

  const deleteBlog = async (rawHeading) => {
    const clean = String(rawHeading || '').trim()
    if (!clean) {
      setError('Cannot delete: Missing blog heading')
      return
    }
    try {
      setDeleting(clean)
      setError('')
      const enc = encodeURIComponent(clean)
      const tries = [
        { url: `http://localhost:8082/deleteBlog/${enc}`, method: 'DELETE' },
        { url: `http://localhost:8082/api/admin/deleteBlog/${enc}`, method: 'DELETE' },
        { url: `http://localhost:8082/deleteBlog/${enc}`, method: 'GET' },
        { url: `http://localhost:8082/api/admin/deleteBlog/${enc}`, method: 'GET' },
      ]
      let ok = false
      let lastStatus = ''
      for (const t of tries) {
        const res = await authFetch(t.url, { method: t.method })
        if (res.ok) { ok = true; break }
        lastStatus = `${res.status} ${res.statusText}`
        if (res.status === 404) continue
      }
      if (!ok) throw new Error(`Delete failed (${lastStatus || 'unknown'}) for heading "${clean}"`)
      await load()
    } catch (e) {
      setError(typeof e?.message === 'string' ? e.message : 'Delete failed')
    } finally {
      setDeleting('')
    }
  }

  return (
    <PanelShell title="Manage Blogs" description="Create and review blog entries.">
      <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-ashoka-blue)]" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Excerpt</label>
          <textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={3} className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-ashoka-blue)]" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Cover Image</label>
          <input 
            type="file" 
            accept="image/*"
            onChange={(e) => setForm({ ...form, coverImage: e.target.files[0] || null })} 
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-ashoka-blue)]" 
          />
          {form.coverImage && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {form.coverImage.name}
            </p>
          )}
        </div>
        <div className="sm:col-span-2 flex items-center justify-between">
          <div className="text-sm text-red-600">{error}</div>
          {success && <div className="text-sm text-green-600">{success}</div>}
          <button disabled={submitting} className="rounded-lg bg-[color:var(--color-ashoka-blue)] px-5 py-3 text-white font-semibold shadow hover:opacity-90 disabled:opacity-60">
            {submitting ? 'Saving…' : 'Add Blog'}
          </button>
        </div>
      </form>
      <div className="mt-8">
        {loading && <div className="text-gray-600">Loading…</div>}
        {error && <div className="text-red-600">{error}</div>}
        {!loading && !error && (
          <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">ID</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Heading</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Posted</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Preview</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-4 text-center text-gray-500">No blogs found.</td>
                  </tr>
                )}
                {items.map((b, i) => {
                  const heading = typeof b.heading === 'string' ? b.heading.trim() : ''
                  return (
                  <tr key={b.id ?? heading ?? i}>
                    <td className="px-4 py-2 text-gray-700">{b.id ?? i + 1}</td>
                    <td className="px-4 py-2 text-gray-700">{heading || 'Untitled'}</td>
                    <td className="px-4 py-2 text-gray-700">{b.postTime ? new Date(b.postTime).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}</td>
                    <td className="px-4 py-2 text-gray-700 max-w-[30rem] truncate" title={b.content}>{b.content}</td>
                    <td className="px-4 py-2 text-gray-700">
                      <button
                        onClick={() => deleteBlog(heading)}
                        className="rounded-md bg-red-600 px-3 py-1.5 text-white disabled:opacity-60"
                        disabled={!heading || deleting === heading}
                      >
                        {deleting === heading ? 'Deleting…' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PanelShell>
  )
}

function TeamsPanel() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({ name: '', image: null, position: '', committee: '' })
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('http://localhost:8082/getTeamMember')
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      const data = await res.json()
      setMembers(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')
    try {
      const formData = new FormData()
      formData.append('Name', form.name)
      formData.append('Position', form.position)
      formData.append('Committee', form.committee)
      if (form.image) {
        formData.append('Member_image', form.image)
      }
      
      const res = await authFetch('http://localhost:8082/api/admin/addTeamMember', {
        method: 'POST',
        body: formData
      })
      
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      
      setSuccess('Team member added successfully!')
      setForm({ name: '', image: null, position: '', committee: '' })
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const deleteMember = async (id) => {
    if (!id) return
    setDeleting(id)
    setError('')
    try {
      const res = await authFetch(`http://localhost:8082/api/admin/deleteTeamMember/${id}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setDeleting('')
    }
  }

  return (
    <PanelShell title="Manage Team Members" description="Add team members with name, image, position, and committee details.">
      <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Member Name</label>
          <input 
            value={form.name} 
            onChange={(e) => setForm({ ...form, name: e.target.value })} 
            required 
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-ashoka-blue)]" 
            placeholder="Enter member name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Position</label>
          <input 
            value={form.position} 
            onChange={(e) => setForm({ ...form, position: e.target.value })} 
            required 
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-ashoka-blue)]" 
            placeholder="e.g., President, Vice President"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Committee</label>
          <input 
            value={form.committee} 
            onChange={(e) => setForm({ ...form, committee: e.target.value })} 
            required 
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-ashoka-blue)]" 
            placeholder="e.g., Core Team, Cell Heads"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Member Image</label>
          <input 
            type="file" 
            accept="image/*"
            onChange={(e) => setForm({ ...form, image: e.target.files[0] || null })} 
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-ashoka-blue)]" 
          />
          {form.image && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {form.image.name}
            </p>
          )}
        </div>
        <div className="sm:col-span-2 flex items-center justify-between">
          <div>
            {error && <div className="text-sm text-red-600">{error}</div>}
            {success && <div className="text-sm text-green-600">{success}</div>}
          </div>
          <button 
            disabled={submitting} 
            className="rounded-lg bg-[color:var(--color-ashoka-blue)] px-5 py-3 text-white font-semibold shadow hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? 'Adding…' : 'Add Team Member'}
          </button>
        </div>
      </form>
      
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">All Team Members</h3>
        {loading && <div className="text-gray-600">Loading members…</div>}
        {error && <div className="text-red-600">{error}</div>}
        {!loading && !error && (
          <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">ID</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Image</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Position</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Committee</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {members.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No team members found. Add your first member above.
                    </td>
                  </tr>
                )}
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700 font-medium">{member.id}</td>
                    <td className="px-4 py-3">
                      {member.imageId ? (
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                          <img 
                            src={`http://localhost:8082/image/${member.imageId}`}
                            alt={member.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none'
                              e.target.nextSibling.style.display = 'flex'
                            }}
                          />
                          <div className="w-full h-full bg-[color:var(--color-ashoka-blue)] text-white text-xs font-bold flex items-center justify-center" style={{display: 'none'}}>
                            {member.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[color:var(--color-ashoka-blue)] text-white text-xs font-bold flex items-center justify-center">
                          {member.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-900 font-medium">{member.name}</td>
                    <td className="px-4 py-3 text-gray-700">{member.position}</td>
                    <td className="px-4 py-3 text-gray-700">{member.committee}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => deleteMember(member.id)}
                        disabled={deleting === member.id}
                        className="rounded-md bg-red-600 hover:bg-red-700 px-3 py-1.5 text-white text-sm font-medium disabled:opacity-60 transition-colors"
                      >
                        {deleting === member.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PanelShell>
  )
}

function EventsPanel() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: '',
    details: '',
    message: '',
    dateTime: '',
    isActive: false,
    showEvent: false,
    images: []
  })

  // Inline events management state
  const [eventsError, setEventsError] = useState('')
  const [upLoading, setUpLoading] = useState(false)
  const [pastLoading, setPastLoading] = useState(false)
  const [upcoming, setUpcoming] = useState([])
  const [past, setPast] = useState([])

  const parseDate = (ev) => {
    const d = ev?.dateTime || ev?.date || ev?.eventDate || ev?.event_date || ev?.when || null
    if (!d) return null
    const dt = new Date(d)
    return isNaN(dt.getTime()) ? null : dt
  }

  useEffect(() => {
    let cancelled = false
    const loadLists = async () => {
      setEventsError('')
      setUpLoading(true)
      setPastLoading(true)
      try {
        const [upRes, pastRes] = await Promise.all([
          authFetch('http://localhost:8082/user/upcommingEvents', { headers: { Accept: 'application/json' } }),
          authFetch('http://localhost:8082/user/pastEvents', { headers: { Accept: 'application/json' } })
        ])
        const upList = upRes.ok ? await upRes.json().catch(() => []) : []
        const pastList = pastRes.ok ? await pastRes.json().catch(() => []) : []
        if (!cancelled) {
          setUpcoming(Array.isArray(upList) ? upList : [])
          setPast(Array.isArray(pastList) ? pastList : [])
        }
        if (!upRes.ok && !pastRes.ok) {
          throw new Error(`Failed to fetch events: UPC ${upRes.status}, PAST ${pastRes.status}`)
        }
      } catch (e) {
        if (!cancelled) setEventsError(e?.message || 'Failed to load events')
      } finally {
        if (!cancelled) {
          setUpLoading(false)
          setPastLoading(false)
        }
      }
    }
    loadLists()
    return () => { cancelled = true }
  }, [])
  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')
    try {
      const fd = new FormData()
      fd.append('Name', form.name || '')
      fd.append('Details', form.details || '')
      fd.append('Message', form.message || '')
      if (form.dateTime) fd.append('DateTime', form.dateTime)
      fd.append('IsActive', form.isActive ? '1' : '0')
      fd.append('ShowEvent', form.showEvent ? '1' : '0')
      for (const f of form.images) fd.append('Images', f)

      let res = await authFetch('http://localhost:8082/api/admin/addEvent', { method: 'POST', body: fd })
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      const text = await res.text().catch(() => '')
      setSuccess(text ? `Created event (id: ${text})` : 'Event created successfully')
      setForm({ name: '', details: '', message: '', dateTime: '', isActive: false, showEvent: false, images: [] })
    } catch (e2) {
      setError(typeof e2?.message === 'string' ? e2.message : 'Failed to create event')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PanelShell title="Manage Events" description="Create and manage full events.">
      {/* Inline tables replace navigation to separate upcoming/past pages */}
      <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2 mt-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-ashoka-blue)]"
            placeholder="Event title"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Details</label>
          <textarea
            value={form.details}
            onChange={(e) => setForm({ ...form, details: e.target.value })}
            rows={4}
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-ashoka-blue)]"
            placeholder="Describe the event"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Message</label>
          <input
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-ashoka-blue)]"
            placeholder="Optional message"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Date & Time</label>
          <input
            type="datetime-local"
            value={form.dateTime}
            onChange={(e) => setForm({ ...form, dateTime: e.target.value })}
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-ashoka-blue)]"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <label className="inline-flex items-center gap-2 text-[color:var(--color-ashoka-blue)] font-semibold">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="h-4 w-4"
            />
            Is Active
          </label>
          <label className="inline-flex items-center gap-2 text-[color:var(--color-ashoka-blue)] font-semibold">
            <input
              type="checkbox"
              checked={form.showEvent}
              onChange={(e) => setForm({ ...form, showEvent: e.target.checked })}
              className="h-4 w-4"
            />
            Show Event
          </label>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Images</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setForm({ ...form, images: Array.from(e.target.files || []) })}
            className="mt-2 block w-full text-sm text-gray-700 file:mr-4 file:rounded-md file:border file:border-gray-300 file:bg-white file:px-4 file:py-2 file:text-sm file:font-semibold hover:file:bg-gray-50"
          />
          {form.images?.length > 0 && (
            <p className="mt-2 text-xs text-gray-600">Selected: {form.images.length} file(s)</p>
          )}
        </div>
        <div className="sm:col-span-2 flex items-center justify-between">
          <div>
            {error && <div className="text-sm text-red-600">{error}</div>}
            {success && <div className="text-sm text-green-600">{success}</div>}
          </div>
          <button
            disabled={submitting}
            className="rounded-lg bg-[color:var(--color-ashoka-blue)] px-5 py-3 text-white font-semibold shadow hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? 'Submitting…' : 'Create Event'}
          </button>
        </div>
      </form>
      {/* Upcoming Events Table */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Upcoming Events</h3>
        {eventsError && <div className="mb-3 text-sm text-red-600">{eventsError}</div>}
        {upLoading ? (
          <div className="text-gray-600">Loading upcoming…</div>
        ) : (
          <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">#</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Name</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Date/Time</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Active</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Show</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Images</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(!upcoming || upcoming.length === 0) && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-gray-500">No upcoming events.</td>
                  </tr>
                )}
                {upcoming?.map((ev, i) => {
                  const name = ev.eventName || ev.name || 'Event'
                  const dt = parseDate(ev)
                  const isActive = ev.isActive === true || ev.isActive === 1 || ev.is_active === 1
                  const show = ev.showEvent === true || ev.showEvent === 1 || ev.show_event === 1
                  const imgCount = Array.isArray(ev.imageIdList || ev.imageIDs || ev.imageIds) ? (ev.imageIdList || ev.imageIDs || ev.imageIds).length : 0
                  return (
                    <tr key={ev.id ?? ev.eventId ?? i} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-gray-700">{ev.id ?? ev.eventId ?? i + 1}</td>
                      <td className="px-4 py-2 text-gray-900 font-medium">{name}</td>
                      <td className="px-4 py-2 text-gray-700">{dt ? dt.toLocaleString() : ''}</td>
                      <td className="px-4 py-2 text-gray-700">{isActive ? 'Yes' : 'No'}</td>
                      <td className="px-4 py-2 text-gray-700">{show ? 'Yes' : 'No'}</td>
                      <td className="px-4 py-2 text-gray-700">{imgCount}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Past Events Table */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Past Events</h3>
        {eventsError && <div className="mb-3 text-sm text-red-600">{eventsError}</div>}
        {pastLoading ? (
          <div className="text-gray-600">Loading past…</div>
        ) : (
          <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">#</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Name</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Active</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Show</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Images</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(!past || past.length === 0) && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-gray-500">No past events.</td>
                  </tr>
                )}
                {past?.map((ev, i) => {
                  const name = ev.eventName || ev.name || 'Event'
                  const dt = parseDate(ev)
                  const isActive = ev.isActive === true || ev.isActive === 1 || ev.is_active === 1
                  const show = ev.showEvent === true || ev.showEvent === 1 || ev.show_event === 1
                  const imgCount = Array.isArray(ev.imageIdList || ev.imageIDs || ev.imageIds) ? (ev.imageIdList || ev.imageIDs || ev.imageIds).length : 0
                  return (
                    <tr key={ev.id ?? ev.eventId ?? i} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-gray-700">{ev.id ?? ev.eventId ?? i + 1}</td>
                      <td className="px-4 py-2 text-gray-900 font-medium">{name}</td>
                      <td className="px-4 py-2 text-gray-700">{dt ? dt.toLocaleDateString() : ''}</td>
                      <td className="px-4 py-2 text-gray-700">{isActive ? 'Yes' : 'No'}</td>
                      <td className="px-4 py-2 text-gray-700">{show ? 'Yes' : 'No'}</td>
                      <td className="px-4 py-2 text-gray-700">{imgCount}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PanelShell>
  )
}

function GlimpsesPanel() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [file, setFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')
  const [deleting, setDeleting] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      let res = await fetch('http://localhost:8082/glimpses', { method: 'GET', headers: { 'Accept': 'application/json' } })
      if (!res.ok) {
        res = await fetch('http://localhost:8082/glimpses', { method: 'GET', mode: 'cors' })
      }
      if (!res.ok) throw new Error(res.statusText)
      const data = await res.json().catch(() => [])
      const list = Array.isArray(data) ? data : []
      const normalized = list.map((ev, i) => ({
        id: ev.id ?? ev.eventId ?? i + 1,
        name: ev.eventName || ev.name || ev.title || '',
        imageId: ev.imageId ?? ev.imageID ?? ev.image_id ?? ev.imageid ?? '',
      }))
      setItems(normalized)
    } catch (e) {
      setError(e.message)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!file) return
    setSubmitting(true)
    setError('')
    setSuccess('')
    try {
      const form = new FormData()
      form.append('Name', name)
      form.append('Glimpse_image', file)

      let res = await authFetch('http://localhost:8082/api/admin/addGlimpse', {
        method: 'POST',
        body: form
      })
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      const text = await res.text().catch(() => '')
      setSuccess(text ? `Created glimpse (id: ${text})` : 'Created glimpse successfully')
      setFile(null)
      setName('')
      try { await load() } catch {}
    } catch (e) {
      setError(typeof e?.message === 'string' ? e.message : 'Failed to create glimpse')
    } finally {
      setSubmitting(false)
    }
  }

  const deleteGlimpse = async (rawName) => {
    const clean = String(rawName || '').trim()
    if (!clean) { setError('Cannot delete: Missing glimpse name'); return }
    try {
      setDeleting(clean)
      setError('')
      const url = `http://localhost:8082/api/admin/deleteGlimpse/${encodeURIComponent(clean)}`
      const res = await authFetch(url, { method: 'DELETE' })
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      await load()
    } catch (e) {
      setError(typeof e?.message === 'string' ? e.message : 'Delete failed')
    } finally {
      setDeleting('')
    }
  }

  return (
    <PanelShell title="Manage Glimpses" description="Upload and review glimpses.">
      <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-ashoka-blue)]" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Image File</label>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} required className="mt-2 block w-full text-sm text-gray-700 file:mr-4 file:rounded-md file:border file:border-gray-300 file:bg-white file:px-4 file:py-2 file:text-sm file:font-semibold hover:file:bg-gray-50" />
        </div>
        <div className="sm:col-span-2 flex items-center justify-between">
          <div className="text-sm text-red-600">{error}</div>
          {success && <div className="text-sm text-green-600">{success}</div>}
          <button disabled={submitting} className="rounded-lg bg-[color:var(--color-ashoka-blue)] px-5 py-3 text-white font-semibold shadow hover:opacity-90 disabled:opacity-60">
            {submitting ? 'Saving…' : 'Create Glimpse'}
          </button>
        </div>
      </form>
      <div className="mt-8">
        {loading && <div className="text-gray-600">Loading…</div>}
        {error && <div className="text-red-600">{error}</div>}
        {!loading && !error && (
          <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">ID</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Name</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Image ID</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-4 text-center text-gray-500">No glimpses found.</td>
                  </tr>
                )}
                {items.map((ev) => (
                  <tr key={ev.id}>
                    <td className="px-4 py-2 text-gray-700">{ev.id}</td>
                    <td className="px-4 py-2 text-gray-700">{ev.name || 'Untitled Glimpse'}</td>
                    <td className="px-4 py-2 text-gray-700">{ev.imageId}</td>
                    <td className="px-4 py-2 text-gray-700">
                      <button
                        onClick={() => deleteGlimpse(ev.name)}
                        className="rounded-md bg-red-600 px-3 py-1.5 text-white disabled:opacity-60"
                        disabled={!ev.name || deleting === ev.name}
                      >
                        {deleting === ev.name ? 'Deleting…' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PanelShell>
  )
}

function RecommendationsPanel() {
  const [unresolved, setUnresolved] = useState([])
  const [resolved, setResolved] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [view, setView] = useState('unresolved')

  const formatDateTime = (value) => {
    try {
      return new Date(value).toLocaleString()
    } catch {
      return String(value ?? '')
    }
  }

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [uRes, rRes] = await Promise.all([
        authFetch('http://localhost:8082/api/admin/showUnresolvedRecommendations'),
        authFetch('http://localhost:8082/api/admin/showResolvedRecommendations'),
      ])

      if (!uRes.ok || !rRes.ok) throw new Error('Failed to load recommendations')
      const [uJson, rJson] = await Promise.all([uRes.json(), rRes.json()])

      const normalize = (rec) => ({
        id: rec.id ?? rec.recommendationId ?? rec.recomId ?? rec.rid ?? rec.ID,
        name: rec.name ?? rec.fullName ?? rec.username ?? rec.Name,
        email: rec.email ?? rec.Email,
        message: rec.message ?? rec.Message ?? rec.content,
        postTime: rec.postTime ?? rec.createdAt ?? rec.time,
      })

      setUnresolved(Array.isArray(uJson) ? uJson.map(normalize) : [])
      setResolved(Array.isArray(rJson) ? rJson.map(normalize) : [])
    } catch (e) {
      setError(typeof e?.message === 'string' ? e.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const removeRecommendation = async (id) => {
    try {
      const idNum = Number(String(id).trim())
      const res = await authFetch(`http://localhost:8082/api/admin/removeRecommendation/${encodeURIComponent(idNum)}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      await load()
    } catch (e) {
      setError(typeof e?.message === 'string' ? e.message : 'Delete failed')
    }
  }

  const resolveRecommendation = async (id) => {
    try {
      const idNum = Number(String(id).trim())
      const res = await authFetch(`http://localhost:8082/api/admin/resolveRecommendation/${encodeURIComponent(idNum)}`, {
        method: 'PUT',
      })
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      await load()
    } catch (e) {
      setError(typeof e?.message === 'string' ? e.message : 'Resolve failed')
    }
  }

  return (
    <PanelShell title="User Recommendations" description="Review unresolved and resolved recommendations.">
      {loading && <div className="text-gray-600">Loading…</div>}
      {error && <div className="mb-4 text-red-600">{error}</div>}
      {!loading && (
        <>
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setView('unresolved')}
              className={`rounded-full px-4 py-2 text-sm font-semibold border transition ${
                view === 'unresolved'
                  ? 'bg-[color:var(--color-ashoka-blue)] text-white border-[color:var(--color-ashoka-blue)]'
                  : 'bg-white text-[color:var(--color-ashoka-blue)] border-[color:var(--color-ashoka-blue)] hover:bg-[rgba(0,0,128,0.04)]'
              }`}
            >
              Unresolved ({unresolved.length})
            </button>
            <button
              onClick={() => setView('resolved')}
              className={`rounded-full px-4 py-2 text-sm font-semibold border transition ${
                view === 'resolved'
                  ? 'bg-[color:var(--color-ashoka-blue)] text-white border-[color:var(--color-ashoka-blue)]'
                  : 'bg-white text-[color:var(--color-ashoka-blue)] border-[color:var(--color-ashoka-blue)] hover:bg-[rgba(0,0,128,0.04)]'
              }`}
            >
              Resolved ({resolved.length})
            </button>
          </div>

          {view === 'unresolved' ? (
            <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">ID</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Name</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Email</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Message</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Posted</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {unresolved.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-4 text-center text-gray-500">No unresolved items.</td>
                    </tr>
                  )}
                  {unresolved.map((rec) => (
                    <tr key={rec.id}>
                      <td className="px-4 py-2 text-gray-700">{rec.id}</td>
                      <td className="px-4 py-2 text-gray-700">{rec.name}</td>
                      <td className="px-4 py-2 text-gray-700">{rec.email}</td>
                      <td className="px-4 py-2 text-gray-700 max-w-[24rem] truncate" title={rec.message}>{rec.message}</td>
                      <td className="px-4 py-2 text-gray-700">{formatDateTime(rec.postTime)}</td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <button onClick={() => resolveRecommendation(rec.id)} className="rounded-md bg-[color:var(--color-india-green)] px-3 py-1.5 text-white">Resolve</button>
                          <button onClick={() => removeRecommendation(rec.id)} className="rounded-md bg-red-600 px-3 py-1.5 text-white">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">ID</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Name</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Email</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Message</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Posted</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {resolved.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-4 text-center text-gray-500">No resolved items.</td>
                    </tr>
                  )}
                  {resolved.map((rec) => (
                    <tr key={rec.id}>
                      <td className="px-4 py-2 text-gray-700">{rec.id}</td>
                      <td className="px-4 py-2 text-gray-700">{rec.name}</td>
                      <td className="px-4 py-2 text-gray-700">{rec.email}</td>
                      <td className="px-4 py-2 text-gray-700 max-w-[24rem] truncate" title={rec.message}>{rec.message}</td>
                      <td className="px-4 py-2 text-gray-700">{formatDateTime(rec.postTime)}</td>
                      <td className="px-4 py-2">
                        <button onClick={() => removeRecommendation(rec.id)} className="rounded-md bg-red-600 px-3 py-1.5 text-white">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </PanelShell>
  )
}

function InternshipsPanel() {
  const { get, post } = useJsonFetch()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ title: '', description: '', applyUrl: '', category: 'current' })
  const [submitting, setSubmitting] = useState(false)
  // Additional state for successful internship stories (placements)
  const [placeForm, setPlaceForm] = useState({ name: '', institute: '', image: null })
  const [placeSubmitting, setPlaceSubmitting] = useState(false)
  const [placeError, setPlaceError] = useState('')
  const [placeSuccess, setPlaceSuccess] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await get('http://localhost:8082/api/admin/internships')
      setItems(Array.isArray(data) ? data : data.items || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await post('http://localhost:8082/api/admin/internships', form)
      setForm({ title: '', description: '', applyUrl: '', category: 'current' })
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  // Submit handler for successful internship stories
  const onSubmitPlacement = async (e) => {
    e.preventDefault()
    setPlaceSubmitting(true)
    setPlaceError('')
    setPlaceSuccess('')
    try {
      const fd = new FormData()
      // Match backend @RequestParam names exactly
      fd.append('Name', placeForm.name || '')
      fd.append('Institute', placeForm.institute || '')
      if (placeForm.image) fd.append('Image', placeForm.image)

      const res = await authFetch('http://localhost:8082/api/admin/addInternPlacements', {
        method: 'POST',
        body: fd,
      })
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      // Backend likely returns empty body or OK
      await res.text().catch(() => '')
      setPlaceSuccess('Internship story added successfully!')
      setPlaceForm({ name: '', institute: '', image: null })
    } catch (e2) {
      setPlaceError(typeof e2?.message === 'string' ? e2.message : 'Failed to add story')
    } finally {
      setPlaceSubmitting(false)
    }
  }

  return (
    <PanelShell title="Manage Internships" description="Add current opportunities and list previous internships.">
      {/* Add Successful Internship Stories */}
      <div className="mb-10">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Successful Internship Story</h3>
        <form onSubmit={onSubmitPlacement} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Student Name</label>
            <input
              value={placeForm.name}
              onChange={(e) => setPlaceForm({ ...placeForm, name: e.target.value })}
              required
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-ashoka-blue)]"
              placeholder="Enter student's name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Institute Name</label>
            <input
              value={placeForm.institute}
              onChange={(e) => setPlaceForm({ ...placeForm, institute: e.target.value })}
              required
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-ashoka-blue)]"
              placeholder="e.g., SVNIT Surat"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPlaceForm({ ...placeForm, image: e.target.files?.[0] || null })}
              required
              className="mt-2 block w-full text-sm text-gray-700 file:mr-4 file:rounded-md file:border file:border-gray-300 file:bg-white file:px-4 file:py-2 file:text-sm file:font-semibold hover:file:bg-gray-50"
            />
            {placeForm.image && (
              <p className="mt-2 text-sm text-gray-600">Selected: {placeForm.image.name}</p>
            )}
          </div>
          <div className="sm:col-span-2 flex items-center justify-between">
            <div>
              {placeError && <div className="text-sm text-red-600">{placeError}</div>}
              {placeSuccess && <div className="text-sm text-green-600">{placeSuccess}</div>}
            </div>
            <button
              disabled={placeSubmitting}
              className="rounded-lg bg-[color:var(--color-ashoka-blue)] px-5 py-3 text-white font-semibold shadow hover:opacity-90 disabled:opacity-60"
            >
              {placeSubmitting ? 'Submitting…' : 'Add Story'}
            </button>
          </div>
        </form>
      </div>

      {/* Existing Internships form */}
      <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-ashoka-blue)]" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-ashoka-blue)]">
            <option value="current">Current Opportunity</option>
            <option value="previous">Previous Internship</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-ashoka-blue)]" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Apply URL (for current)</label>
          <input value={form.applyUrl} onChange={(e) => setForm({ ...form, applyUrl: e.target.value })} placeholder="https://…" className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-ashoka-blue)]" />
        </div>
        <div className="sm:col-span-2 flex justify-end">
          <button disabled={submitting} className="rounded-lg bg-[color:var(--color-ashoka-blue)] px-5 py-3 text-white font-semibold shadow hover:opacity-90 disabled:opacity-60">
            {submitting ? 'Saving…' : 'Add Entry'}
          </button>
        </div>
      </form>
      <div className="mt-8">
        {loading && <div className="text-gray-600">Loading…</div>}
        {error && <div className="text-red-600">{error}</div>}
        {!loading && !error && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((it) => (
              <div key={it.id || it.title} className="rounded-xl border bg-white p-4 shadow-sm">
                <div className="flex items-baseline justify-between">
                  <div className="font-semibold text-[color:var(--color-ashoka-blue)]">{it.title}</div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(0,0,128,0.08)] text-[color:var(--color-ashoka-blue)]">{it.category || 'current'}</span>
                </div>
                {it.description && <p className="mt-1 text-sm text-gray-700 line-clamp-3">{it.description}</p>}
                {it.applyUrl && (
                  <a className="mt-2 inline-block text-[color:var(--color-india-green)] text-sm font-medium" href={it.applyUrl} target="_blank" rel="noreferrer">Apply →</a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </PanelShell>
  )
}


