import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getToken, authFetch } from '../utils/auth'
import { apiUrl } from '../config/api.js'
import useAuth from '../hooks/useAuth'

export default function UserDashboard() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    profileImage: null,
    eventsRegistered: [],
    internshipsApplied: [],
    resumeId: null,
    resumeName: '',
    resumeBase64: ''
  })
  const [loadingUser, setLoadingUser] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  const getInitials = (nameStr, emailStr) => {
    const n = (nameStr || '').trim()
    if (n.length > 0) {
      const parts = n.split(/\s+/).filter(Boolean)
      const initials = (parts[0]?.[0] || '') + (parts[1]?.[0] || '')
      return initials.toUpperCase() || 'U'
    }
    const e = (emailStr || '').trim()
    if (e.length > 0) return e[0].toUpperCase()
    return 'U'
  }

  // Modal state
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isPassOpen, setIsPassOpen] = useState(false)
  const [isResumeOpen, setIsResumeOpen] = useState(false)

  // Edit profile form
  const [editName, setEditName] = useState('')
  const [editFile, setEditFile] = useState(null)
  const [savingEdit, setSavingEdit] = useState(false)
  const fileInputRef = useRef(null)

  // Change password form
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPass, setSavingPass] = useState(false)
  const [feedback, setFeedback] = useState('')

  // Resume upload form
  const [resumeName, setResumeName] = useState('')
  const [resumeFile, setResumeFile] = useState(null)
  const [uploadingResume, setUploadingResume] = useState(false)
  const [resumeFeedback, setResumeFeedback] = useState('')

  // Download helper (frontend-only from base64)
  const handleDownloadResume = async () => {
    try {
      if (!userData.resumeBase64) { setResumeFeedback('No resume available to download'); return }
      const fallbackName = userData.resumeName || 'resume.pdf'
      const base64 = userData.resumeBase64.replace(/^data:.*;base64,/, '')
      const byteChars = atob(base64)
      const byteNumbers = new Array(byteChars.length)
      for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i)
      const byteArray = new Uint8Array(byteNumbers)
      // Try to infer MIME from extension
      const lower = fallbackName.toLowerCase()
      let mime = 'application/pdf'
      if (lower.endsWith('.pdf')) mime = 'application/pdf'
      else if (lower.endsWith('.docx')) mime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      else if (lower.endsWith('.doc')) mime = 'application/msword'
      const blob = new Blob([byteArray], { type: mime })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      const fname = fallbackName
      a.href = url
      a.download = fname
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      setResumeFeedback(e.message || 'Could not download resume')
    }
  }

  useEffect(() => {
    if (authLoading) return
    const token = getToken()

    if (!token) {
      navigate('/login')
      return
    }

    const fetchUserData = async () => {
      setLoadingUser(true)
      try {
        // Prefer email from auth; fallback by decoding token
        let email = user?.email
        if (!email) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]))
            email = payload.email || payload.username || payload.sub || ''
          } catch {}
        }
        if (!email) {
          // If we still don't have an email, don't redirect; wait for auth to populate
          setLoadingUser(false)
          return
        }
        const url = apiUrl(`/user/getUserData/${encodeURIComponent(email)}`)
        const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } })
        if (response.ok) {
          const data = await response.json()
          // Resolve profile image from various backend shapes
          let resolvedImage = null

          // Candidate fields that may contain URL or base64
          const imageCandidates = [
            data.profileImage,
            data.imageUrl,
            data.profilePic,
            data.profile_image,
            data.profile_picture,
            data.Profile_pic,
            data.profileImageUrl,
            data.image
          ].filter(Boolean)

          for (const candidate of imageCandidates) {
            if (typeof candidate !== 'string') continue
            const val = candidate.trim()
            if (!val) continue
            if (val.startsWith('http') || val.startsWith('data:image/')) {
              resolvedImage = val
              break
            }
            if (val.startsWith('/')) {
              // Treat as relative path from backend using apiUrl
              resolvedImage = apiUrl(val)
              break
            }
            if (/^[A-Za-z0-9+/=]{100,}$/.test(val)) {
              // Likely bare base64
              resolvedImage = `data:image/jpeg;base64,${val}`
              break
            }
          }

          // Fetch by imageId if provided
          if (!resolvedImage) {
            const possibleIds = [
              data.imageId,
              data.profileImageId,
              data.profilePicId,
              data.profile_pic_id,
            ].filter(Boolean)
            if (possibleIds.length > 0) {
              const imgId = possibleIds[0]
              try {
                const imgRes = await authFetch(`/image/${imgId}`)
                if (imgRes.ok) {
                  const imgJson = await imgRes.json()
                  if (imgJson?.base64Image) {
                    resolvedImage = `data:image/jpeg;base64,${imgJson.base64Image}`
                  }
                }
              } catch {}
            }
          }

          // Pull resume details if present in various shapes
          let resumeId = null
          let resumeNameSrv = ''
          const resumeObjects = [
            data.resumeCV,
            data.resumeCv,
            data.resume_cv,
            data.resumeDTO,
            data.resume,
            data.resumeFile,
            Array.isArray(data.resumes) ? data.resumes[0] : null,
            Array.isArray(data.resumeList) ? data.resumeList[0] : null,
            Array.isArray(data.resume_list) ? data.resume_list[0] : null,
          ].filter(Boolean)
          // Direct id candidates
          const idCandidates = [
            data.resumeId,
            data.resume_id,
            data.resumeFileId,
            data.resume_file_id,
            ...resumeObjects.map(o => o?.id),
            ...resumeObjects.map(o => o?.resumeId),
            ...resumeObjects.map(o => o?.fileId),
          ].filter(Boolean)
          if (idCandidates.length > 0) resumeId = idCandidates[0]
          // Name candidates
          const nameCandidates = [
            data.resumeName,
            ...resumeObjects.map(o => o?.name),
            ...resumeObjects.map(o => o?.fileName),
            ...resumeObjects.map(o => o?.filename),
            ...resumeObjects.map(o => o?.originalName),
          ].filter(v => typeof v === 'string' && v)
          if (nameCandidates.length > 0) resumeNameSrv = nameCandidates[0]
          // Ensure a non-empty label when we have an id but backend didn't send a name
          if (!resumeNameSrv && (resumeId || data.resumeCV?.data)) resumeNameSrv = 'Resume'
          if (!resumeId) {
            // Help diagnostics: inspect available keys once in console
            // eslint-disable-next-line no-console
            console.debug('[UserDashboard] Resume not detected in getUserData payload keys:', Object.keys(data || {}))
          }

          setUserData({
            name: data.name || data.userName || '',
            email: data.email || email,
            profileImage: resolvedImage,
            eventsRegistered: Array.isArray(data.eventsRegistered) ? data.eventsRegistered : [],
            internshipsApplied: Array.isArray(data.internshipsApplied) ? data.internshipsApplied : [],
            resumeId: resumeId,
            resumeName: resumeNameSrv,
            resumeBase64: data.resumeCV?.data || ''
          })
        } else if (response.status === 401) {
          localStorage.clear()
          navigate('/login')
        }
      } catch (error) {
        // Silent fail, keep defaults
      } finally {
        setLoadingUser(false)
      }
    }

    fetchUserData()
  }, [authLoading, user?.email, navigate, refreshKey])

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
                  <div className="w-28 h-28 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[color:var(--color-ashoka-blue)] text-2xl font-bold mx-auto">
                    {userData.profileImage ? (
                      <img 
                        src={userData.profileImage} 
                        alt="Profile" 
                        className="w-28 h-28 rounded-full object-cover"
                      />
                    ) : (
                      getInitials(userData.name, userData.email)
                    )}
                  </div>
                </div>
                <h2 className="mt-4 text-xl font-semibold text-gray-900">{loadingUser ? 'Loading...' : (userData.name || 'User')}</h2>
                <p className="text-gray-600">{loadingUser ? '' : (userData.email || '')}</p>
                
                <div className="mt-6 space-y-3">
                  <button onClick={() => { setIsEditOpen(true); setEditName(userData.name) }} className="w-full bg-[color:var(--color-ashoka-blue)] text-white py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors">
                    Edit Profile
                  </button>
                  <button onClick={() => setIsPassOpen(true)} className="w-full border border-[color:var(--color-ashoka-blue)] text-[color:var(--color-ashoka-blue)] py-2 px-4 rounded-lg hover:bg-[color:var(--color-ashoka-blue)] hover:text-white transition-colors">
                    Change Password
                  </button>
                </div>
              </div>

              {/* Resume Figure + Edit Button */}
              <div className="mt-8 border-t pt-6">
                <h3 className="text-lg font-semibold text-[color:var(--color-ashoka-blue)] mb-3">Resume</h3>
                <div className="flex items-center gap-4 flex-wrap w-full">
                  <button
                    type="button"
                    onClick={handleDownloadResume}
                    disabled={!userData.resumeBase64}
                    className={`w-full sm:flex-1 min-w-[240px] group border rounded-xl p-4 text-left transition ${userData.resumeBase64 ? 'hover:bg-gray-50' : 'opacity-60 cursor-not-allowed'}`}
                    title={userData.resumeBase64 ? 'Click to download your resume' : 'No resume uploaded yet'}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-[color:var(--color-ashoka-blue)]/10 flex items-center justify-center text-[color:var(--color-ashoka-blue)]">
                        📄
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{userData.resumeName ? userData.resumeName : (userData.resumeBase64 ? 'Resume' : 'No resume uploaded')}</p>
                        <p className="text-xs text-gray-500">{userData.resumeBase64 ? 'Click to download' : 'Use Upload Resume to add your resume'}</p>
                      </div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={()=>{ setIsResumeOpen(true); setResumeFeedback('') }}
                    className="whitespace-nowrap border px-3 py-2 rounded-lg text-[color:var(--color-ashoka-blue)] border-[color:var(--color-ashoka-blue)] hover:bg-[color:var(--color-ashoka-blue)] hover:text-white transition shrink-0"
                  >
                    {userData.resumeBase64 ? 'Edit Resume' : 'Upload Resume'}
                  </button>
                </div>
                {resumeFeedback && (
                  <p className={`mt-2 text-sm ${/success/i.test(resumeFeedback) ? 'text-green-600' : 'text-red-600'}`}>{resumeFeedback}</p>
                )}
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
                // Match backend param names exactly
                formData.append('UserName', editName)
                if (editFile) formData.append('Profile_pic', editFile)
                setSavingEdit(true)
                setFeedback('')
                try {
                  const res = await authFetch(`/user/editProfile/${encodeURIComponent(userData.email)}` ,{
                    method: 'POST',
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
                  // Refresh from backend to ensure latest data
                  setRefreshKey((k)=>k+1)
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
                  if (newPassword !== confirmPassword) {
                    throw new Error('New password and confirm password do not match')
                  }
                  // Use exact backend param names via multipart/form-data to avoid encoding issues
                  const fd = new FormData()
                  fd.set('Old_password', oldPassword)
                  fd.set('New_password', newPassword)
                  let res = await authFetch(`/user/changePassword/${encodeURIComponent(userData.email)}` ,{
                    method: 'POST',
                    body: fd
                  })
                  if (!res.ok) {
                    // Parse any server message
                    let text = ''
                    try {
                      const ct = res.headers.get('content-type') || ''
                      if (ct.includes('application/json')) {
                        const j = await res.json()
                        text = j.message || j.error || ''
                      } else {
                        text = await res.text()
                      }
                    } catch {}

                    // Known cases
                    if (res.status === 400 && /wrong old password/i.test(text)) {
                      setOldPassword('')
                      throw new Error('Current password is incorrect.')
                    }
                    if (res.status === 401) {
                      throw new Error('Session expired. Please log in again.')
                    }
                    if (res.status === 429) {
                      throw new Error('Too many attempts. Please wait a moment and try again.')
                    }
                    if (res.status >= 500) {
                      throw new Error('Server error. Please try again later.')
                    }
                    // Generic 400 or others
                    throw new Error(text || 'Unable to change password. Please check your input and try again.')
                  }
                  setIsPassOpen(false)
                  setOldPassword('')
                  setNewPassword('')
                  setConfirmPassword('')
                  // Re-fetch user data after password change (for consistency)
                  setRefreshKey((k)=>k+1)
                } catch (err) {
                  const msg = typeof err === 'string' ? err : (err.message || 'Error while changing password')
                  setFeedback(msg)
                  if (/session expired/i.test(msg)) {
                    setTimeout(()=>{ localStorage.clear(); window.location.href = '/login' }, 1200)
                  }
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
                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                  <input value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} className="mt-1 w-full rounded-lg border-gray-300 focus:ring-[color:var(--color-ashoka-blue)] focus:border-[color:var(--color-ashoka-blue)]" type="password" required />
                  {newPassword && confirmPassword && newPassword !== confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
                  )}
                </div>
                {feedback && <p className="text-sm text-red-600">{feedback}</p>}
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={()=>setIsPassOpen(false)} className="px-4 py-2 rounded-lg border">Cancel</button>
                  <button disabled={savingPass || (newPassword && confirmPassword && newPassword !== confirmPassword)} type="submit" className="px-4 py-2 rounded-lg bg-[color:var(--color-ashoka-blue)] text-white disabled:opacity-60">{savingPass ? 'Saving...' : 'Update'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resume Upload Modal */}
      <AnimatePresence>
        {isResumeOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }} className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[color:var(--color-ashoka-blue)]">Edit Resume</h3>
                <button onClick={() => setIsResumeOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>
              <form className="mt-4 space-y-4" onSubmit={async (e) => {
                e.preventDefault()
                if (!userData.email) return
                if (!resumeFile) {
                  setResumeFeedback('Please select a file')
                  return
                }
                if (resumeFile.size > 5 * 1024 * 1024) {
                  setResumeFeedback('File too large. Max 5 MB')
                  return
                }
                const token = getToken()
                const fd = new FormData()
                fd.append('Resume_name', resumeName || resumeFile.name)
                fd.append('Resume_file', resumeFile)
                setUploadingResume(true)
                setResumeFeedback('')
                try {
                  const res = await authFetch(`/user/uploadResume/${encodeURIComponent(userData.email)}` ,{
                    method: 'POST',
                    body: fd
                  })
                  if (!res.ok) {
                    let serverMsg = ''
                    try {
                      const ct = res.headers.get('content-type') || ''
                      if (ct.includes('application/json')) {
                        const j = await res.json()
                        serverMsg = j.message || j.error || ''
                      } else {
                        serverMsg = await res.text()
                      }
                    } catch {}
                    let friendly = 'Failed to upload resume'
                    if (res.status === 401) friendly = 'Session expired. Please log in again.'
                    else if (res.status === 400) friendly = 'Invalid file or data. Please check and try again.'
                    else if (res.status === 413) friendly = 'File too large. Please upload a file under the allowed size.'
                    else if (res.status === 415) friendly = 'Unsupported file type. Please upload PDF or DOC/DOCX.'
                    else if (res.status === 429) friendly = 'Too many attempts. Please wait and try again.'
                    else if (res.status >= 500) friendly = 'Server error. Please try again later.'
                    const finalMsg = serverMsg && serverMsg.length < 160 ? serverMsg : friendly
                    if (res.status === 401) {
                      setResumeFeedback(finalMsg)
                      setTimeout(()=>{ localStorage.clear(); window.location.href = '/login' }, 1200)
                    }
                    throw new Error(finalMsg)
                  }
                  // Expect ResumeCV JSON back: { id, name, data }
                  let resumeJson = null
                  try { resumeJson = await res.json() } catch {}
                  const newId = resumeJson?.id || userData.resumeId || null
                  const newName = resumeJson?.name || (resumeName || resumeFile.name)
                  // Prefer base64 from server; fallback to reading uploaded file
                  let newBase64 = resumeJson?.data || ''
                  if (!newBase64 && resumeFile) {
                    newBase64 = await new Promise((resolve) => {
                      const reader = new FileReader()
                      reader.onload = () => resolve((reader.result || '').toString().split(',')[1] || '')
                      reader.readAsDataURL(resumeFile)
                    })
                  }
                  setUserData((prev)=> ({ ...prev, resumeId: newId, resumeName: newName, resumeBase64: newBase64 }))
                  setResumeFeedback('Resume uploaded successfully')
                  setResumeName('')
                  setResumeFile(null)
                  setIsResumeOpen(false)
                  // Ensure we fetch updated resume id/name from server
                  setRefreshKey((k)=>k+1)
                } catch (err) {
                  setResumeFeedback(err.message || 'Could not upload resume. Please try again.')
                } finally {
                  setUploadingResume(false)
                }
              }}>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Resume Name</label>
                  <input value={resumeName} onChange={(e)=>setResumeName(e.target.value)} className="mt-1 w-full rounded-lg border-gray-300 focus:ring-[color:var(--color-ashoka-blue)] focus:border-[color:var(--color-ashoka-blue)]" type="text" placeholder="e.g. John_Doe_Resume" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Select File (PDF/DOC/DOCX)</label>
                  <input onChange={(e)=>setResumeFile(e.target.files?.[0]||null)} className="mt-1 w-full" type="file" accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" />
                  {resumeFile && <p className="mt-1 text-xs text-gray-500">Selected: {resumeFile.name}</p>}
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={()=>setIsResumeOpen(false)} className="px-4 py-2 rounded-lg border">Cancel</button>
                  <button disabled={uploadingResume} type="submit" className="px-4 py-2 rounded-lg bg-[color:var(--color-ashoka-blue)] text-white disabled:opacity-60">{uploadingResume ? 'Uploading...' : 'Save'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
