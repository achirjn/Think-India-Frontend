import { useState, useEffect } from 'react'
import { authFetch } from '../utils/auth'

export default function ProtectedComponent() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Example of making an authenticated API call
  const fetchProtectedData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // This will automatically include the JWT token in the Authorization header
      const response = await authFetch('https://api.thinkindiasvnit.in/api/protected-endpoint')
      
      if (response.ok) {
        const result = await response.json()
        setData(result)
      } else {
        setError(`Failed to fetch data: ${response.status}`)
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Example of posting data with authentication
  const postProtectedData = async (postData) => {
    try {
      const response = await authFetch('https://api.thinkindiasvnit.in/api/protected-endpoint', {
        method: 'POST',
        body: JSON.stringify(postData)
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('Data posted successfully:', result)
        return result
      } else {
        throw new Error(`Failed to post data: ${response.status}`)
      }
    } catch (error) {
      console.error('Error posting data:', error)
      throw error
    }
  }

  useEffect(() => {
    // Example: Fetch data when component mounts
    // fetchProtectedData()
  }, [])

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Protected API Example</h3>
      
      <div className="space-y-4">
        <button
          onClick={fetchProtectedData}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Loading...' : 'Fetch Protected Data'}
        </button>
        
        <button
          onClick={() => postProtectedData({ message: 'Hello from frontend!' })}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Post Protected Data
        </button>
        
        {error && (
          <div className="text-red-600 text-sm">
            Error: {error}
          </div>
        )}
        
        {data && (
          <div className="text-sm">
            <strong>Response:</strong>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}











