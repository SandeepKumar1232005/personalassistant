export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  isStreaming?: boolean
  screenshot?: string
}

export interface ChatSession {
  id: string
  screenshot: string | null
  messages: ChatMessage[]
  createdAt: number
  analysisMode: string
}

export function createMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

export function createSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}
