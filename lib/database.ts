
// lib/database.ts
import clientPromise from './mongodb'
import { Candidate, Vote, VoterSession } from './models/types'

export async function initializeCandidates() {
  const client = await clientPromise
  const db = client.db('school_election')
 const candidatesData: Omit<Candidate, '_id'>[] = [
  { id: '1', name: 'Jeevika Singh', standard: 'VIII', house: 'red', photo: '1.jpeg', emoji: '👩‍🎓', votes: 0 },
  { id: '2', name: 'Mohit Yadav', standard: 'VIII', house: 'red', photo: '2.jpeg', emoji: '👨‍🎓', votes: 0 },
  { id: '3', name: 'Mansi Upadhyay', standard: 'VII', house: 'red', photo: '3.jpeg', emoji: '👩‍🎓', votes: 0 },
  { id: '4', name: 'Khushi Yadav', standard: 'VIII', house: 'red', photo: '4.jpeg', emoji: '👩‍🎓', votes: 0 },
  { id: '5', name: 'Chinmay Parte', standard: 'IX', house: 'red', photo: '5.jpeg', emoji: '👨‍🎓', votes: 0 },
  { id: '6', name: 'Suhani Maurya', standard: 'IX', house: 'red', photo: '6.jpg', emoji: '👩‍🎓', votes: 0 },
  { id: '7', name: 'Vishal Pandit', standard: 'IX', house: 'red', photo: '7.jpg', emoji: '👨‍🎓', votes: 0 },
  { id: '8', name: 'Shivam Gupta', standard: 'IX', house: 'red', photo: '8.jpg', emoji: '👨‍🎓', votes: 0 },

  { id: '9', name: 'Rimsha Vishwakarma', standard: 'VIII', house: 'yellow', photo: '9.jpeg', emoji: '👩‍🎓', votes: 0 },
  { id: '10', name: 'Ananya Singh', standard: 'IX', house: 'yellow', photo: '10.jpeg', emoji: '👩‍🎓', votes: 0 },
  { id: '11', name: 'Pratik Sharma', standard: 'IX', house: 'yellow', photo: '11.jpeg', emoji: '👨‍🎓', votes: 0 },
  { id: '12', name: 'Shreyansh Sharma', standard: 'VIII', house: 'yellow', photo: '12.jpeg', emoji: '👨‍🎓', votes: 0 },
  { id: '13', name: 'Shivam Yadav', standard: 'VIII', house: 'yellow', photo: '13.jpeg', emoji: '👨‍🎓', votes: 0 },
  { id: '14', name: 'Shreya Yadav', standard: 'VIII', house: 'yellow', photo: '14.jpeg', emoji: '👩‍🎓', votes: 0 },
  { id: '15', name: 'Lakshmi Yadav', standard: 'VIII', house: 'yellow', photo: '15.jpeg', emoji: '👩‍🎓', votes: 0 },
  { id: '16', name: 'Bhumi Sah', standard: 'IX', house: 'yellow', photo: '16.jpeg', emoji: '👩‍🎓', votes: 0 },

  { id: '17', name: 'Vishal Parihariya', standard: 'VIII', house: 'blue', photo: '17.jpg', emoji: '👨‍🎓', votes: 0 },
  { id: '18', name: 'Rudra Rane', standard: 'IX', house: 'blue', photo: '18.jpg', emoji: '👨‍🎓', votes: 0 },
  { id: '19', name: 'Versha Kanojiya', standard: 'IX', house: 'blue', photo: '19.jpeg', emoji: '👩‍🎓', votes: 0 },
  { id: '20', name: 'Pallavi Singh', standard: 'VIII', house: 'blue', photo: '20.jpeg', emoji: '👩‍🎓', votes: 0 },
  { id: '21', name: 'Krishna Yadav', standard: 'IX', house: 'blue', photo: '21.jpg', emoji: '👨‍🎓', votes: 0 },
  { id: '22', name: 'Ronak Maurya', standard: 'IX', house: 'blue', photo: '22.jpeg', emoji: '👨‍🎓', votes: 0 },
  { id: '23', name: 'Lokesh Sonawane', standard: 'IX', house: 'blue', photo: '23.jpg', emoji: '👨‍🎓', votes: 0 },
  { id: '24', name: 'Sandesh Das', standard: 'IX', house: 'blue', photo: '24.jpg', emoji: '👨‍🎓', votes: 0 },
  { id: '25', name: 'Prashant Pasi', standard: 'IX', house: 'blue', photo: '25.jpg', emoji: '👨‍🎓', votes: 0 },
  { id: '26', name: 'Aadarsh Barawal', standard: 'VIII', house: 'blue', photo: '26.jpeg', emoji: '👨‍🎓', votes: 0 },
  { id: '27', name: 'Divya Singh', standard: 'VIII', house: 'blue', photo: '27.jpeg', emoji: '👩‍🎓', votes: 0 },
  { id: '28', name: 'Aarushi Sharma', standard: 'VIII', house: 'blue', photo: '28.jpeg', emoji: '👩‍🎓', votes: 0 },

  { id: '29', name: 'Janvi Singh', standard: 'VIII', house: 'green', photo: '29.jpeg', emoji: '👩‍🎓', votes: 0 },
  { id: '30', name: 'Archana Yadav', standard: 'VIII', house: 'green', photo: '30.jpeg', emoji: '👩‍🎓', votes: 0 },
  { id: '31', name: 'Madhav Sharma', standard: 'IX', house: 'green', photo: '31.jpg', emoji: '👨‍🎓', votes: 0 },
  { id: '32', name: 'Ankit Yadav', standard: 'VIII', house: 'green', photo: '32.jpeg', emoji: '👨‍🎓', votes: 0 },
  { id: '33', name: 'Yatharth Yadav', standard: 'VIII', house: 'green', photo: '33.jpeg', emoji: '👨‍🎓', votes: 0 },
  { id: '34', name: 'Anjali Prajapati', standard: 'VIII', house: 'green', photo: '34.jpeg', emoji: '👩‍🎓', votes: 0 },
  { id: '35', name: 'Aakansha Padvekar', standard: 'IX', house: 'green', photo: '35.jpeg', emoji: '👩‍🎓', votes: 0 },
  { id: '36', name: 'Bhakti Choudhary', standard: 'IX', house: 'green', photo: '36.jpeg', emoji: '👩‍🎓', votes: 0 },
];




  // Add timestamps
  const candidatesWithTimestamps = candidatesData.map(candidate => ({
    ...candidate,
    createdAt: new Date(),
    updatedAt: new Date()
  }))

  // Clear existing and insert new
  await db.collection('candidates').deleteMany({})
  await db.collection('candidates').insertMany(candidatesWithTimestamps)
  
  console.log('Candidates initialized successfully')
}

export async function getCandidatesByHouse(house: string): Promise<Candidate[]> {
  const client = await clientPromise
  const db = client.db('school_election')
  
  const candidates = await db.collection<Candidate>('candidates')
    .find({ house })
    .sort({ name: 1 })
    .toArray()
  
  return candidates
}

export async function getAllCandidates(): Promise<Candidate[]> {
  const client = await clientPromise
  const db = client.db('school_election')
  
  const candidates = await db.collection<Candidate>('candidates')
    .find({})
    .sort({ house: 1, name: 1 })
    .toArray()
  
  return candidates
}

export async function getVoterSession(sessionId: string): Promise<VoterSession | null> {
  const client = await clientPromise
  const db = client.db('school_election')
  
  const session = await db.collection<VoterSession>('voter_sessions')
    .findOne({ sessionId })
  
  return session
}

export async function createOrUpdateVoterSession(sessionData: Partial<VoterSession>): Promise<void> {
  const client = await clientPromise
  const db = client.db('school_election')

  // Destructure and exclude `createdAt` to avoid conflict
  const { createdAt, ...dataWithoutCreatedAt } = sessionData

  await db.collection('voter_sessions').updateOne(
    { sessionId: sessionData.sessionId },
    { 
      $set: {
        ...dataWithoutCreatedAt,
        lastVoteAt: new Date()
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    },
    { upsert: true }
  )
}



export async function castVote(voteData: Omit<Vote, '_id'>): Promise<boolean> {
  const client = await clientPromise
  const db = client.db('school_election')
  
  const session = await client.startSession()
  
  try {
    await session.withTransaction(async () => {
      // Record the vote
      await db.collection('votes').insertOne({
        ...voteData,
        timestamp: new Date()
      })
      
      // Update candidate vote count
      await db.collection('candidates').updateOne(
        { id: voteData.candidateId },
        { 
          $inc: { votes: voteData.points },
          $set: { updatedAt: new Date() }
        }
      )
    })
    
    return true
  } catch (error) {
    console.error('Error casting vote:', error)
    return false
  } finally {
    await session.endSession()
  }
}