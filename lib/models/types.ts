// lib/models/types.ts

export interface Vote {
  _id?: string
  candidateId: string // Changed from number to string
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
  votedCandidates: string[] // Changed from number[] to string[]
  createdAt: Date
  lastVoteAt?: Date
}

export interface Candidate {
  _id: string;
  id: string; // Keep as string
  name: string;
  standard?: string;
  house: string;
  photo?: string;
  emoji?: string;
  votes: number;
  createdAt?: string;
  updatedAt?: string;
}

// If you need the original MongoDB document type, create a separate interface
export interface CandidateDocument {
  _id: any; // MongoDB ObjectId
  id: string; // Changed from number to string
  name: string;
  standard?: string;
  house: string;
  photo?: string;
  emoji?: string;
  votes: number;
  createdAt?: Date;
  updatedAt?: Date;
}
