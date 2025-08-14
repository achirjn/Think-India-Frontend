import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { authFetch, isAuthenticated, removeToken, getToken } from '../utils/auth'

const TABS = [
  { key: 'blogs', label: 'Blogs' },
  { key: 'teams', label: 'Teams' },
  { key: 'events', label: 'Event Images' },
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
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-center">
        <motion.h1
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
          className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[color:var(--color-ashoka-blue)]"
        >
          Admin Dashboard
        </motion.h1>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`rounded-full px-4 py-2 text-sm font-semibold border transition ${
              activeTab === t.key
                ? 'bg-[color:var(--color-ashoka-blue)] text-white border-[color:var(--color-ashoka-blue)]'
                : 'bg-white text-[color:var(--color-ashoka-blue)] border-[color:var(--color-ashoka-blue)] hover:bg-[rgba(0,0,128,0.04)]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {activeTab === 'blogs' && <BlogsPanel />}
        {activeTab === 'teams' && <TeamsPanel />}
        {activeTab === 'events' && <EventsPanel />}
        {activeTab === 'recommendations' && <RecommendationsPanel />}
        {activeTab === 'internships' && <InternshipsPanel />}
      </div>
    </div>
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
    <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
      <div className="p-6 bg-[color:var(--color-ashoka-blue)] text-white border-b border-white/20">
        <div className="text-xl font-bold">{title}</div>
        {description && <p className="mt-1 text-sm text-white/90">{description}</p>}
      </div>
      <div className="p-6">{children}</div>
      {footer && <div className="p-4 border-t bg-gray-50">{footer}</div>}
    </div>
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
  const { get, post } = useJsonFetch()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', type: 'Core', photo: null })
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await get('http://localhost:8082/api/admin/teams')
      setMembers(Array.isArray(data) ? data : data.members || [])
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
      const formData = new FormData()
      formData.append('name', form.name)
      formData.append('type', form.type)
      if (form.photo) {
        formData.append('photo', form.photo)
      }
      
      await post('http://localhost:8082/api/admin/teams', formData)
      setForm({ name: '', type: 'Core', photo: null })
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PanelShell title="Manage Team Members" description="Add individual team members with their details.">
      <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Member Name</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-ashoka-blue)]" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Member Type</label>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[color-var(--color-ashoka-blue)]">
            <option>Core</option>
            <option>Cell Head</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Member Photo</label>
          <input 
            type="file" 
            accept="image/*"
            onChange={(e) => setForm({ ...form, photo: e.target.files[0] || null })} 
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-ashoka-blue)]" 
          />
          {form.photo && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {form.photo.name}
            </p>
          )}
        </div>
        <div className="sm:col-span-2 flex justify-end">
          <button disabled={submitting} className="rounded-lg bg-[color:var(--color-ashoka-blue)] px-5 py-3 text-white font-semibold shadow hover:opacity-90 disabled:opacity-60">
            {submitting ? 'Saving…' : 'Add Team Member'}
          </button>
        </div>
      </form>
      <div className="mt-8">
        {loading && <div className="text-gray-600">Loading…</div>}
        {error && <div className="text-red-600">{error}</div>}
        {!loading && !error && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
              <div key={member.id || member.name} className="rounded-xl border bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  {member.photoUrl && (
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                      <img 
                        src={member.photoUrl} 
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="font-semibold text-[color:var(--color-ashoka-blue)]">{member.name}</div>
                    <div className="text-sm text-gray-600 capitalize">{member.type}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PanelShell>
  )
}

function EventsPanel() {
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
      // Fetch events list for table display
      let res = await fetch('http://localhost:8082/events', { method: 'GET', headers: { 'Accept': 'application/json' } })
      if (!res.ok) {
        res = await fetch('http://localhost:8082/events', { method: 'GET', mode: 'cors' })
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
      console.warn('Events list load skipped:', e.message)
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
      // Match backend expected field names from Postman: Name, Event_image
      const form = new FormData()
      form.append('Name', name)
      form.append('Event_image', file)

      let res = await authFetch('http://localhost:8082/api/admin/addEvent', {
        method: 'POST',
        body: form
      })
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      const text = await res.text().catch(() => '')
      setSuccess(text ? `Created event (id: ${text})` : 'Created event successfully')
      setFile(null)
      setName('')
      try { await load() } catch {}
    } catch (e) {
      setError(typeof e?.message === 'string' ? e.message : 'Failed to create event')
    } finally {
      setSubmitting(false)
    }
  }

  const deleteEvent = async (rawName) => {
    const clean = String(rawName || '').trim()
    if (!clean) { setError('Cannot delete: Missing event name'); return }
    try {
      setDeleting(clean)
      setError('')
      const url = `http://localhost:8082/api/admin/deleteEvent/${encodeURIComponent(clean)}`
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
    <PanelShell title="Manage Event Images" description="Upload and review event images.">
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
            {submitting ? 'Saving…' : 'Create Event'}
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
                    <td colSpan={4} className="px-4 py-4 text-center text-gray-500">No events found.</td>
                  </tr>
                )}
                {items.map((ev) => (
                  <tr key={ev.id}>
                    <td className="px-4 py-2 text-gray-700">{ev.id}</td>
                    <td className="px-4 py-2 text-gray-700">{ev.name || 'Untitled Event'}</td>
                    <td className="px-4 py-2 text-gray-700">{ev.imageId}</td>
                    <td className="px-4 py-2 text-gray-700">
                      <button
                        onClick={() => deleteEvent(ev.name)}
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

  return (
    <PanelShell title="Manage Internships" description="Add current opportunities and list previous internships.">
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


