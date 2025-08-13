import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'

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
      
      console.log('Attempting to register with:', { name: formData.name, email: formData.email })
      
      const response = await fetch('http://localhost:8082/auth/register', {
        method: 'POST',
        body: formDataToSend
      })
      
      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)
      
      if (response.ok) {
        const result = await response.text()
        console.log('Registration successful:', result)
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
        console.error('Registration failed:', response.status, errorData)
        setErrors({ submit: `Registration failed (${response.status}): ${errorData || 'Please try again.'}` })
      }
    } catch (error) {
      console.error('Network error details:', error)
      
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
            Sign up
          </motion.h1>

          <div className="mt-6 rounded-2xl border p-6 shadow-sm">
            {successMessage && (
              <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-4">
                <p className="text-sm text-green-800">{successMessage}</p>
              </div>
            )}
            
            {errors.submit && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4">
                <p className="text-sm text-red-800">{errors.submit}</p>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                <input 
                  id="name" 
                  name="name" 
                  type="text" 
                  required 
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`mt-2 w-full rounded-lg border px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-ashoka-blue)] ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

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
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <input 
                  id="confirmPassword" 
                  name="confirmPassword" 
                  type="password" 
                  required 
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`mt-2 w-full rounded-lg border px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-ashoka-blue)] ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
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
                {isLoading ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            <p className="mt-6 text-sm text-gray-600">
              Already have an account? <Link to="/login" className="text-[color:var(--color-ashoka-blue)] underline">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
