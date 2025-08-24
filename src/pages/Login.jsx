import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useRef, useState } from 'react'
import { setToken } from '../utils/auth'

// Shared UI helpers to mirror Signup design
const BottomGradient = () => (
  <>
    <span className="absolute inset-x-0 -bottom-px block h-[2px] w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
    <span className="absolute inset-x-10 -bottom-px mx-auto block h-[3px] w-2/3 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-md transition duration-500 group-hover/btn:opacity-100" />
  </>
)

const FieldHover = ({ children, className = '' }) => {
  const ref = useRef(null)
  const handleMove = (e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const xPct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
    el.style.setProperty('--fx', `${xPct}%`)
  }
  const handleLeave = () => {
    const el = ref.current
    if (el) el.style.setProperty('--fx', '50%')
  }
  return (
    <div ref={ref} onMouseMove={handleMove} onMouseLeave={handleLeave} className={`relative group/field ${className}`}>
      {children}
      <span
        aria-hidden
        className="pointer-events-none absolute left-0 right-0 top-0 block h-[3px] w-full opacity-0 transition duration-150 group-hover/field:opacity-100 group-focus-within/field:opacity-100"
        style={{ background: 'radial-gradient(160px 30px at var(--fx, 50%) 0, rgba(96,165,250,0.8), transparent 72%)' }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute left-0 right-0 bottom-0 block h-[3px] w-full opacity-0 transition duration-150 group-hover/field:opacity-100 group-focus-within/field:opacity-100"
        style={{ background: 'radial-gradient(160px 30px at var(--fx, 50%) 100%, rgba(96,165,250,0.8), transparent 72%)' }}
      />
    </div>
  )
}

export default function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsLoading(true)
    setErrors({})
    
    try {
      // Create FormData object to match the API expectation
      const formDataToSend = new FormData()
      formDataToSend.append('email', formData.email)
      formDataToSend.append('password', formData.password)
      
      const response = await fetch('http://localhost:8082/generate-token', {
        method: 'POST',
        body: formDataToSend
      })
      
      if (response.ok) {
        // Parse JSON response for token and isAdmin
        const data = await response.json()
        const token = data.token
        const isAdmin = data.isAdmin
        
        if (token) {
          setToken(token)
          if (isAdmin) {
              localStorage.setItem('is_admin', 'true')
          } else {
              localStorage.removeItem('is_admin')
          }
          // Redirect all users to home (Hero section)
          window.location.href = '/'
        } else {
          setErrors({ submit: 'No token received from server. Please check backend configuration.' })
        }
      } else {
        const errorData = await response.text()
        setErrors({ submit: `Login failed (${response.status}): ${errorData || 'Invalid credentials'}` })
      }
    } catch (error) {
      // Provide specific error messages based on the error type
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setErrors({ submit: 'Cannot connect to server. Please ensure the backend is running on http://localhost:8082' })
      } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        setErrors({ submit: 'Connection refused. Please check if the backend server is running and accessible.' })
      } else {
        setErrors({ submit: `Network error: ${error.message}. Please check your connection and try again.` })
      }
    } finally {
      setIsLoading(false)
    }
  }
  const handleGoogleLogin = () => {
    // This URL should point to your backend endpoint that initiates the Google OAuth flow
    window.location.href = 'http://localhost:8082/oauth2/authorization/google'; 
  };
  return (
    <motion.section 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="py-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ y: 50, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.1 }}
          className="mx-auto w-full max-w-md shadow-input rounded-none bg-white p-4 md:rounded-2xl md:p-8"
        >
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 120, damping: 18, delay: 0.2 }}
            className="text-xl font-bold text-[color:var(--color-ashoka-blue)]"
          >
            Welcome back
          </motion.h1>
          <motion.p 
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-2 max-w-sm text-sm text-[color:var(--color-ashoka-blue)]/70"
          >
            Login to your account
          </motion.p>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-6"
          >
            {errors.submit && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4"
              >
                <p className="text-sm text-red-800">{errors.submit}</p>
              </motion.div>
            )}

            <motion.form 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="my-6" 
              onSubmit={handleSubmit}
            >
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="mb-4"
              >
                <label htmlFor="email" className="text-sm font-medium text-[color:var(--color-ashoka-blue)]">Email</label>
                <FieldHover className="mt-2">
                <input 
                  id="email" 
                  name="email" 
                  type="email" 
                  required 
                  value={formData.email}
                  onChange={handleInputChange}
                    className={`w-full rounded-md border px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-ashoka-blue)] hover:border-[color:var(--color-ashoka-blue)] transition-all duration-200 ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                </FieldHover>
                {errors.email && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-sm text-red-600"
                  >
                    {errors.email}
                  </motion.p>
                )}
              </motion.div>
              
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="mb-6"
              >
                <label htmlFor="password" className="text-sm font-medium text-[color:var(--color-ashoka-blue)]">Password</label>
                <FieldHover className="mt-2">
                <input 
                  id="password" 
                  name="password" 
                  type="password" 
                  required 
                  value={formData.password}
                  onChange={handleInputChange}
                    className={`w-full rounded-md border px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-ashoka-blue)] hover:border-[color:var(--color-ashoka-blue)] transition-all duration-200 ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                </FieldHover>
                {errors.password && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-sm text-red-600"
                  >
                    {errors.password}
                  </motion.p>
                )}
              </motion.div>
              
              <motion.button 
                type="submit" 
                disabled={isLoading}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className={`group/btn relative block h-11 w-full rounded-md bg-gradient-to-br from-[color:var(--color-ashoka-blue)] to-[color:var(--color-ashoka-blue)]/80 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] transition-all duration-200 hover:from-[color:var(--color-ashoka-blue)]/90 hover:to-[color:var(--color-ashoka-blue)]/70 ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                    />
                    Logging in…
                  </span>
                ) : (
                  'Login →'
                )}
                <BottomGradient />
              </motion.button>
            </motion.form>

            <motion.div 
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent" 
            />

            <motion.button 
              type="button" 
              onClick={handleGoogleLogin}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.5 }}
              className="group/btn shadow-input relative flex h-10 w-full items-center justify-start space-x-2 rounded-md bg-gray-50 px-4 font-medium text-[color:var(--color-ashoka-blue)] transition-all duration-200 hover:bg-gray-100"
            >
              <svg className="h-4 w-4" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path fill="#4285F4" d="M533.5 278.4c0-18.4-1.5-36.8-4.7-54.6H272.1v103.4h146.7c-6.3 34.2-26.8 63.2-57.1 82.5v68.3h92.4c54.1-49.8 79.4-123.2 79.4-199.6z"/>
                <path fill="#34A853" d="M272.1 544.3c77.4 0 142.6-25.6 190.2-69.3l-92.4-68.3c-25.7 17.3-58.7 27.5-97.8 27.5-75 0-138.6-50.6-161.4-118.6H14.7v74.6c48.2 95.7 146.8 154.1 257.4 154.1z"/>
                <path fill="#FBBC05" d="M110.7 315.6c-12.3-36.9-12.3-76.4 0-113.3V127.7H14.7c-47.2 94.3-47.2 206.3 0 300.6l95.9-72.7z"/>
                <path fill="#EA4335" d="M272.1 106.8c41.9-.6 82.4 14.9 113.2 43.7l84.2-84.2C428.4 24.1 353.6-1 272.1 0 161.5 0 62.9 58.4 14.7 154.1l96 74.6C133.4 160.7 197 110.1 272.1 110.1z"/>
              </svg>
              <span className="text-sm text-[color:var(--color-ashoka-blue)]/80">Continue with Google</span>
              <BottomGradient />
            </motion.button>

            <motion.p 
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.5 }}
              className="mt-6 text-sm text-[color:var(--color-ashoka-blue)]/70"
            >
              New here? <Link to="/signup" className="text-[color:var(--color-ashoka-blue)] underline hover:text-[color:var(--color-india-saffron)] transition-colors">Create an account</Link>
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  )
}
