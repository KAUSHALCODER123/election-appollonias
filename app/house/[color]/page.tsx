'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Candidate } from '@/lib/models/types'
import { submitVote, getHouseCandidates, checkVoterSession, createVoterSession } from '@/lib/action'
import { ArrowLeft, Users, Award, CheckCircle, Vote } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import Image from 'next/image'
const houseConfig = {
  green: {
    name: 'Green House',
    gradient: 'from-green-400 to-emerald-600',
    accent: 'bg-green-500',
    border: 'border-green-300',
    text: 'text-green-700',
    emoji: '🌿'
  },
  red: {
    name: 'Red House',
    gradient: 'from-red-400 to-rose-600',
    accent: 'bg-red-500',
    border: 'border-red-300',
    text: 'text-red-700',
    emoji: '🔥'
  },
  blue: {
    name: 'Blue House',
    gradient: 'from-blue-400 to-indigo-600',
    accent: 'bg-blue-500',
    border: 'border-blue-300',
    text: 'text-blue-700',
    emoji: '🌊'
  },
  yellow: {
    name: 'Yellow House',
    gradient: 'from-yellow-400 to-amber-600',
    accent: 'bg-yellow-500',
    border: 'border-yellow-300',
    text: 'text-yellow-700',
    emoji: '☀️'
  }
} as const

export default function HousePage() {
  const { color } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentHouse = color as keyof typeof houseConfig
  const config = houseConfig[currentHouse]

  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [hasVoted, setHasVoted] = useState<boolean>(false)
  const [votedCandidateId, setVotedCandidateId] = useState<number | null>(null)
  const [voterType, setVoterType] = useState<'student' | 'teacher'>('student')
  const [sessionId, setSessionId] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [showVoteAnimation, setShowVoteAnimation] = useState<number | null>(null)
  const [isVoting, setIsVoting] = useState<boolean>(false)
  const [isInitializing, setIsInitializing] = useState(true)

  // Helper function to get stored session data with multiple fallbacks
  const getStoredSessionData = (): any => {
    try {
      // Method 1: Try sessionStorage first
      const sessionData = sessionStorage.getItem('voterSession')
      if (sessionData) {
        const parsed = JSON.parse(sessionData)
        if (parsed.voterType && parsed.sessionId) {
          console.log('Retrieved from sessionStorage:', parsed)
          return parsed
        }
      }
      
      // Method 2: Try localStorage voterSession
      const localData = localStorage.getItem('voterSession')
      if (localData) {
        const parsed = JSON.parse(localData)
        if (parsed.voterType && parsed.sessionId) {
          console.log('Retrieved from localStorage voterSession:', parsed)
          return parsed
        }
      }
      
      // Method 3: Try individual localStorage items
      const localVoterType = localStorage.getItem('voterType')
      const localSessionId = localStorage.getItem('sessionId')
      if (localVoterType && localSessionId) {
        const data = {
          voterType: localVoterType,
          sessionId: localSessionId,
          timestamp: Date.now()
        }
        console.log('Retrieved from localStorage individual items:', data)
        return data
      }
      
      return null
    } catch (error) {
      console.error('Error reading stored session data:', error)
      return null
    }
  }

  // Helper function to get voter type from multiple sources
  const getVoterType = (): 'student' | 'teacher' => {
    // Priority 1: URL parameters
    const urlVoterType = searchParams.get('voterType') as 'student' | 'teacher'
    if (urlVoterType && (urlVoterType === 'student' || urlVoterType === 'teacher')) {
      console.log('VoterType from URL:', urlVoterType)
      return urlVoterType
    }

    // Priority 2: Stored session data
    const storedData = getStoredSessionData()
    if (storedData?.voterType) {
      console.log('VoterType from stored data:', storedData.voterType)
      return storedData.voterType as 'student' | 'teacher'
    }

    // Priority 3: Individual localStorage
    const localVoterType = localStorage.getItem('voterType') as 'student' | 'teacher'
    if (localVoterType && (localVoterType === 'student' || localVoterType === 'teacher')) {
      console.log('VoterType from localStorage:', localVoterType)
      return localVoterType
    }

    // Default fallback
    console.log('Using default voterType: student')
    return 'student'
  }

  // Helper function to get session ID from multiple sources
  const getSessionId = (): string => {
    // Priority 1: URL parameters
    const urlSessionId = searchParams.get('sessionId')
    if (urlSessionId) {
      console.log('SessionId from URL:', urlSessionId)
      return urlSessionId
    }

    // Priority 2: Stored session data
    const storedData = getStoredSessionData()
    if (storedData?.sessionId) {
      console.log('SessionId from stored data:', storedData.sessionId)
      return storedData.sessionId
    }

    // Priority 3: Individual localStorage
    const localSessionId = localStorage.getItem('sessionId')
    if (localSessionId) {
      console.log('SessionId from localStorage:', localSessionId)
      return localSessionId
    }

    // Generate new session ID if none found
    const newSessionId = uuidv4()
    console.log('Generated new sessionId:', newSessionId)
    return newSessionId
  }

  // Initialize session and voter data
  useEffect(() => {
    const initializeSession = async () => {
      try {
        setIsInitializing(true)
        
        // Get voter type and session ID from multiple sources
        const detectedVoterType = getVoterType()
        const detectedSessionId = getSessionId()
        
        console.log('Detected voterType:', detectedVoterType)
        console.log('Detected sessionId:', detectedSessionId)
        
        // Set the state
        setVoterType(detectedVoterType)
        setSessionId(detectedSessionId)
        
        // Store the data for consistency
        const sessionData = {
          voterType: detectedVoterType,
          sessionId: detectedSessionId,
          selectedHouse: currentHouse,
          timestamp: Date.now(),
          houseName: config.name,
          houseColor: currentHouse
        }
        
        // Store in both sessionStorage and localStorage
        try {
          sessionStorage.setItem('voterSession', JSON.stringify(sessionData))
          localStorage.setItem('voterSession', JSON.stringify(sessionData))
          localStorage.setItem('sessionId', detectedSessionId)
          localStorage.setItem('voterType', detectedVoterType)
        } catch (storageError) {
          console.error('Error storing session data:', storageError)
        }
        
        // Create or verify voter session
        const sessionResult = await createVoterSession(detectedVoterType, detectedSessionId)
        if (!sessionResult.success) {
         console.error('Failed to create voter session:', (sessionResult as any).error);

        }
         // Should show "3.jpeg"

        // Check if user has already voted
        const sessionCheck = await checkVoterSession(detectedSessionId)
        if (sessionCheck.success && sessionCheck.session) {
          const houseVotes = sessionCheck.session.votedCandidates || []
          if (houseVotes.length > 0) {
            setHasVoted(true)
            // Ensure votedCandidateId is stored as a number for consistent comparison
            const candidateId = typeof houseVotes[0] === 'string' ? parseInt(houseVotes[0]) : houseVotes[0]
            setVotedCandidateId(candidateId)
            console.log('User has already voted for candidate:', candidateId)
          }
        }
        
      } catch (error) {
        console.error('Error initializing session:', error)
        setMessage('Error loading voting session. Please try again.')
      } finally {
        setIsInitializing(false)
      }
    }

    if (currentHouse && config) {
      initializeSession()
    }
  }, [currentHouse, config, searchParams])

  // Load candidates
  useEffect(() => {
    if (currentHouse && !isInitializing) {
      console.log('Loading candidates for house:', currentHouse)
      getHouseCandidates(currentHouse)
        .then(candidates => {
          console.log('Loaded candidates:', candidates)
          setCandidates(candidates)
        })
        .catch(error => {
          console.error('Error loading candidates:', error)
          setMessage('Error loading candidates. Please try again.')
        })
    }
  }, [currentHouse, isInitializing])

  const handleVote = async (candidate: Candidate) => {
    if (hasVoted || isVoting) return

    // Ensure consistent number type for animations
    const candidateId = typeof candidate.id === 'string' ? parseInt(candidate.id.toString()) : candidate.id
    
    setIsVoting(true)
    setShowVoteAnimation(candidateId)

    const formData = new FormData()
    formData.append('candidateId', candidate.id.toString())
    formData.append('candidateName', candidate.name)
    formData.append('house', currentHouse)
    formData.append('standard', candidate.standard ?? '');

    formData.append('voterType', voterType)
    formData.append('sessionId', sessionId)

    try {
      console.log('Submitting vote with data:', {
        candidateId: candidate.id,
        candidateName: candidate.name,
        house: currentHouse,
        standard: candidate.standard,
        voterType: voterType,
        sessionId: sessionId
      })

      const res = await submitVote(formData)

      if (res.success) {
        setHasVoted(true)
        // Ensure consistent number type for candidate ID
        const candidateId = typeof candidate.id === 'string' ? parseInt(candidate.id.toString()) : candidate.id
        setVotedCandidateId(candidateId)
        
        setMessage(res.message || 'Vote cast successfully!')
        
        // Update stored session data to reflect the vote
        const updatedSessionData = {
          voterType,
          sessionId,
          selectedHouse: currentHouse,
          timestamp: Date.now(),
          houseName: config.name,
          houseColor: currentHouse,
          hasVoted: true,
          votedCandidateId: candidate.id,
          votedCandidateName: candidate.name
        }
        
        try {
          sessionStorage.setItem('voterSession', JSON.stringify(updatedSessionData))
          localStorage.setItem('voterSession', JSON.stringify(updatedSessionData))
        } catch (storageError) {
          console.error('Error updating session data after vote:', storageError)
        }
        
        // Redirect to home page after 2 seconds
        setTimeout(() => {
          router.push('/')
        }, 2000)
      } else {
        setMessage(res.message || 'Failed to cast vote')
        setIsVoting(false)
        setShowVoteAnimation(null)
        setTimeout(() => setMessage(null), 3000)
      }
    } catch (error) {
      console.error('Error casting vote:', error)
      setMessage('An error occurred while casting your vote')
      setIsVoting(false)
      setShowVoteAnimation(null)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const handleBackClick = () => {
    router.push('/')
  }

  // Show loading state while initializing
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading voting session...</p>
        </div>
      </div>
    )
  }

  // Show error if no config found
  if (!config) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">Invalid house selected</p>
          <button
            onClick={handleBackClick}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 font-sans">
      
      {message && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-lg z-50 animate-fade-in-down ${
         
          message.includes('success') || message.includes('cast') 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
           
          {message}
        </div>
      )}

      <div className={`bg-gradient-to-r ${config.gradient} text-white py-8 px-6 shadow-xl`}>
        <div className="max-w-6xl mx-auto">
          <button
            onClick={handleBackClick}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg text-sm transition-colors"
          >
            <ArrowLeft size={20} /> Back to Home
          </button>

          <h1 className="text-4xl font-bold text-center flex justify-center mt-6">
          <Image
                  src="/SCHOOL LOGO JPG.jpg"
                  alt="School Logo"
                  width={80}
                  height={80}
                  className="object-cover rounded-full"
                />  {config.emoji} {config.name} Candidates
             
          </h1>
          
          <div className="text-center mt-4 space-y-2">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
              <Users size={16} />
              <span>Voting as: <strong className="capitalize">{voterType}</strong></span>
            </div>
            
            {hasVoted && (
              <div className="inline-flex items-center gap-2 bg-green-500/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm ml-2">
                <CheckCircle size={16} />
                <span>You have already voted in this house</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatBox 
            icon={<Users size={24} className="text-blue-500" />} 
            title="Total Candidates" 
            value={candidates.length} 
          />
          <StatBox 
            icon={<Vote size={24} className="text-green-500" />} 
            title="Vote Status" 
            value={hasVoted ? "Voted" : "Not Voted"} 
          />
          <StatBox 
            icon={<Award size={24} className="text-purple-500" />} 
            title="Voter Type" 
            value={voterType} 
          />
        </div>

        {/* Voting Instructions */}
        {!hasVoted && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-r-lg">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Instructions:</strong> You can cast only one vote in this house. Choose carefully as your vote cannot be changed once submitted.
                  {voterType === 'teacher' && (
                    <span className="block mt-1 font-semibold">
                      As a teacher, your vote carries 50 points (vs 1 point for student votes).
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

       {/* Candidate Grid */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {candidates.map((candidate) => {
    console.log("Candidate Photo:", candidate.photo); 
    const candidateId = Number(candidate.id); // Safely convert to number
    const isVotedCandidate = votedCandidateId === candidateId;
    const isAnimating = showVoteAnimation === candidateId;

    return (
      <div
        key={candidateId}
        className={`bg-white border-2 rounded-xl shadow-md transition-all duration-300 ${
          isVotedCandidate
            ? `${config?.border ?? 'border-green-500'} ring-2 ring-green-200`
            : 'border-gray-200'
        } ${isAnimating ? 'animate-pulse scale-105' : ''} ${
          hasVoted && !isVotedCandidate ? 'opacity-60' : ''
        }`}
      >
        <div
          className={`bg-gradient-to-br ${config?.gradient ?? 'from-blue-400 to-purple-500'} p-6 text-center relative`}
        >
          {isVotedCandidate && (
            <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
              <CheckCircle className="text-white" size={20} />
            </div>
          )
            }
         
         
    <div className="flex justify-center items-center h-full">
  <div className="relative w-[200px] h-[200px]">
    <Image
      src={`/${candidate.photo}`}
      alt={candidate.name}
      fill
      className="object-cover rounded"
    />
  </div>

          </div>
        </div>

        <div className="p-4">
          <h3 className="font-bold text-lg text-gray-800">{candidate.name}</h3>
          <p className="text-sm text-gray-600 mb-4">
            Standard {candidate.standard}
          </p>

          <button
            onClick={() => handleVote(candidate)}
            disabled={hasVoted || isVoting}
            className={`w-full py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
              isVotedCandidate
                ? 'bg-green-100 text-green-700 cursor-not-allowed border-2 border-green-200'
                : hasVoted
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : isVoting
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : `bg-gradient-to-r ${config?.gradient ?? 'from-blue-400 to-purple-500'} text-white hover:scale-105 hover:shadow-lg active:scale-95`
            }`}
          >
            {isVotedCandidate ? (
              <span className="flex items-center justify-center gap-2">
                <CheckCircle size={16} />
                Voted
              </span>
            ) : hasVoted ? (
              'Already Voted'
            ) : isVoting ? (
              'Casting Vote...'
            ) : (
              'Cast Vote'
            )}
          </button>
        </div>
      </div>
    );
  })}
</div>

        {/* No candidates message */}
        {candidates.length === 0 && !isInitializing && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🗳️</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Candidates Yet</h3>
            <p className="text-gray-500">Candidates for this house haven't been added yet.</p>
          </div>
        )}

        {/* Already Voted Message */}
        {hasVoted && (
          <div className="mt-8 text-center">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-md mx-auto">
              <CheckCircle className="mx-auto text-green-500 mb-3" size={32} />
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Thank you for voting!
              </h3>
              <p className="text-green-700 text-sm">
                Your vote as a <strong className="capitalize">{voterType}</strong> has been recorded. 
                You will be redirected to the home page shortly.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Fade animation */}
      <style jsx>{`
        @keyframes fade-in-down {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  )
}

function StatBox({ icon, title, value }: { icon: React.ReactNode, title: string, value: string | number }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-md flex items-center gap-4 border border-gray-200 hover:shadow-lg transition-shadow">
      {icon}
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-xl font-bold capitalize">{value}</p>
      </div>
    </div>
  )
}