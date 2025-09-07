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
        // Prefer direct URL field from backend
        const imageUrl = data.imageUrl || data.imageURL || data.image_url || data.coverImageUrl || data.thumbnailUrl || ''
        const imageSrc = imageUrl || ''
        setPost({ ...data, imageSrc })
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
            <div className="aspect-[4/3] w-full">
              <img 
                src={post.imageSrc}
                alt={post.heading || 'Blog post image'} 
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.parentElement.nextSibling.style.display = 'flex'
                }}
              />
            </div>
            <div 
              className="hidden aspect-[4/3] w-full bg-gray-200 items-center justify-center"
              style={{ display: 'none' }}
            >
              <span className="text-gray-500 text-lg">Image failed to load</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Blog Content (render raw HTML, themed blue, no border/background) */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div
          className="mt-2 text-[color:var(--color-ashoka-blue)] text-lg sm:text-xl leading-relaxed"
          dangerouslySetInnerHTML={{ __html: post.content || '' }}
        />
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
