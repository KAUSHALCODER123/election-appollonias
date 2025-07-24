// lib/actions.ts
'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { 
  initializeCandidates, 
  getCandidatesByHouse, 
  getAllCandidates, 
  getVoterSession, 
  createOrUpdateVoterSession, 
  castVote 
} from './database'
import { Candidate } from './models/types'

export async function initializeElectionData() {
  try {
    await initializeCandidates()
    return { success: true, message: 'Election data initialized successfully' }
  } catch (error) {
    console.error('Error initializing election data:', error)
    return { success: false, message: 'Failed to initialize election data' }
  }
}

export async function getHouseCandidates(house: string): Promise<Candidate[]> {
  try {
    const candidates = await getCandidatesByHouse(house)
    
    // Convert MongoDB documents to plain objects
    return candidates.map(doc => ({
      _id: doc._id?.toString() || '', // Include _id as required by Candidate interface
      id: doc.id?.toString() || doc._id?.toString() || '', // Convert ObjectId to string
      name: doc.name || '',
      standard: doc.standard || '',
      house: doc.house || '',
      photo: doc.photo || '',
      emoji: doc.emoji || '',
      votes: doc.votes || 0,
      createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : undefined,
      updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : undefined,
    }))
  } catch (error) {
    console.error('Error fetching house candidates:', error)
    return []
  }
}

export async function getElectionResults(): Promise<Candidate[]> {
  try {
    const results = await getAllCandidates()
    
    // Convert MongoDB documents to plain objects
    return results.map(doc => ({
      _id: doc._id?.toString() || '', // Include _id as required by Candidate interface
      id: doc.id?.toString() || doc._id?.toString() || '', // Convert ObjectId to string
      name: doc.name || '',
      standard: doc.standard || '',
      house: doc.house || '',
      photo: doc.photo || '',
      emoji: doc.emoji || '',
      votes: doc.votes || 0,
      createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : undefined,
      updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : undefined,
    }))
  } catch (error) {
    console.error('Error fetching election results:', error)
    return []
  }
}

export async function submitVote(formData: FormData) {
  try {
    const candidateId = formData.get('candidateId') as string
    const candidateName = formData.get('candidateName') as string
    const house = formData.get('house') as string
    const standard = formData.get('standard') as string
    const voterType = formData.get('voterType') as ('student' | 'teacher')
    const sessionId = formData.get('sessionId') as string
    
    // Get voter's IP address
    const headersList = headers()
    const voterIp = (await headersList).get('x-forwarded-for') || 'unknown'
    
    // Check if voter has already voted for this candidate
    const existingSession = await getVoterSession(sessionId)
    if (existingSession && existingSession.votedCandidates.includes(candidateId)) {
      return { success: false, message: 'You have already voted for this candidate' }
    }
    
    const points = voterType === 'teacher' ? 50 : 1
    
    // Cast the vote
    const voteSuccess = await castVote({
      candidateId,
      candidateName,
      house,
      standard,
      voterType,
      points,
      sessionId,
      voterIp,
      timestamp: new Date()
    })
    
    if (!voteSuccess) {
      return { success: false, message: 'Failed to cast vote' }
    }
    
    // Update voter session
    const votedCandidates = existingSession ? 
      [...existingSession.votedCandidates, candidateId] : 
      [candidateId]
    
    await createOrUpdateVoterSession({
      sessionId,
      voterType,
      votedCandidates,
      lastVoteAt: new Date()
    })
    
    return { 
      success: true, 
      message: `Vote cast successfully for ${candidateName}! (${points} points)`,
      points 
    }
    
  } catch (error) {
    console.error('Error submitting vote:', error)
    return { success: false, message: 'Failed to submit vote' }
  }
}

export async function checkVoterSession(sessionId: string) {
  try {
    const session = await getVoterSession(sessionId)
    return {
      success: true,
      session: session ? {
        voterType: session.voterType,
        votedCandidates: session.votedCandidates
      } : null
    }
  } catch (error) {
    console.error('Error checking voter session:', error)
    return { success: false, session: null }
  }
}

export async function createVoterSession(voterType: 'student' | 'teacher', sessionId: string) {
  try {
    await createOrUpdateVoterSession({
      sessionId,
      voterType,
      votedCandidates: [],
      createdAt: new Date()
    })
    return { success: true }
  } catch (error) {
    console.error('Error creating voter session:', error)
    return { success: false }
  }
}
