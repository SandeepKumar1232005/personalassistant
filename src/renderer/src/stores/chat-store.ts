import { create } from 'zustand'
import type { ChatMessage } from '@typings/chat'
import { createMessageId, createSessionId } from '@typings/chat'

interface ChatState {
  messages: ChatMessage[]
  currentScreenshot: string | null
  pendingScreenshot: string | null
  isStreaming: boolean
  sessionId: string | null
  error: string | null

  // Actions
  // Actions
  startSession: (screenshot: string) => void
  setPendingScreenshot: (screenshot: string | null) => void
  addUserMessage: (content: string, screenshot?: string) => string
  addAssistantMessage: () => string
  appendToMessage: (id: string, chunk: string) => void
  finalizeMessage: (id: string) => void
  setStreaming: (streaming: boolean) => void
  setError: (error: string | null) => void
  clearSession: () => void
  getMessagesForAPI: () => Array<{ role: string; content: string; screenshot?: string }>
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  currentScreenshot: null,
  pendingScreenshot: null,
  isStreaming: false,
  sessionId: null,
  error: null,

  startSession: (screenshot) => {
    set({
      sessionId: createSessionId(),
      currentScreenshot: screenshot,
      pendingScreenshot: null,
      messages: [],
      error: null
    })
  },

  setPendingScreenshot: (screenshot) => {
    set({ pendingScreenshot: screenshot })
  },

  addUserMessage: (content, screenshot) => {
    const id = createMessageId()
    const message: ChatMessage = {
      id,
      role: 'user',
      content,
      screenshot,
      timestamp: Date.now()
    }
    set((state) => ({
      messages: [...state.messages, message],
      pendingScreenshot: null,
      error: null
    }))
    return id
  },

  addAssistantMessage: () => {
    const id = createMessageId()
    const message: ChatMessage = {
      id,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true
    }
    set((state) => ({
      messages: [...state.messages, message]
    }))
    return id
  },

  appendToMessage: (id, chunk) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, content: msg.content + chunk } : msg
      )
    }))
  },

  finalizeMessage: (id) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, isStreaming: false } : msg
      )
    }))
  },

  setStreaming: (streaming) => {
    set({ isStreaming: streaming })
  },

  setError: (error) => {
    set({ error })
  },

  clearSession: () => {
    set({
      messages: [],
      currentScreenshot: null,
      pendingScreenshot: null,
      isStreaming: false,
      sessionId: null,
      error: null
    })
  },

  getMessagesForAPI: () => {
    return get().messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
      screenshot: msg.screenshot
    }))
  }
}))
