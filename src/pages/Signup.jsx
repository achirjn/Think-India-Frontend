import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useRef, useState } from 'react'

// UI helpers inspired by the provided design
const BottomGradient = () => (
  <>
    <span className="absolute inset-x-0 -bottom-px block h-[2px] w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
    <span className="absolute inset-x-10 -bottom-px mx-auto block h-[3px] w-2/3 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-md transition duration-500 group-hover/btn:opacity-100" />
  </>
)

const LabelInputContainer = ({ children, className = '' }) => (
  <div className={`flex w-full flex-col space-y-2 ${className}`}>{children}</div>
)

const GoogleIcon = ({ className = 'h-4 w-4' }) => (
  <svg className={className} viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path fill="#4285F4" d="M533.5 278.4c0-18.4-1.5-36.8-4.7-54.6H272.1v103.4h146.7c-6.3 34.2-26.8 63.2-57.1 82.5v68.3h92.4c54.1-49.8 79.4-123.2 79.4-199.6z"/>
    <path fill="#34A853" d="M272.1 544.3c77.4 0 142.6-25.6 190.2-69.3l-92.4-68.3c-25.7 17.3-58.7 27.5-97.8 27.5-75 0-138.6-50.6-161.4-118.6H14.7v74.6c48.2 95.7 146.8 154.1 257.4 154.1z"/>
    <path fill="#FBBC05" d="M110.7 315.6c-12.3-36.9-12.3-76.4 0-113.3V127.7H14.7c-47.2 94.3-47.2 206.3 0 300.6l95.9-72.7z"/>
    <path fill="#EA4335" d="M272.1 106.8c41.9-.6 82.4 14.9 113.2 43.7l84.2-84.2C428.4 24.1 353.6-1 272.1 0 161.5 0 62.9 58.4 14.7 154.1l96 74.6C133.4 160.7 197 110.1 272.1 110.1z"/>
  </svg>
)

// Field wrapper that moves a subtle blue glow along the top and bottom borders following the cursor
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
        style={{
          background:
            'radial-gradient(160px 30px at var(--fx, 50%) 0, rgba(96,165,250,0.8), transparent 72%)',
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute left-0 right-0 bottom-0 block h-[3px] w-full opacity-0 transition duration-150 group-hover/field:opacity-100 group-focus-within/field:opacity-100"
        style={{
          background:
            'radial-gradient(160px 30px at var(--fx, 50%) 100%, rgba(96,165,250,0.8), transparent 72%)',
        }}
      />
    </div>
  )
}

export default function Signup() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

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
    
    if (!formData.name) {
      newErrors.name = 'Name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
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
      formDataToSend.append('name', formData.name)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('password', formData.password)

      const response = await fetch('http://localhost:8082/auth/register', {
        method: 'POST',
        body: formDataToSend
      })

      if (response.ok) {
        const result = await response.text()
        setSuccessMessage('Registration successful! Redirecting to login...')
        
        // Clear form
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: ''
        })
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      } else {
        const errorData = await response.text()
        setErrors({ submit: `Registration failed (${response.status}): ${errorData || 'Please try again.'}` })
      }
    } catch (error) {
      // Provide more specific error messages based on the error type
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
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-md shadow-input rounded-none bg-white p-4 md:rounded-2xl md:p-8">
          <motion.h1
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 120, damping: 18 }}
            className="text-xl font-bold text-[color:var(--color-ashoka-blue)]"
          >
            Welcome to Think India
          </motion.h1>
          <p className="mt-2 max-w-sm text-sm text-[color:var(--color-ashoka-blue)]/70">
            Create your account to join the community
          </p>

          {successMessage && (
            <div className="mt-4 mb-2 rounded-lg bg-green-50 border border-green-200 p-3">
              <p className="text-sm text-green-800">{successMessage}</p>
            </div>
          )}
          {errors.submit && (
            <div className="mt-4 mb-2 rounded-lg bg-red-50 border border-red-200 p-3">
              <p className="text-sm text-red-800">{errors.submit}</p>
            </div>
          )}

          <form className="my-6" onSubmit={handleSubmit}>
            <LabelInputContainer className="mb-4">
              <label htmlFor="name" className="text-sm font-medium text-[color:var(--color-ashoka-blue)]">Name</label>
              <FieldHover className="mt-2">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full rounded-md border px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-ashoka-blue)] hover:border-[color:var(--color-ashoka-blue)] ${errors.name ? 'border-red-300' : 'border-gray-300'}`}
                />
              </FieldHover>
              {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
            </LabelInputContainer>

            <LabelInputContainer className="mb-4">
              <label htmlFor="email" className="text-sm font-medium text-[color:var(--color-ashoka-blue)]">Email Address</label>
              <FieldHover className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full rounded-md border px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-ashoka-blue)] hover:border-[color:var(--color-ashoka-blue)] ${errors.email ? 'border-red-300' : 'border-gray-300'}`}
                />
              </FieldHover>
              {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
            </LabelInputContainer>

            <LabelInputContainer className="mb-4">
              <label htmlFor="password" className="text-sm font-medium text-[color:var(--color-ashoka-blue)]">Password</label>
              <FieldHover className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full rounded-md border px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-ashoka-blue)] hover:border-[color:var(--color-ashoka-blue)] ${errors.password ? 'border-red-300' : 'border-gray-300'}`}
                />
              </FieldHover>
              {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
            </LabelInputContainer>

            <LabelInputContainer className="mb-6">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-[color:var(--color-ashoka-blue)]">Confirm Password</label>
              <FieldHover className="mt-2">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full rounded-md border px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-ashoka-blue)] hover:border-[color:var(--color-ashoka-blue)] ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'}`}
                />
              </FieldHover>
              {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword}</p>}
            </LabelInputContainer>

            <button
              type="submit"
              disabled={isLoading}
              className={`group/btn relative block h-11 w-full rounded-md bg-gradient-to-br from-[color:var(--color-ashoka-blue)] to-[color:var(--color-ashoka-blue)]/80 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] transition-all duration-200 hover:from-[color:var(--color-ashoka-blue)]/90 hover:to-[color:var(--color-ashoka-blue)]/70 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Creating account…' : 'Sign up →'}
              <BottomGradient />
            </button>

            <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent" />

            <div className="flex flex-col space-y-4">
              <motion.button
                type="button"
                onClick={handleGoogleLogin}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.5 }}
                className="group/btn shadow-input relative flex h-10 w-full items-center justify-start space-x-2 rounded-md bg-gray-50 px-4 font-medium text-[color:var(--color-ashoka-blue)] transition-all duration-200 hover:bg-gray-100"
              >
                <GoogleIcon className="h-4 w-4" />
                <span className="text-sm text-[color:var(--color-ashoka-blue)]/80">Continue with Google</span>
                <BottomGradient />
              </motion.button>
            </div>

            <p className="mt-6 text-sm text-[color:var(--color-ashoka-blue)]/70">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-[color:var(--color-ashoka-blue)] underline underline-offset-2 decoration-1 transition-colors duration-200 hover:text-[color:var(--color-india-saffron)] hover:underline-offset-4 hover:decoration-2"
              >
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  )
}
