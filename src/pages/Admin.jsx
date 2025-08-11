import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'

const TABS = [
  { key: 'blogs', label: 'Blogs' },
  { key: 'teams', label: 'Teams' },
  { key: 'events', label: 'Event Images' },
  { key: 'recommendations', label: 'Recommendations' },
  { key: 'internships', label: 'Internships' },
]

export default function Admin() {
  const [activeTab, setActiveTab] = useState('blogs')
  

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <motion.h1
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[color:var(--color-ashoka-blue)]"
      >
        Admin Dashboard
      </motion.h1>

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
    () => ({ headers: { 'Content-Type': 'application/json' }, credentials: 'include' }),
    [],
  )
  const get = async (url) => {
    const res = await fetch(url, { credentials: 'include' })
    if (!res.ok) throw new Error(await safeMessage(res))
    return res.json()
  }
  const post = async (url, body) => {
    const isFormData = body instanceof FormData
    const options = {
      method: 'POST',
      body: isFormData ? body : JSON.stringify(body),
      credentials: 'include'
    }
    
    if (!isFormData) {
      options.headers = { 'Content-Type': 'application/json' }
    }
    
    const res = await fetch(url, options)
    if (!res.ok) throw new Error(await safeMessage(res))
    return res.json()
  }
  const patch = async (url, body) => {
    const res = await fetch(url, { method: 'PATCH', body: JSON.stringify(body), ...common })
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
    <div className="rounded-2xl border bg-white shadow-sm">
      <div className="p-6 border-b">
        <div className="text-xl font-bold text-[color:var(--color-ashoka-blue)]">{title}</div>
        {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
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

  const load = async () => {
    setLoading(true)
    try {
      // Attempt to load blogs list if backend provides it; otherwise, silently no-op
      let res = await fetch('http://localhost:8082/api/admin/blogs', { credentials: 'include' })
      if (!res.ok) throw new Error(res.statusText)
      const ct = res.headers.get('content-type') || ''
      const data = ct.includes('application/json') ? await res.json() : []
      setItems(Array.isArray(data) ? data : data.items || data.posts || [])
    } catch (e) {
      console.warn('Blog list load skipped:', e.message)
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
      // Direct call to the Spring endpoint from Postman
      let res = await fetch('http://localhost:8082/api/admin/createBlog', {
        method: 'POST',
        body: formData,
        mode: 'cors',
      })
      if (!res.ok) {
        res = await fetch('http://localhost:8082/api/admin/createBlog', { method: 'POST', body: formData })
      }
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
        {!loading && !error && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((b) => (
              <div key={b.id || b.title} className="rounded-xl border bg-white p-4 shadow-sm">
                <div className="font-semibold text-[color:var(--color-ashoka-blue)]">{b.title}</div>
                {b.excerpt && <p className="mt-1 text-sm text-gray-600 line-clamp-3">{b.excerpt}</p>}
              </div>
            ))}
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
      const data = await get('/api/admin/teams')
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
      
      await post('/api/admin/teams', formData)
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

  const load = async () => {
    setLoading(true)
    try {
      // Optional list fetch; ignore if your backend doesn't expose a GET
      let res = await fetch('http://localhost:8082/api/admin/events', { credentials: 'include' })
      if (!res.ok) throw new Error(res.statusText)
      const ct = res.headers.get('content-type') || ''
      const data = ct.includes('application/json') ? await res.json() : []
      const normalized = (Array.isArray(data) ? data : data.images || [])
        .map((it) => ({ id: it.id, name: it.name || it.alt, url: it.url || it.src }))
        .filter((x) => x.url)
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

      let res = await fetch('http://localhost:8082/api/admin/addEvent', {
        method: 'POST',
        body: form,
        mode: 'cors',
      })
      if (!res.ok) {
        res = await fetch('http://localhost:8082/api/admin/addEvent', { method: 'POST', body: form })
      }
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
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((img) => (
              <div key={img.id || img.url} className="rounded-xl border bg-white overflow-hidden shadow-sm">
                <img src={img.url} alt={img.name || ''} className="h-44 w-full object-cover" />
                <div className="p-3 text-sm text-gray-700">{img.name}</div>
              </div>
            ))}
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
        fetch('http://localhost:8082/api/admin/showUnresolvedRecommendations'),
        fetch('http://localhost:8082/api/admin/showResolvedRecommendations'),
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
      const res = await fetch(`http://localhost:8082/api/admin/removeRecommendation/${encodeURIComponent(idNum)}`, {
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
      const res = await fetch(`http://localhost:8082/api/admin/resolveRecommendation/${encodeURIComponent(idNum)}`, {
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
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Unresolved Table */}
          <div>
            <div className="text-lg font-semibold text-[color:var(--color-ashoka-blue)] mb-3">Unresolved</div>
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
          </div>

          {/* Resolved Table */}
          <div>
            <div className="text-lg font-semibold text-[color:var(--color-ashoka-blue)] mb-3">Resolved</div>
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
          </div>
        </div>
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
      const data = await get('/api/admin/internships')
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
      await post('/api/admin/internships', form)
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


