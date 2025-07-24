'use client'
import { useState, useEffect } from 'react'
import { RotateCcw, UserRound, Landmark, BarChart3, Home, Database, Trophy, Download, Upload, Search, Filter } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getElectionResults, initializeElectionData } from '@/lib/action'
import { Candidate } from '@/lib/models/types'

const houseColors: Record<string, string> = {
  red: 'bg-red-500',
  blue: 'bg-blue-500', 
  green: 'bg-green-500',
  yellow: 'bg-yellow-400 text-black',
}

const houseNames: Record<string, string> = {
  red: 'Red House',
  blue: 'Blue House',
  green: 'Green House', 
  yellow: 'Yellow House',
}

const AdminPanel = () => {
  const [results, setResults] = useState<Candidate[]>([])
  const [filteredResults, setFilteredResults] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [initializing, setInitializing] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedHouse, setSelectedHouse] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'votes' | 'name' | 'house'>('votes')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [mounted, setMounted] = useState(false)
  const [currentTime, setCurrentTime] = useState<string>('')
  const router = useRouter()

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true)
    setCurrentTime(new Date().toLocaleString())
  }, [])

  const fetchResults = async () => {
    try {
      setLoading(true)
      const rawData = await getElectionResults()
      
      // Convert MongoDB documents to plain objects
      const data = JSON.parse(JSON.stringify(rawData)).map((candidate: any) => ({
        id: candidate.id || candidate._id,
        name: candidate.name,
        standard: candidate.standard,
        house: candidate.house,
        photo: candidate.photo,
        emoji: candidate.emoji,
        votes: candidate.votes,
        createdAt: candidate.createdAt,
        updatedAt: candidate.updatedAt,
      }))
      
      setResults(data)
      setFilteredResults(data)
      showMessage('✅ Results refreshed successfully', 'success')
    } catch (error) {
      console.error('Error fetching results:', error)
      showMessage('❌ Error fetching election results', 'error')
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg)
    setTimeout(() => setMessage(null), 5000)
  }

  const handleInitializeData = async () => {
    if (!confirm('This will reset all election data. Are you sure?')) {
      return
    }

    try {
      setInitializing(true)
      const result = await initializeElectionData()
      
      if (result.success) {
        showMessage('✅ Election data initialized successfully!', 'success')
        await fetchResults()
      } else {
        showMessage(`❌ ${result.message}`, 'error')
      }
    } catch (error) {
      console.error('Error initializing data:', error)
      showMessage('❌ Error initializing election data', 'error')
    } finally {
      setInitializing(false)
    }
  }

  const handleExportData = async () => {
    try {
      setExporting(true)
      const dataToExport = {
        timestamp: new Date().toISOString(),
        totalVotes: results.reduce((sum, c) => sum + c.votes, 0),
        totalCandidates: results.length,
        results: results.map(candidate => ({
          name: candidate.name,
          house: candidate.house,
          votes: candidate.votes,
          percentage: ((candidate.votes / results.reduce((sum, c) => sum + c.votes, 0)) * 100).toFixed(2)
        }))
      }

      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `election-results-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      showMessage('✅ Data exported successfully', 'success')
    } catch (error) {
      console.error('Error exporting data:', error)
      showMessage('❌ Error exporting data', 'error')
    } finally {
      setExporting(false)
    }
  }

  const handleBackToHome = () => {
    router.push('/')
  }

  // Filter and sort results
  useEffect(() => {
    let filtered = results.filter(candidate => {
      const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesHouse = selectedHouse === 'all' || candidate.house === selectedHouse
      return matchesSearch && matchesHouse
    })

    // Sort results
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'votes':
          comparison = a.votes - b.votes
          break
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'house':
          comparison = a.house.localeCompare(b.house)
          break
      }
      
      return sortOrder === 'desc' ? -comparison : comparison
    })

    setFilteredResults(filtered)
  }, [results, searchTerm, selectedHouse, sortBy, sortOrder])

  useEffect(() => {
    if (mounted) {
      fetchResults()
    }
  }, [mounted])

  // Calculate statistics
  const houseStats = results.reduce((acc, candidate) => {
    if (!acc[candidate.house]) {
      acc[candidate.house] = { totalVotes: 0, candidateCount: 0 }
    }
    acc[candidate.house].totalVotes += candidate.votes
    acc[candidate.house].candidateCount += 1
    return acc
  }, {} as Record<string, { totalVotes: number; candidateCount: number }>)

  const totalVotes = results.reduce((sum, candidate) => sum + candidate.votes, 0)
  const topCandidate = results.sort((a, b) => b.votes - a.votes)[0]
  const availableHouses = Array.from(new Set(results.map(c => c.house)))

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <RotateCcw className="animate-spin text-blue-500 mr-2" size={24} />
            <span className="text-gray-600">Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Message Display */}
      {message && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-lg z-50 transition-all duration-300 ${
          message.includes('❌') ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
        }`}>
          {message}
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            🗳️ Admin Panel - Election Results
          </h1>
          
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleBackToHome}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Home size={18} />
              Home
            </button>
            
            <button
              onClick={fetchResults}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw size={18} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>

            <button
              onClick={handleExportData}
              disabled={exporting || results.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={18} />
              {exporting ? 'Exporting...' : 'Export'}
            </button>
            
            <button
              onClick={handleInitializeData}
              disabled={initializing}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Database size={18} />
              {initializing ? 'Initializing...' : 'Initialize Data'}
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3">
              <BarChart3 className="text-blue-500" size={24} />
              <div>
                <p className="text-gray-600 text-sm">Total Votes</p>
                <p className="text-2xl font-bold text-gray-800">{totalVotes.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3">
              <UserRound className="text-green-500" size={24} />
              <div>
                <p className="text-gray-600 text-sm">Total Candidates</p>
                <p className="text-2xl font-bold text-gray-800">{results.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3">
              <Landmark className="text-purple-500" size={24} />
              <div>
                <p className="text-gray-600 text-sm">Active Houses</p>
                <p className="text-2xl font-bold text-gray-800">{Object.keys(houseStats).length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3">
              <Trophy className="text-yellow-500" size={24} />
              <div>
                <p className="text-gray-600 text-sm">Leading Candidate</p>
                <p className="text-lg font-bold text-gray-800">
                  {topCandidate ? `${topCandidate.name}` : 'None'}
                </p>
                {topCandidate && (
                  <p className="text-sm text-gray-600">{topCandidate.votes.toLocaleString()} votes</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* House Statistics */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">House Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(houseStats)
              .sort(([,a], [,b]) => b.totalVotes - a.totalVotes)
              .map(([house, stats]) => (
              <div key={house} className="text-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold mb-2 ${houseColors[house] || 'bg-gray-300'}`}>
                  {houseNames[house] || house}
                </div>
                <p className="text-2xl font-bold text-gray-800">{stats.totalVotes.toLocaleString()}</p>
                <p className="text-sm text-gray-600">{stats.candidateCount} candidates</p>
                <p className="text-xs text-gray-500">
                  {totalVotes > 0 ? ((stats.totalVotes / totalVotes) * 100).toFixed(1) : 0}% of total
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Filters & Search</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* House Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={selectedHouse}
                onChange={(e) => setSelectedHouse(e.target.value)}
                className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Houses</option>
                {availableHouses.map(house => (
                  <option key={house} value={house}>{houseNames[house] || house}</option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'votes' | 'name' | 'house')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="votes">Sort by Votes</option>
              <option value="name">Sort by Name</option>
              <option value="house">Sort by House</option>
            </select>

            {/* Sort Order */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">
              Election Results ({filteredResults.length} of {results.length} candidates)
            </h2>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RotateCcw className="animate-spin text-blue-500 mr-2" size={24} />
              <span className="text-gray-600">Loading results...</span>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="text-center py-12">
              <UserRound className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">No candidates found matching your criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">House</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Votes</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredResults.map((candidate, index) => {
                    const percentage = totalVotes > 0 ? (candidate.votes / totalVotes) * 100 : 0
                    const isLeader = index === 0 && sortBy === 'votes' && sortOrder === 'desc'
                    
                    return (
                      <tr key={`${candidate.name}-${candidate.house}`} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                              isLeader ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {index + 1}
                            </span>
                            {isLeader && <Trophy className="ml-2 text-yellow-500" size={16} />}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{candidate.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            houseColors[candidate.house] || 'bg-gray-100 text-gray-800'
                          }`}>
                            {houseNames[candidate.house] || candidate.house}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {candidate.votes.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {percentage.toFixed(2)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                houseColors[candidate.house]?.replace('text-black', '') || 'bg-gray-400'
                              }`}
                              style={{ width: `${Math.max(percentage, 1)}%` }}
                            ></div>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Last updated: {currentTime}</p>
          <p className="mt-1">Total votes cast: {totalVotes.toLocaleString()}</p>
        </div>
      </div>
    </div>
  )
}

export default AdminPanel