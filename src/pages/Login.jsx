import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { setToken } from '../utils/auth'

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
            navigate('/admin')
          } else {
            localStorage.removeItem('is_admin')
            navigate('/')
          }
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

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md">
          <motion.h1
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 120, damping: 18 }}
            className="text-3xl font-extrabold text-[color:var(--color-ashoka-blue)]"
          >
            Login
          </motion.h1>

          <div className="mt-6 rounded-2xl border p-6 shadow-sm">
            {errors.submit && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4">
                <p className="text-sm text-red-800">{errors.submit}</p>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input 
                  id="email" 
                  name="email" 
                  type="email" 
                  required 
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`mt-2 w-full rounded-lg border px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-ashoka-blue)] ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <input 
                  id="password" 
                  name="password" 
                  type="password" 
                  required 
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`mt-2 w-full rounded-lg border px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-ashoka-blue)] ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>
              
              <button 
                type="submit" 
                disabled={isLoading}
                className={`w-full rounded-lg px-4 py-3 text-white font-semibold shadow transition-all ${
                  isLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-[color:var(--color-ashoka-blue)] hover:opacity-90'
                }`}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div className="my-5 flex items-center gap-2 text-xs text-gray-500">
              <div className="h-px flex-1 bg-gray-200" />
              <span>or</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <button type="button" className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-800 shadow hover:bg-gray-50">
              Continue with Google
            </button>

            <p className="mt-6 text-sm text-gray-600">
              New here? <Link to="/signup" className="text-[color:var(--color-ashoka-blue)] underline">Create an account</Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
