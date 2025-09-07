import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import SectionDivider from '../components/SectionDivider.jsx'
import { HoverCard } from '../components/ui/card-hover-effect.jsx'
import { stripHtmlToText } from '../utils/text.js'
import { cacheKeyForUrl, swrFetch } from '../utils/swrCache.js'

export default function Blogs() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const cacheKey = cacheKeyForUrl('https://api.thinkindiasvnit.in/blogPageGetAllBlogs', 'blogs-v1')
    const TTL = 5 * 60 * 1000

    const fetchBlogs = async () => {
      let res = await fetch('https://api.thinkindiasvnit.in/blogPageGetAllBlogs', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) {
        res = await fetch('https://api.thinkindiasvnit.in/blogPageGetAllBlogs', {
          method: 'GET',
          mode: 'cors',
          headers: { 'Content-Type': 'application/json' },
        })
      }
      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`HTTP ${res.status}: ${errorText || 'Failed to fetch blogs'}`)
      }
      const data = await res.json()
      const mapped = (Array.isArray(data) ? data : []).map((post) => {
        const imageUrl = post.imageUrl || post.imageURL || post.image_url || post.coverImageUrl || post.thumbnailUrl || ''
        return { ...post, imageSrc: imageUrl || '' }
      })
      return mapped
    }

    let cancelled = false
    const { cached, revalidate } = swrFetch({ key: cacheKey, fetcher: fetchBlogs, ttlMs: TTL })
    if (cached && !cancelled) {
      setPosts(cached)
      setLoading(false)
    }
    revalidate
      .then((fresh) => {
        if (cancelled) return
        setPosts(fresh)
        setLoading(false)
      })
      .catch((e) => {
        if (cancelled) return
        const msg = (e?.message || '').toLowerCase()
        if (msg.includes('cors') || msg.includes('cross-origin')) {
          setError('CORS error: Unable to access the API. Please try again later.')
        } else if (msg.includes('network') || msg.includes('fetch')) {
          setError('Network error: Unable to reach the backend. Please try again later.')
        } else {
          setError(`Failed to fetch blogs: ${e.message}`)
        }
        if (!cached) setLoading(false)
      })

    const onFocus = () => {
      swrFetch({ key: cacheKey, fetcher: fetchBlogs, ttlMs: TTL }).revalidate
        .then((fresh) => { if (!cancelled) setPosts(fresh) })
        .catch(() => {})
    }
    window.addEventListener('focus', onFocus)
    return () => { cancelled = true; window.removeEventListener('focus', onFocus) }
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
                        {stripHtmlToText(post.content) || 'No content available'}
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