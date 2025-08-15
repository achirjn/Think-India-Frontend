import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getToken } from '../utils/auth'

export default function UserDashboard() {
  const navigate = useNavigate()
  const [userData, setUserData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImage: null,
    eventsRegistered: [
      { id: 1, name: 'Tech Summit 2024', date: '2024-03-15', status: 'Confirmed' },
      { id: 2, name: 'Leadership Workshop', date: '2024-04-20', status: 'Pending' },
      { id: 3, name: 'Innovation Challenge', date: '2024-05-10', status: 'Confirmed' }
    ],
    internshipsApplied: [
      { id: 1, title: 'Software Development Intern', company: 'TechCorp', status: 'Under Review', appliedDate: '2024-02-15' },
      { id: 2, title: 'Data Science Intern', company: 'DataTech', status: 'Accepted', appliedDate: '2024-01-20' },
      { id: 3, title: 'Marketing Intern', company: 'GrowthCo', status: 'Rejected', appliedDate: '2024-03-01' }
    ]
  })

  useEffect(() => {
    console.log('🔍 UserDashboard: Component loaded')
    console.log('🔍 Current URL:', window.location.href)
    
    // This is the ONLY check needed here.
    const token = getToken()
    console.log('🔍 Token from localStorage:', token ? 'FOUND' : 'NOT FOUND')
    console.log('🔍 Token value:', token ? `${token.substring(0, 20)}...` : 'null')
    
    if (!token) {
      console.log('❌ No token found, redirecting to /login')
      navigate('/login')
      return // Stop execution if not logged in
    }

    console.log('✅ Token found, proceeding to fetch user data')
    console.log('✅ User successfully logged in and reached dashboard')

    // Now that we know the user is logged in, fetch their data.
    const fetchUserData = async () => {
      try {
        console.log('🔍 Fetching user data from backend...')
        const response = await fetch('http://localhost:8082/user/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        console.log('🔍 Backend response status:', response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log('✅ User data fetched successfully:', data)
          setUserData(data)
        } else if (response.status === 404) {
          // Backend endpoint doesn't exist yet, use mock data
          console.log('⚠️ Backend endpoint /user/profile not found (404), using mock data')
          // Keep using the existing mock data in userData state
        } else if (response.status === 401) {
          // Unauthorized - token is invalid
          console.error('❌ Unauthorized (401), token might be invalid')
          localStorage.clear()
          navigate('/login')
        } else {
          // Other errors - don't log out, just use mock data
          console.log(`⚠️ Backend error (${response.status}), using mock data`)
          // Keep using the existing mock data in userData state
        }
      } catch (error) {
        console.log('⚠️ Network error fetching user data, using mock data:', error.message)
        // Keep using the existing mock data in userData state
      }
    }

    fetchUserData()
  }, [navigate]) // Add navigate to dependency array

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'accepted':
        return 'bg-green-100 text-green-800'
      case 'pending':
      case 'under review':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-[color:var(--color-ashoka-blue)]">User Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage your profile and track your activities</p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Profile Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 120, damping: 18 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[color:var(--color-india-saffron)] to-[color:var(--color-india-green)] flex items-center justify-center text-white text-2xl font-bold mx-auto">
                    {userData.profileImage ? (
                      <img 
                        src={userData.profileImage} 
                        alt="Profile" 
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      userData.name.split(' ').map(n => n[0]).join('').toUpperCase()
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 bg-[color:var(--color-ashoka-blue)] text-white p-2 rounded-full shadow-lg hover:bg-opacity-90 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
                <h2 className="mt-4 text-xl font-semibold text-gray-900">{userData.name}</h2>
                <p className="text-gray-600">{userData.email}</p>
                
                <div className="mt-6 space-y-3">
                  <button className="w-full bg-[color:var(--color-ashoka-blue)] text-white py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors">
                    Edit Profile
                  </button>
                  <button className="w-full border border-[color:var(--color-ashoka-blue)] text-[color:var(--color-ashoka-blue)] py-2 px-4 rounded-lg hover:bg-[color:var(--color-ashoka-blue)] hover:text-white transition-colors">
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 120, damping: 18 }}
            className="lg:col-span-2 space-y-8"
          >
            {/* Events Registered */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-[color:var(--color-ashoka-blue)]">Events Registered</h3>
                <span className="bg-[color:var(--color-india-saffron)] text-white px-3 py-1 rounded-full text-sm font-medium">
                  {userData.eventsRegistered.length}
                </span>
              </div>
              
              <div className="space-y-4">
                {userData.eventsRegistered.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div>
                      <h4 className="font-medium text-gray-900">{event.name}</h4>
                      <p className="text-sm text-gray-600">{new Date(event.date).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <button className="text-[color:var(--color-ashoka-blue)] hover:underline">
                  View All Events →
                </button>
              </div>
            </div>

            {/* Internships Applied */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-[color:var(--color-ashoka-blue)]">Internships Applied</h3>
                <span className="bg-[color:var(--color-india-green)] text-white px-3 py-1 rounded-full text-sm font-medium">
                  {userData.internshipsApplied.length}
                </span>
              </div>
              
              <div className="space-y-4">
                {userData.internshipsApplied.map((internship) => (
                  <div key={internship.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{internship.title}</h4>
                        <p className="text-sm text-gray-600">{internship.company}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Applied: {new Date(internship.appliedDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(internship.status)}`}>
                        {internship.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <button className="text-[color:var(--color-ashoka-blue)] hover:underline">
                  View All Applications →
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
