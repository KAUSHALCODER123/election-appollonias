'use client'
import { useState, useEffect, ForwardRefExoticComponent, RefAttributes } from 'react'
import { Users, GraduationCap, Crown, Star, Waves, Sun, Leaf, Flame, Settings, LucideProps, Shield, Award, Target } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createVoterSession } from '@/lib/action'
import Image from 'next/image'

// Enhanced house type definition
interface House {
  name: string
  color: string
  description: string
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>
  gradient: string
  bgGradient: string
  textColor: string
  motto: string
  values: string[]
  emoji: string
  borderColor: string
  hoverShadow: string
}

// Particle interface for type safety
interface Particle {
  id: number
  width: number
  height: number
  left: number
  top: number
  animationDelay: number
  animationDuration: number
}

const houses: House[] = [
  { 
    name: 'Green House', 
    color: 'green', 
    description: 'Unity and Growth',
    icon: Leaf,
    gradient: 'from-green-400 via-emerald-500 to-green-600',
    bgGradient: 'from-green-50 to-emerald-100',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
    hoverShadow: 'shadow-green-500/25',
    motto: 'Together We Grow',
    values: ['Unity', 'Growth', 'Harmony'],
    emoji: '🌿'
  },
  { 
    name: 'Red House', 
    color: 'red', 
    description: 'Courage and Strength',
    icon: Flame,
    gradient: 'from-red-400 via-rose-500 to-red-600',
    bgGradient: 'from-red-50 to-rose-100',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
    hoverShadow: 'shadow-red-500/25',
    motto: 'Strength in Unity',
    values: ['Courage', 'Strength', 'Honor'],
    emoji: '🔥'
  },
  { 
    name: 'Blue House', 
    color: 'blue', 
    description: 'Wisdom and Knowledge',
    icon: Waves,
    gradient: 'from-blue-400 via-indigo-500 to-blue-600',
    bgGradient: 'from-blue-50 to-indigo-100',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    hoverShadow: 'shadow-blue-500/25',
    motto: 'Knowledge is Power',
    values: ['Wisdom', 'Knowledge', 'Truth'],
    emoji: '🌊'
  },
  { 
    name: 'Yellow House', 
    color: 'yellow', 
    description: 'Joy and Creativity',
    icon: Sun,
    gradient: 'from-yellow-400 via-amber-500 to-yellow-600',
    bgGradient: 'from-yellow-50 to-amber-100',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-200',
    hoverShadow: 'shadow-yellow-500/25',
    motto: 'Shine Bright',
    values: ['Joy', 'Creativity', 'Innovation'],
    emoji: '☀️'
  }
]

// Enhanced voting statistics (mock data)
const votingStats = {
  totalVotes: 1247,
  studentsVoted: 892,
  teachersVoted: 71,
  participationRate: 78
}

export default function Home() {
  const [voterType, setVoterType] = useState<'student' | 'teacher'>('student')
  const [selectedHouse, setSelectedHouse] = useState<string | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [sessionId, setSessionId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Mark component as mounted to prevent hydration issues
    setIsMounted(true)
    
    // Generate unique session ID with better entropy
    const generateSessionId = () => {
      const timestamp = Date.now().toString(36)
      const randomPart = Math.random().toString(36).substring(2, 15)
      const additionalEntropy = Math.random().toString(36).substring(2, 9)
      return `session_${timestamp}_${randomPart}_${additionalEntropy}`
    }
    
    // Check if there's an existing session
    const existingSessionData = getStoredSessionData()
    if (existingSessionData?.sessionId) {
      setSessionId(existingSessionData.sessionId)
      setVoterType(existingSessionData.voterType || 'student')
    } else {
      setSessionId(generateSessionId())
    }
    
    // Generate particles only on client side
    const generateParticles = (): Particle[] => {
      return Array.from({ length: 25 }, (_, i) => ({
        id: i,
        width: 4 + Math.random() * 8,
        height: 4 + Math.random() * 8,
        left: Math.random() * 100,
        top: Math.random() * 100,
        animationDelay: Math.random() * 5,
        animationDuration: 3 + Math.random() * 4
      }))
    }
    
    setParticles(generateParticles())
    
    // Add entrance animation with staggered timing
    setIsAnimating(true)
    const timer = setTimeout(() => setIsAnimating(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  // Helper function to get stored session data with fallback
  const getStoredSessionData = (): any => {
    if (typeof window === 'undefined') return null
    
    try {
      // Try sessionStorage first
      const sessionData = sessionStorage.getItem('voterSession')
      if (sessionData) {
        return JSON.parse(sessionData)
      }
      
      // Fallback to localStorage
      const localData = localStorage.getItem('voterSession')
      if (localData) {
        return JSON.parse(localData)
      }
      
      return null
    } catch (error) {
      console.error('Error reading stored session data:', error)
      return null
    }
  }

  // Helper function to store session data with fallback
  const storeSessionData = (data: any): void => {
    if (typeof window === 'undefined') return
    
    try {
      // Try sessionStorage first
      sessionStorage.setItem('voterSession', JSON.stringify(data))
      // Also store in localStorage as backup
      localStorage.setItem('voterSession', JSON.stringify(data))
      // Store individual values for easier access
      localStorage.setItem('sessionId', data.sessionId)
      localStorage.setItem('voterType', data.voterType)
    } catch (error) {
      console.error('Error storing session data:', error)
      // If sessionStorage fails, at least try localStorage
      try {
        localStorage.setItem('voterSession', JSON.stringify(data))
        localStorage.setItem('sessionId', data.sessionId)
        localStorage.setItem('voterType', data.voterType)
      } catch (localError) {
        console.error('Error storing to localStorage:', localError)
      }
    }
  }

  const handleVoterTypeChange = (newVoterType: 'student' | 'teacher') => {
    setVoterType(newVoterType)
    
    // Update stored data immediately when voter type changes
    const existingData = getStoredSessionData()
    const updatedData = {
      ...existingData,
      voterType: newVoterType,
      sessionId: sessionId,
      timestamp: Date.now()
    }
    
    storeSessionData(updatedData)
  }

  const handleHouseClick = async (house: House) => {
    if (isLoading) return
    
    setSelectedHouse(house.color)
    setIsLoading(true)
    
    try {
      // Create voter session with enhanced error handling
      const result = await createVoterSession(voterType, sessionId)
      
      if (result.success) {
        // Store comprehensive session data
        const sessionData = {
          voterType,
          sessionId,
          selectedHouse: house.color,
          timestamp: Date.now(),
          houseName: house.name,
          houseColor: house.color
        }
        
        // Store session data with fallback
        storeSessionData(sessionData)
        
        // Add a brief delay for better UX
        setTimeout(() => {
          // Pass voter type as URL parameter as additional backup
          router.push(`/house/${house.color}?voterType=${voterType}&sessionId=${sessionId}`)
        }, 500)
      } else {
        const errorMessage = (result as any).error || 'Failed to create voting session';
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error creating session:', error)
      alert('An error occurred while creating your voting session. Please try again.')
      setSelectedHouse(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdminClick = () => {
    router.push('/admin')
  }

  const toggleStats = () => {
    setShowStats(!showStats)
  }

  // Don't render particles until component is mounted
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Enhanced Background Animation */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Enhanced floating particles - Only render on client */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute bg-white rounded-full opacity-20 animate-bounce"
            style={{
              width: `${particle.width}px`,
              height: `${particle.height}px`,
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.animationDelay}s`,
              animationDuration: `${particle.animationDuration}s`
            }}
          />
        ))}
      </div>

      {/* Admin Button */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={handleAdminClick}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-white hover:bg-white/20 transition-all duration-300 group"
        >
          <Settings size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          <span className="hidden sm:inline">Admin</span>
        </button>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        {/* Enhanced Header Section */}
        <div className={`text-center mb-12 ${isAnimating ? 'animate-fade-in-down' : ''}`}>
          <div className="relative">
            <h1 className="flex items-center justify-center gap-4 flex-wrap text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 mb-4 animate-gradient-x">
              <Image
                src="/SCHOOL LOGO JPG.jpg"
                alt="School Logo"
                width={80}
                height={80}
                className="object-cover rounded-full"
              />
              ST. APPOLLONIA'S CONVENT ENGLISH SCHOOL
            </h1>

            <div
              className="absolute -top-4 -right-4 text-4xl animate-spin"
              style={{ animationDuration: '3s' }}
            >
              ⭐
            </div>
            <div
              className="absolute -bottom-2 -left-4 text-2xl animate-bounce"
              style={{ animationDelay: '1s' }}
            >
              🎓
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 animate-fade-in">
            Election 2024
          </h2>

          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Cast your vote and shape the future of our school community.{' '}
            <span className="text-yellow-400 font-semibold">Every voice matters!</span>
          </p>

          {/* Enhanced decorative elements */}
          <div className="flex justify-center gap-4 mt-6">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
            <div
              className="w-2 h-2 bg-pink-400 rounded-full animate-ping"
              style={{ animationDelay: '1s' }}
            ></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
          </div>
        </div>

        {/* Enhanced Voter Type Selection */}
        <div className={`mb-12 w-full max-w-md ${isAnimating ? 'animate-fade-in-up' : ''}`}>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center gap-2">
              <Users size={24} />
              Who is voting?
            </h3>
            
            <div className="space-y-4">
              <label className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                voterType === 'student' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105' 
                  : 'bg-white/5 hover:bg-white/10 text-gray-300'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${voterType === 'student' ? 'bg-white/20' : 'bg-blue-500/20'}`}>
                    <GraduationCap size={24} />
                  </div>
                  <div>
                    <span className="font-semibold text-lg">Student</span>
                    <p className="text-sm opacity-80">1 point per vote</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="voterType"
                  value="student"
                  className="w-5 h-5 accent-blue-500"
                  checked={voterType === 'student'}
                  onChange={(e) => handleVoterTypeChange(e.target.value as 'student' | 'teacher')}
                />
              </label>
              
              <label className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                voterType === 'teacher' 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg scale-105' 
                  : 'bg-white/5 hover:bg-white/10 text-gray-300'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${voterType === 'teacher' ? 'bg-white/20' : 'bg-green-500/20'}`}>
                    <Crown size={24} />
                  </div>
                  <div>
                    <span className="font-semibold text-lg">Teacher</span>
                    <p className="text-sm opacity-80">50 points per vote</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="voterType"
                  value="teacher"
                  className="w-5 h-5 accent-green-500"
                  checked={voterType === 'teacher'}
                  onChange={(e) => handleVoterTypeChange(e.target.value as 'student' | 'teacher')}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Enhanced Houses Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl mb-12 ${isAnimating ? 'animate-fade-in' : ''}`}>
          {houses.map((house, index) => {
            const IconComponent = house.icon
            const isSelected = selectedHouse === house.color
            const isCurrentlyLoading = isLoading && isSelected
            
            return (
              <div
                key={house.color}
                className={`group relative cursor-pointer transform transition-all duration-500 hover:scale-105 ${
                  isSelected ? 'scale-110 z-20' : ''
                } ${isLoading && !isSelected ? 'opacity-50 pointer-events-none' : ''}`}
                onClick={() => handleHouseClick(house)}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                {/* Enhanced glow effect */}
                <div className={`absolute -inset-1 bg-gradient-to-r ${house.gradient} rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-500 ${
                  isSelected ? 'opacity-100 animate-pulse' : ''
                }`}></div>
                
                {/* Main card */}
                <div className={`relative bg-gradient-to-br ${house.bgGradient} backdrop-blur-sm rounded-2xl p-8 border ${house.borderColor} shadow-2xl overflow-hidden hover:${house.hoverShadow} hover:shadow-2xl transition-all duration-300 ${
                  isCurrentlyLoading ? 'animate-pulse' : ''
                }`}>
                  {/* Loading overlay */}
                  {isCurrentlyLoading && (
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-2xl flex items-center justify-center z-30">
                      <div className="flex items-center gap-3 text-white">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span className="font-semibold">Connecting...</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Background pattern */}
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 text-6xl opacity-10">
                    {house.emoji}
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${house.gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent size={32} />
                      </div>
                      <div>
                        <h3 className={`text-2xl font-bold ${house.textColor} group-hover:scale-105 transition-transform duration-300`}>
                          {house.name}
                        </h3>
                        <p className="text-gray-600 font-medium">{house.description}</p>
                      </div>
                    </div>
                    
                    {/* Motto */}
                    <div className="mb-4">
                      <p className={`text-lg font-semibold ${house.textColor} italic`}>
                        "{house.motto}"
                      </p>
                    </div>
                    
                    {/* Values */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {house.values.map((value, idx) => (
                        <span 
                          key={idx}
                          className={`px-3 py-1 bg-gradient-to-r ${house.gradient} text-white text-sm font-medium rounded-full shadow-sm`}
                        >
                          {value}
                        </span>
                      ))}
                    </div>
                    
                    {/* Call to action */}
                    <div className="text-center">
                      <div className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${house.gradient} text-white font-semibold rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                        <Shield size={18} />
                        <span>Vote for {house.name}</span>
                        <Star size={18} className="group-hover:rotate-12 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="text-center text-gray-400 text-sm">
          <p>Secure • Anonymous • Fair</p>
          <div className="flex justify-center items-center gap-2 mt-2">
            <Shield size={16} />
            <span>Your vote is protected by end-to-end encryption</span>
          </div>
        </div>
      </div>

      {/* Custom styles for animations */}
      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% {
            background-size: 200% 200%;
            background-position: left center;
          }
          50% {
            background-size: 200% 200%;
            background-position: right center;
          }
        }
        
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-gradient-x {
          animation: gradient-x 6s ease infinite;
        }
        
        .animate-fade-in-down {
          animation: fade-in-down 1s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out;
        }
        
        .animate-fade-in {
          animation: fade-in 1.5s ease-out;
        }
        
        .animate-slide-in-left {
          animation: slide-in-left 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}