import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import SectionDivider from '../components/SectionDivider.jsx'
import { HoverCard } from '../components/ui/card-hover-effect.jsx'
import { publicFetch } from '../utils/auth'

export default function Blogs() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        let res = await publicFetch('/blogPageGetAllBlogs', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (!res.ok) {
          res = await publicFetch('/blogPageGetAllBlogs', {
            method: 'GET',
            mode: 'cors',
            headers: {
              'Content-Type': 'application/json',
            },
          })
        }
        
        if (!res.ok) {
          const errorText = await res.text()
          throw new Error(`HTTP ${res.status}: ${errorText || 'Failed to fetch blogs'}`)
        }
        
        const data = await res.json()

        // Step 1: Normalize posts and extract potential imageId fields
        const normalizedPosts = (Array.isArray(data) ? data : []).map((post) => {
          const imageId = post.imageId ?? post.imageID ?? post.image_id ?? post.imageid ?? post.photoId ?? post.imageRefId ?? post.thumbnailId ?? null
          return {
            ...post,
            imageId,
            imageData: null,
            imageType: 'jpeg',
          }
        })

        // Helper to detect mime from base64 signature
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
          // Remove surrounding quotes if present and any whitespace/newlines
          let cleaned = raw.trim()
          if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
            try { cleaned = JSON.parse(cleaned) } catch {}
          }
          cleaned = String(cleaned).replace(/^data:[^;]+;base64,/, '')
          // Strip any non-base64 characters
          cleaned = cleaned.replace(/[^A-Za-z0-9+/=]/g, '')
          return cleaned
        }

        // Helper to robustly extract base64 (and optional mime) from many possible response shapes
        const extractBase64 = (payload) => {
          let mime = ''
          let dataUri = ''
          let base64 = ''

          if (payload == null) return { base64, mime, dataUri }

          // If payload is already a string
          if (typeof payload === 'string') {
            const trimmed = payload.trim()
            // If looks like JSON string (e.g., ".....")
            if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
              try {
                const unwrapped = JSON.parse(trimmed)
                if (typeof unwrapped === 'string') {
                  return extractBase64(unwrapped)
                }
              } catch {}
            }
            // If it's a full data URI
            if (trimmed.startsWith('data:')) {
              dataUri = trimmed
              // Try to derive mime and base64
              const match = trimmed.match(/^data:([^;]+);base64,(.*)$/)
              if (match) {
                mime = match[1]
                base64 = match[2]
              }
              return { base64, mime, dataUri }
            }
            // Otherwise assume raw base64 string possibly with whitespace
            base64 = trimmed.replace(/\s+/g, '')
            return { base64, mime, dataUri }
          }

          // If payload is an object, try common shapes
          const candidates = [
            payload.base64,
            payload.data,
            payload.image,
            payload.base64EncodedImage,
            payload.base64Image,
          ]
          for (const c of candidates) {
            if (typeof c === 'string' && c.trim()) {
              return extractBase64(c)
            }
          }

          // Nested object like { image: { data, type } }
          if (payload.image && typeof payload.image === 'object') {
            const nested = extractBase64(payload.image)
            if (!nested.mime) nested.mime = payload.image.type || payload.image.mimeType || payload.image.contentType || ''
            return nested
          }

          // Try top-level mime hints
          mime = payload.imageType || payload.mimeType || payload.contentType || mime

          // Try generic fields
          const anyString = Object.values(payload).find((v) => typeof v === 'string')
          if (anyString) return extractBase64(anyString)

          return { base64, mime, dataUri }
        }

        // Step 2: In parallel, fetch base64 images for posts that have imageId
        const postsWithImages = await Promise.all(
          normalizedPosts.map(async (post) => {
            if (post.imageId === undefined || post.imageId === null) return post
            try {
              let imgRes = await publicFetch(`/image/${encodeURIComponent(post.imageId)}`, {
                method: 'GET',
                headers: { 'Accept': 'application/json, text/plain, */*' },
              })
              if (!imgRes.ok) {
                imgRes = await publicFetch(`/image/${encodeURIComponent(post.imageId)}`, {
                  method: 'GET',
                  mode: 'cors',
                })
              }
              if (!imgRes.ok) throw new Error(`Failed image fetch for id ${post.imageId}`)

              const contentType = imgRes.headers.get('content-type') || ''
              let base64 = ''
              let mime = ''
              let dataUri = ''
              if (contentType.includes('application/json')) {
                // If backend returns JSON, try common fields
                const json = await imgRes.json()
                const ext = extractBase64(json)
                base64 = sanitizeBase64(ext.base64)
                mime = ext.mime
                dataUri = ext.dataUri
                if (!mime) mime = detectImageMime(base64) || 'image/jpeg'
              } else {
                // Otherwise assume raw base64 string body
                const text = await imgRes.text()
                // Attempt to parse JSON if text looks like it
                const maybeJson = text.trim()
                if (maybeJson.startsWith('{') || maybeJson.startsWith('[') || (maybeJson.startsWith('"') && maybeJson.endsWith('"'))) {
                  try {
                    const parsed = JSON.parse(maybeJson)
                    const ext = extractBase64(parsed)
                    base64 = sanitizeBase64(ext.base64)
                    mime = ext.mime
                    dataUri = ext.dataUri
                    if (!mime) mime = detectImageMime(base64) || 'image/jpeg'
                  } catch {
                    base64 = sanitizeBase64(maybeJson)
                    mime = detectImageMime(base64) || 'image/jpeg'
                  }
                } else {
                  base64 = sanitizeBase64(maybeJson)
                  mime = detectImageMime(base64) || 'image/jpeg'
                }
              }
              if (typeof base64 !== 'string') base64 = ''
              base64 = sanitizeBase64(base64)
              const imageSrc = dataUri || (base64 ? `data:${mime || 'image/jpeg'};base64,${base64}` : '')
              return { ...post, imageData: base64, imageType: (mime || 'image/jpeg').replace('image/', ''), imageSrc }
            } catch (e) {
              return post
            }
          })
        )

        setPosts(postsWithImages)
      } catch (e) {
        if (e.message.includes('CORS') || e.message.includes('cross-origin')) {
          setError('CORS error: Backend needs to allow cross-origin requests from your frontend')
        } else if (e.message.includes('fetch')) {
          setError('Network error: Check if your Spring Boot server is running on port 8082')
        } else {
          setError(`Failed to fetch blogs: ${e.message}`)
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12"
    >
      <motion.h1 
        initial={{ y: 30, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        transition={{ type: 'spring', stiffness: 120, damping: 18, delay: 0.1 }} 
        className="text-center text-4xl sm:text-5xl font-extrabold tracking-tight text-[color:var(--color-ashoka-blue)]"
      >
        Blog
      </motion.h1>
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        <SectionDivider variant="bars" className="mt-6" />
      </motion.div>
      
      {loading && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 text-gray-600 text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="inline-block w-6 h-6 border-2 border-[color:var(--color-ashoka-blue)] border-t-transparent rounded-full mr-2"
          />
          Loading...
        </motion.div>
      )}
      
      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <div className="text-red-600 mb-3">{error}</div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </motion.button>
        </motion.div>
      )}
      
      {!loading && !error && (
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {posts.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="col-span-full text-center text-gray-500"
            >
              No blog posts found.
            </motion.div>
          ) : (
            posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 100, 
                  damping: 20, 
                  delay: 0.1 * index 
                }}
              >
                <HoverCard className="rounded-xl">
                  <motion.article 
                    whileHover={{ 
                      y: -8, 
                      scale: 1.02,
                      boxShadow: "0 25px 50px rgba(0,0,0,0.15)"
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="group rounded-xl overflow-hidden border bg-white shadow-lg h-[440px] flex flex-col cursor-pointer"
                  >
                    {post.imageSrc ? (
                      <motion.div 
                        className="h-56 w-full overflow-hidden"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                      >
                        <img 
                          src={post.imageSrc}
                          alt={post.heading || 'Blog post image'} 
                          className="h-full w-full object-cover transition-transform duration-300" 
                          onError={(e) => {
                            e.target.parentElement.innerHTML = `
                              <div class=\"h-40 w-full bg-gray-200 flex items-center justify-center\">\n                                <span class=\"text-gray-500 text-sm\">Image failed to load</span>\n                              </div>
                            `
                          }}
                          onLoad={() => {}}
                        />
                      </motion.div>
                    ) : (
                      <div className="h-40 w-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-sm">No image available</span>
                      </div>
                    )}
                    
                    <div className="p-5 flex-1 flex flex-col">
                      <motion.h3 
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="text-lg font-bold text-[color:var(--color-ashoka-blue)] mb-2 line-clamp-2 group-hover:text-[color:var(--color-india-saffron)] transition-colors"
                      >
                        {post.heading || 'Untitled Post'}
                      </motion.h3>
                      <p className="text-xs text-gray-500 mb-2">
                        {post.postTime ? new Date(post.postTime).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        }) : 'Date not available'}
                      </p>
                      <p className="text-gray-700 line-clamp-2 mb-3 text-sm">
                        {post.content || 'No content available'}
                      </p>
                      <Link
                        to={`/blogs/${encodeURIComponent(post.id ?? post.heading ?? '')}`}
                        state={{ post }}
                        className="mt-auto inline-flex items-center text-[color:var(--color-india-saffron)] font-semibold hover:text-orange-600 transition-colors text-sm group/link"
                      >
                        Read More 
                        <motion.span 
                          className="ml-1"
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          →
                        </motion.span>
                      </Link>
                    </div>
                  </motion.article>
                </HoverCard>
              </motion.div>
            ))
          )}
        </motion.div>
      )}
    </motion.div>
  )
}