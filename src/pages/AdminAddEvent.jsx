import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '../components/Button.jsx'
import useAuth from '../hooks/useAuth.jsx'

export default function AdminAddEvent() {
  const navigate = useNavigate()
  const { isLoggedIn, isAdmin, loading: authLoading } = useAuth()

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [images, setImages] = useState([]) // File[] accumulated across selections
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (authLoading) return
    if (!isLoggedIn || !isAdmin) navigate('/login')
  }, [authLoading, isLoggedIn, isAdmin, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    const form = e.currentTarget
    const fd = new FormData()

    // Match backend field names exactly
    fd.append('Name', form.name.value || '')
    fd.append('Details', form.details.value || '')
    fd.append('Message', form.message.value || '')
    // Convert datetime-local to ISO-like string expected by Spring (yyyy-MM-ddTHH:mm)
    const dt = form.dateTime.value
    if (dt) fd.append('DateTime', dt)
    // Checkboxes -> 1/0 integers
    fd.append('IsActive', form.isActive.checked ? '1' : '0')
    fd.append('ShowEvent', form.showEvent.checked ? '1' : '0')

    // Append all accumulated images
    for (let i = 0; i < images.length; i++) {
      fd.append('Images', images[i])
    }

    try {
      // Adjust if your base path differs
      const url = 'https://api.thinkindiasvnit.in/api/admin/addEvent'
      let res = await fetch(url, { method: 'POST', body: fd, mode: 'cors' })
      if (!res.ok) {
        // retry without explicit cors if server handles it
        res = await fetch(url, { method: 'POST', body: fd })
      }
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)

      setSuccess('Event created successfully.')
      form.reset()
      setImages([])
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (e2) {
      setError(e2?.message || 'Failed to create event.')
    } finally {
      setSubmitting(false)
    }
  }

  const onPickImages = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Create a Set of existing file keys for quick lookup
    const existingKeys = new Set(
      images.map(f => `${f.name}|${f.size}|${f.lastModified}`)
    )

    // Add new files that aren't already in the images array
    const newFiles = files.filter(
      file => !existingKeys.has(`${file.name}|${file.size}|${file.lastModified}`)
    )

    // Append new files to maintain order
    setImages(prev => [...prev, ...newFiles])
  }

  const removeImageAt = (idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx))
  }

  if (authLoading || !isLoggedIn || !isAdmin) {
    return (
      <section className="container-responsive py-responsive">
        <div className="text-center text-[color:var(--color-ashoka-blue)]">Checking admin access…</div>
      </section>
    )
  }

  return (
    <section className="container-responsive py-responsive">
      <header className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[color:var(--color-ashoka-blue)]">Add Event</h1>
      </header>

      {error && <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-xl">{error}</div>}
      {success && <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-xl">{success}</div>}

      <motion.form onSubmit={handleSubmit} className="grid gap-5 max-w-2xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <label className="block text-sm font-semibold text-[color:var(--color-ashoka-blue)]">Name</label>
          <input name="name" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-ashoka-blue)]" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[color:var(--color-ashoka-blue)]">Details</label>
          <textarea name="details" rows="4" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-ashoka-blue)]" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[color:var(--color-ashoka-blue)]">Message</label>
          <input name="message" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-ashoka-blue)]" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[color:var(--color-ashoka-blue)]">Date & Time</label>
          <input name="dateTime" type="datetime-local" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-ashoka-blue)]" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="inline-flex items-center gap-2 text-[color:var(--color-ashoka-blue)] font-semibold">
            <input name="isActive" type="checkbox" className="h-4 w-4" />
            Is Active
          </label>
          <label className="inline-flex items-center gap-2 text-[color:var(--color-ashoka-blue)] font-semibold">
            <input name="showEvent" type="checkbox" className="h-4 w-4" />
            Show Event
          </label>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[color:var(--color-ashoka-blue)]">Images</label>
          <input
            ref={fileInputRef}
            name="images"
            type="file"
            multiple
            accept="image/*"
            onChange={onPickImages}
            className="mt-1 block w-full text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-[color:var(--color-india-saffron)] file:px-3 file:py-2 file:text-white hover:file:opacity-90"
          />
          <p className="mt-1 text-xs text-gray-500">Tip: You can add more files by reopening the picker; all selections are kept.</p>
          {images.length > 0 && (
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative border rounded-lg p-2 bg-white shadow-sm">
                  <div className="text-xs font-medium truncate" title={img.name}>{img.name}</div>
                  <div className="text-[10px] text-gray-500">{(img.size / 1024).toFixed(1)} KB</div>
                  <button
                    type="button"
                    onClick={() => removeImageAt(idx)}
                    className="absolute top-1 right-1 text-xs bg-red-600 text-white rounded px-2 py-0.5"
                  >Remove</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={submitting} variant="primary">
            {submitting ? 'Submitting…' : 'Create Event'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/admin')}>Back to Admin</Button>
        </div>
      </motion.form>
    </section>
  )
}
