import { useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function BlogDetail() {
  const { slug } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadBlog = async () => {
      try {
        setLoading(true)
        
        // Prefer id from slug if numeric, else try fetching by heading
        const isNumeric = /^\d+$/.test(String(slug || ''))
        const endpoint = isNumeric ? `https://api.thinkindiasvnit.in/blog/${encodeURIComponent(slug)}` : `https://api.thinkindiasvnit.in/blog/${encodeURIComponent(slug)}`
        const res = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: Failed to fetch blog`)
        }

        const data = await res.json()

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
            base64 = trimmed.replace(/\s+/g, '')
            return { base64, mime, dataUri }
          }
          const candidates = [payload.base64, payload.data, payload.image, payload.base64EncodedImage, payload.base64Image]
          for (const c of candidates) {
            if (typeof c === 'string' && c.trim()) return extractBase64(c)
          }
          if (payload.image && typeof payload.image === 'object') {
            const nested = extractBase64(payload.image)
            if (!nested.mime) nested.mime = payload.image.type || payload.image.mimeType || payload.image.contentType || ''
            return nested
          }
          mime = payload.imageType || payload.mimeType || payload.contentType || mime
          const anyString = Object.values(payload).find((v) => typeof v === 'string')
          if (anyString) return extractBase64(anyString)
          return { base64, mime, dataUri }
        }

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

        // Extract potential imageId fields
        const imageId = data.imageId ?? data.imageID ?? data.image_id ?? data.imageid ?? data.photoId ?? data.imageRefId ?? data.thumbnailId ?? null

        let imageData = null
        let imageType = 'jpeg'
        let imageSrc = ''
        if (imageId) {
          try {
            let imgRes = await fetch(`https://api.thinkindiasvnit.in/image/${encodeURIComponent(imageId)}`, {
              method: 'GET',
              headers: { 'Accept': 'application/json, text/plain, */*' },
            })
            if (!imgRes.ok) {
              imgRes = await fetch(`https://api.thinkindiasvnit.in/image/${encodeURIComponent(imageId)}`, {
                method: 'GET',
                mode: 'cors',
              })
            }
            if (!imgRes.ok) throw new Error('Image fetch failed')

            const contentType = imgRes.headers.get('content-type') || ''
            if (contentType.includes('application/json')) {
              const json = await imgRes.json()
              const ext = extractBase64(json)
              imageData = sanitizeBase64(ext.base64)
              const mime = ext.mime || detectImageMime(imageData) || 'image/jpeg'
              imageType = mime.replace('image/', '')
              imageSrc = ext.dataUri || (imageData ? `data:${mime};base64,${imageData}` : '')
            } else {
              const text = await imgRes.text()
              const maybeJson = text.trim()
              if (maybeJson.startsWith('{') || maybeJson.startsWith('[') || (maybeJson.startsWith('"') && maybeJson.endsWith('"'))) {
                try {
                  const parsed = JSON.parse(maybeJson)
                  const ext = extractBase64(parsed)
                  imageData = sanitizeBase64(ext.base64)
                  const mime = ext.mime || detectImageMime(imageData) || 'image/jpeg'
                  imageType = mime.replace('image/', '')
                  imageSrc = ext.dataUri || (imageData ? `data:${mime};base64,${imageData}` : '')
                } catch {
                  imageData = sanitizeBase64(maybeJson)
                  const mime = detectImageMime(imageData) || 'image/jpeg'
                  imageType = mime.replace('image/', '')
                  imageSrc = `data:${mime};base64,${imageData}`
                }
              } else {
                imageData = sanitizeBase64(maybeJson)
                const mime = detectImageMime(imageData) || 'image/jpeg'
                imageType = mime.replace('image/', '')
                imageSrc = `data:${mime};base64,${imageData}`
              }
            }
          } catch (e) {
            console.warn('Failed to load image:', e)
          }
        }

        setPost({ ...data, imageData, imageType, imageSrc })
      } catch (e) {
        console.error('Error fetching blog:', e)
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }

    // Use post from navigation state if present to avoid a refetch
    const statePost = location.state && location.state.post
    if (statePost) {
      setPost(statePost)
      setLoading(false)
    } else if (slug) {
      loadBlog()
    }
  }, [slug, location.state])

  const handleBackToBlogs = () => {
    navigate('/blogs')
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--color-ashoka-blue)] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading blog post...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error: {error}</div>
          <button 
            onClick={handleBackToBlogs}
            className="px-6 py-2 bg-[color:var(--color-ashoka-blue)] text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Blogs
          </button>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="text-gray-600 text-xl mb-4">Blog post not found</div>
          <button 
            onClick={handleBackToBlogs}
            className="px-6 py-2 bg-[color:var(--color-ashoka-blue)] text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Blogs
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        onClick={handleBackToBlogs}
        className="mb-6 flex items-center text-[color:var(--color-ashoka-blue)] hover:text-blue-700 transition-colors"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Blogs
      </motion.button>

      {/* Blog Header */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[color:var(--color-ashoka-blue)] mb-2">
          {post.heading || 'Untitled Post'}
        </h1>
        <p className="text-lg text-gray-600">
          {post.postTime ? new Date(post.postTime).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'long'
          }) : 'Date not available'}
        </p>
      </motion.div>

      {/* Blog Image */}
      {post.imageSrc && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="rounded-xl overflow-hidden shadow-lg">
            <img 
              src={post.imageSrc}
              alt={post.heading || 'Blog post image'} 
              className="w-full h-[56vh] sm:h-[66vh] md:h-[72vh] object-cover"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
            <div 
              className="hidden h-[46vh] sm:h-[56vh] md:h-[64vh] bg-gray-200 items-center justify-center"
              style={{ display: 'none' }}
            >
              <span className="text-gray-500 text-lg">Image failed to load</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Blog Content */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="prose prose-lg max-w-none"
      >
        <div className="bg-white rounded-xl p-8 shadow-lg border">
          <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-wrap">
            {post.content || 'No content available'}
          </p>
        </div>
      </motion.div>

      {/* Blog Footer */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 pt-8 border-t border-gray-200"
      >
        <button 
          onClick={handleBackToBlogs}
          className="px-6 py-3 bg-[color:var(--color-ashoka-blue)] text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to All Blogs
        </button>
      </motion.div>
    </div>
  )
}
