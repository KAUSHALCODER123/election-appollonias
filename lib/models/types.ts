
// lib/models/types.ts


export interface Vote {
  _id?: string
  candidateId: number
  candidateName: string
  house: string
  standard: string
  voterType: 'student' | 'teacher'
  points: number
  sessionId: string
  voterIp?: string
  timestamp: Date
}

export interface VoterSession {
  _id?: string
  sessionId: string
  voterType: 'student' | 'teacher'
  votedCandidates: number[]
  createdAt: Date
  lastVoteAt?: Date
}



export interface Candidate {
  _id: any
  id: string; // Changed from ObjectId to string
  name: string;
  standard?: string;
  house: string;
  photo?: string;
  emoji?: string;
  votes: number;
  createdAt?: string; // Changed from Date to string
  updatedAt?: string; // Changed from Date to string
}

// If you need the original MongoDB document type, create a separate interface
export interface CandidateDocument {
  _id: any; // MongoDB ObjectId
  id: number;
  name: string;
  standard?: string;
  house: string;
  photo?: string;
  emoji?: string;
  votes: number;
  createdAt?: Date;
  updatedAt?: Date;
}
