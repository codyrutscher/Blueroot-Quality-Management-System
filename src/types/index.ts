import { Document, User, Role, DocStatus, DocCategory } from '@prisma/client'

export type { Document, User, Role, DocStatus, DocCategory }

export interface DocumentWithUser extends Document {
  user: User
}

export interface SearchResult {
  document: DocumentWithUser
  score: number
  relevantChunk?: string
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: Date
}

export interface UploadResponse {
  success: boolean
  document?: Document
  error?: string
}