import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

// Team Member Card Component with Tricolor Border
const TeamMemberCard = ({ member, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="relative rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 bg-[color:var(--color-ashoka-blue)] w-full sm:max-w-[360px] md:max-w-[380px] lg:max-w-[400px] mx-auto"
    >
      {/* Blue themed card (tricolour fill removed) */}
      
      {/* Card Content */}
      <div className="relative z-10 text-center">
        {/* Profile Photo */}
        <div className="mx-auto w-32 h-32 md:w-40 md:h-40 lg:w-44 lg:h-44 rounded-full bg-white p-1 mb-4">
          <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {member.image ? (
              <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
            ) : (
              <div className="text-3xl md:text-4xl font-bold text-[color:var(--color-ashoka-blue)]">
                {member.name?.charAt(0) || '?'}
              </div>
            )}
          </div>
        </div>
        
        {/* Name */}
        <h3 className="text-lg md:text-xl font-bold text-white mb-2">
          {member.name || 'Name'}
        </h3>
        
        {/* Committee */}
        {member.committee && (
          <p className="text-sm md:text-base text-white/85 font-medium">
            {member.committee}
          </p>
        )}
      </div>
    </motion.div>
  )
}

// Senior Executives Table Component
const SeniorExecutivesTable = ({ executives }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-5xl mx-auto"
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[color:var(--color-ashoka-blue)]">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                S.No
              </th>
              <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                Photo
              </th>
              <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                Position
              </th>
              <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                Committee
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {executives.map((executive, index) => (
              <motion.tr
                key={executive.id || index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-2 whitespace-nowrap text-sm text-[color:var(--color-ashoka-blue)]">
                  {index + 1}
                </td>
                <td className="px-6 py-2 whitespace-nowrap">
                  <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center shadow-sm">
                    {executive.image ? (
                      <img src={executive.image} alt={executive.name || 'Member photo'} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-sm font-semibold text-[color:var(--color-ashoka-blue)]">
                        {(executive.name || '?').charAt(0)}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-[color:var(--color-ashoka-blue)]">
                  {executive.name || 'Name'}
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-[color:var(--color-ashoka-blue)]">
                  {executive.position || 'Position'}
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-[color:var(--color-ashoka-blue)]">
                  {executive.committee || 'Committee'}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}

export default function Teams() {
  const [teamData, setTeamData] = useState({
    faculty: [],
    coreTeam: [],
    cellHeads: [],
    seniorExecutives: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchTeamMembers = async (position) => {
      try {
        const response = await fetch(`https://api.thinkindiasvnit.in/getMemberByPosition/${position}`)
        if (!response.ok) {
          throw new Error(`Failed to fetch ${position} members`)
        }
        const data = await response.json()
        // Handle both single object and array responses
        return Array.isArray(data) ? data : [data]
      } catch (error) {
        console.error(`Error fetching ${position}:`, error)
        return []
      }
    }

    const fetchMemberImage = async (imageId) => {
      try {
        const response = await fetch(`https://api.thinkindiasvnit.in/image/${imageId}`)
        if (!response.ok) {
          throw new Error(`Failed to fetch image ${imageId}`)
        }
        const data = await response.json()
        // Return the base64 image data with proper data URL format
        return `data:image/jpeg;base64,${data.base64Image}`
      } catch (error) {
        console.error(`Error fetching image ${imageId}:`, error)
        return null
      }
    }

    const load = async () => {
      try {
        // Fetch different team categories
        const [facultyData, coreTeamData, cellHeadsData, seniorExecutivesData] = await Promise.all([
          fetchTeamMembers('Faculty'),
          fetchTeamMembers('Core'),
          fetchTeamMembers('Cell_Heads'),
          fetchTeamMembers('Senior_Executive')
        ])

        // Fetch images for all members and map to component structure
        const mapMemberWithImage = async (member) => {
          const image = member.imageId ? await fetchMemberImage(member.imageId) : null
          return {
            id: member.id,
            name: member.name,
            position: member.position,
            committee: member.committee,
            image: image
          }
        }

        // Process all members with their images
        const [facultyWithImages, coreTeamWithImages, cellHeadsWithImages, seniorExecutivesWithImages] = await Promise.all([
          Promise.all(facultyData.map(mapMemberWithImage)),
          Promise.all(coreTeamData.map(mapMemberWithImage)),
          Promise.all(cellHeadsData.map(mapMemberWithImage)),
          Promise.all(seniorExecutivesData.map(mapMemberWithImage))
        ])

        setTeamData({
          faculty: facultyWithImages,
          coreTeam: coreTeamWithImages,
          cellHeads: cellHeadsWithImages,
          seniorExecutives: seniorExecutivesWithImages
        })
        setLoading(false)
      } catch (e) {
        setError(e.message)
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center text-[color:var(--color-ashoka-blue)]">Loading team data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center text-[color:var(--color-ashoka-blue)]">{error}</div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      {/* Page Header */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[color:var(--color-ashoka-blue)] mb-4">
          OUR TEAM
        </h1>
        <div className="flex items-center justify-center gap-4">
          <span className="h-1 w-16 bg-[color:var(--color-india-saffron)] rounded" />
          <span className="h-1 w-12 bg-gray-300 rounded" />
          <span className="h-1 w-16 bg-[color:var(--color-india-green)] rounded" />
        </div>
      </motion.div>

      {/* Faculty Section */}
      <section className="mb-16">
        <motion.h2
          initial={{ x: -20, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="text-2xl md:text-3xl font-bold text-[color:var(--color-ashoka-blue)] mb-8 text-center"
        >
          Faculty
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {teamData.faculty.map((member, index) => (
            <TeamMemberCard key={member.id} member={member} index={index} />
          ))}
        </div>
      </section>

      {/* Core Team Section */}
      <section className="mb-16">
        <motion.h2
          initial={{ x: -20, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="text-2xl md:text-3xl font-bold text-[color:var(--color-ashoka-blue)] mb-8 text-center"
        >
          Core Team
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamData.coreTeam.map((member, index) => (
            <TeamMemberCard key={member.id} member={member} index={index} />
          ))}
        </div>
      </section>

      {/* Cell Heads Section */}
      <section className="mb-16">
        <motion.h2
          initial={{ x: -20, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="text-2xl md:text-3xl font-bold text-[color:var(--color-ashoka-blue)] mb-8 text-center"
        >
          Cell Heads
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {teamData.cellHeads.map((member, index) => (
            <TeamMemberCard key={member.id} member={member} index={index} />
          ))}
        </div>
      </section>

      {/* Senior Executives Section */}
      <section>
        <motion.h2
          initial={{ x: -20, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="text-2xl md:text-3xl font-bold text-[color:var(--color-ashoka-blue)] mb-8 text-center"
        >
          Senior Executives
        </motion.h2>
        <SeniorExecutivesTable executives={teamData.seniorExecutives} />
      </section>
    </div>
  )
}
