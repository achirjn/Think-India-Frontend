import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'
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

  // Modal state
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isPassOpen, setIsPassOpen] = useState(false)

  // Edit profile form
  const [editName, setEditName] = useState('')
  const [editFile, setEditFile] = useState(null)
  const [savingEdit, setSavingEdit] = useState(false)
  const fileInputRef = useRef(null)

  // Change password form
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [savingPass, setSavingPass] = useState(false)
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    const token = getToken()
    
    if (!token) {
      navigate('/login')
      return // Stop execution if not logged in
    }

    // Now that we know the user is logged in, fetch their data.
    const fetchUserData = async () => {
      try {
        const response = await fetch('http://localhost:8082/user/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        if (response.ok) {
          const data = await response.json()
          setUserData(data)
        } else if (response.status === 404) {
          // Backend endpoint doesn't exist yet, use mock data
          // Keep using the existing mock data in userData state
        } else if (response.status === 401) {
          // Unauthorized - token is invalid
          localStorage.clear()
          navigate('/login')
        } else {
          // Other errors - don't log out, just use mock data
          // Keep using the existing mock data in userData state
        }
      } catch (error) {
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
                  <button onClick={() => { setIsEditOpen(true); setEditName(userData.name) }} className="absolute bottom-0 right-0 bg-[color:var(--color-ashoka-blue)] text-white p-2 rounded-full shadow-lg hover:bg-opacity-90 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
                <h2 className="mt-4 text-xl font-semibold text-gray-900">{userData.name}</h2>
                <p className="text-gray-600">{userData.email}</p>
                
                <div className="mt-6 space-y-3">
                  <button onClick={() => { setIsEditOpen(true); setEditName(userData.name) }} className="w-full bg-[color:var(--color-ashoka-blue)] text-white py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors">
                    Edit Profile
                  </button>
                  <button onClick={() => setIsPassOpen(true)} className="w-full border border-[color:var(--color-ashoka-blue)] text-[color:var(--color-ashoka-blue)] py-2 px-4 rounded-lg hover:bg-[color:var(--color-ashoka-blue)] hover:text-white transition-colors">
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

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }} className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[color:var(--color-ashoka-blue)]">Edit Profile</h3>
                <button onClick={() => setIsEditOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>
              <form className="mt-4 space-y-4" onSubmit={async (e) => {
                e.preventDefault()
                if (!userData.email) return
                const token = getToken()
                const formData = new FormData()
                formData.append('UserName', editName)
                if (editFile) formData.append('profile_pic', editFile)
                setSavingEdit(true)
                setFeedback('')
                try {
                  const res = await fetch(`http://localhost:8082/user/editProfile/${encodeURIComponent(userData.email)}` ,{
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                  })
                  if (!res.ok) throw new Error('Failed to update profile')
                  // Optimistically update UI
                  setUserData((prev) => ({ ...prev, name: editName }))
                  if (editFile) {
                    const imgUrl = URL.createObjectURL(editFile)
                    setUserData((prev) => ({ ...prev, profileImage: imgUrl }))
                  }
                  setIsEditOpen(false)
                } catch (err) {
                  setFeedback(err.message || 'Error while updating profile')
                } finally {
                  setSavingEdit(false)
                }
              }}>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input value={editName} onChange={(e)=>setEditName(e.target.value)} className="mt-1 w-full rounded-lg border-gray-300 focus:ring-[color:var(--color-ashoka-blue)] focus:border-[color:var(--color-ashoka-blue)]" type="text" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
                  <input ref={fileInputRef} onChange={(e)=>setEditFile(e.target.files?.[0]||null)} className="mt-1 w-full" type="file" accept="image/*" />
                </div>
                {feedback && <p className="text-sm text-red-600">{feedback}</p>}
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={()=>setIsEditOpen(false)} className="px-4 py-2 rounded-lg border">Cancel</button>
                  <button disabled={savingEdit} type="submit" className="px-4 py-2 rounded-lg bg-[color:var(--color-ashoka-blue)] text-white disabled:opacity-60">{savingEdit ? 'Saving...' : 'Save'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Change Password Modal */}
      <AnimatePresence>
        {isPassOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }} className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[color:var(--color-ashoka-blue)]">Change Password</h3>
                <button onClick={() => setIsPassOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>
              <form className="mt-4 space-y-4" onSubmit={async (e)=>{
                e.preventDefault()
                if (!userData.email) return
                const token = getToken()
                setSavingPass(true)
                setFeedback('')
                try {
                  const body = new URLSearchParams()
                  body.set('old_password', oldPassword)
                  body.set('new_password', newPassword)
                  const res = await fetch(`http://localhost:8082/user/changePassword/${encodeURIComponent(userData.email)}` ,{
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/x-www-form-urlencoded' },
                    body
                  })
                  if (!res.ok) {
                    const text = await res.text()
                    throw new Error(text || 'Failed to change password')
                  }
                  setIsPassOpen(false)
                  setOldPassword('')
                  setNewPassword('')
                } catch (err) {
                  setFeedback(typeof err === 'string' ? err : (err.message || 'Error while changing password'))
                } finally {
                  setSavingPass(false)
                }
              }}>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Password</label>
                  <input value={oldPassword} onChange={(e)=>setOldPassword(e.target.value)} className="mt-1 w-full rounded-lg border-gray-300 focus:ring-[color:var(--color-ashoka-blue)] focus:border-[color:var(--color-ashoka-blue)]" type="password" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">New Password</label>
                  <input value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} className="mt-1 w-full rounded-lg border-gray-300 focus:ring-[color:var(--color-ashoka-blue)] focus:border-[color:var(--color-ashoka-blue)]" type="password" required />
                </div>
                {feedback && <p className="text-sm text-red-600">{feedback}</p>}
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={()=>setIsPassOpen(false)} className="px-4 py-2 rounded-lg border">Cancel</button>
                  <button disabled={savingPass} type="submit" className="px-4 py-2 rounded-lg bg-[color:var(--color-ashoka-blue)] text-white disabled:opacity-60">{savingPass ? 'Saving...' : 'Update'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
