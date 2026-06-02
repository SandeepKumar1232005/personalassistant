import { create } from 'zustand'
import type { AnalysisMode, AppMode, ProviderConfig } from '@typings/ai'
import { createProvider } from '@services/ai/provider-factory'
import { getSystemPrompt, getFollowUpSystemPrompt } from '@lib/prompts'
import { useChatStore } from './chat-store'
import { useSettingsStore } from './settings-store'

interface AIState {
  isProcessing: boolean
  currentMode: AnalysisMode
  error: string | null

  setMode: (mode: AnalysisMode) => void
  analyzeScreenshot: (imageBase64: string, prompt?: string) => Promise<void>
  sendFollowUp: (message: string) => Promise<void>
  regenerate: () => Promise<void>
  stopGeneration: () => void
}

let abortController: AbortController | null = null

export const useAIStore = create<AIState>((set, get) => ({
  isProcessing: false,
  currentMode: 'explain',
  error: null,

  setMode: (mode) => {
    set({ currentMode: mode })
  },

  analyzeScreenshot: async (imageBase64, prompt) => {
    const settings = useSettingsStore.getState()
    const chatStore = useChatStore.getState()

    set({ isProcessing: true, error: null })
    chatStore.setStreaming(true)

    try {
      const apiKey = await window.electronAPI.getApiKey(settings.provider)
      if (!apiKey) {
        throw new Error('No API key configured. Please add your API key in Settings.')
      }

      const config: ProviderConfig = {
        type: settings.provider,
        apiKey,
        model: settings.model,
        endpoint: settings.apiEndpoint
      }

      const provider = createProvider(config)
      const mode = get().currentMode

      // Start a new session
      chatStore.startSession(imageBase64)

      // Add user message
      const userPrompt = prompt || `[${mode.toUpperCase()}] Analyze this screenshot`
      chatStore.addUserMessage(userPrompt)

      // Add assistant message placeholder
      const assistantMsgId = chatStore.addAssistantMessage()

      // Stream response
      abortController = new AbortController()

      const stream = provider.analyzeImage({
        imageBase64,
        mode,
        prompt,
        appMode: settings.appMode
      })

      for await (const chunk of stream) {
        if (abortController?.signal.aborted) break
        chatStore.appendToMessage(assistantMsgId, chunk)
      }

      chatStore.finalizeMessage(assistantMsgId)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred'
      set({ error: message })
      chatStore.setError(message)
    } finally {
      set({ isProcessing: false })
      chatStore.setStreaming(false)
      abortController = null
    }
  },

  sendFollowUp: async (message) => {
    const settings = useSettingsStore.getState()
    const chatStore = useChatStore.getState()

    if (!chatStore.sessionId) {
      set({ error: 'No active session. Capture a screenshot first.' })
      return
    }

    set({ isProcessing: true, error: null })
    chatStore.setStreaming(true)

    try {
      const apiKey = await window.electronAPI.getApiKey(settings.provider)
      if (!apiKey) {
        throw new Error('No API key configured. Please add your API key in Settings.')
      }

      const config: ProviderConfig = {
        type: settings.provider,
        apiKey,
        model: settings.model,
        endpoint: settings.apiEndpoint
      }

      const provider = createProvider(config)

      // Add user message
      chatStore.addUserMessage(message, chatStore.pendingScreenshot || undefined)

      // Add assistant placeholder
      const assistantMsgId = chatStore.addAssistantMessage()

      // Build messages array with system prompt
      const systemPrompt = getFollowUpSystemPrompt(settings.appMode)
      const apiMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...chatStore.getMessagesForAPI()
      ]

      abortController = new AbortController()

      const stream = provider.chat({
        messages: apiMessages.map((m) => ({
          ...m,
          id: '',
          timestamp: Date.now()
        })),
        imageBase64: chatStore.currentScreenshot || undefined
      })

      for await (const chunk of stream) {
        if (abortController?.signal.aborted) break
        chatStore.appendToMessage(assistantMsgId, chunk)
      }

      chatStore.finalizeMessage(assistantMsgId)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred'
      set({ error: message })
      chatStore.setError(message)
    } finally {
      set({ isProcessing: false })
      chatStore.setStreaming(false)
      abortController = null
    }
  },

  regenerate: async () => {
    const chatStore = useChatStore.getState()
    const messages = chatStore.messages

    if (messages.length < 2) return

    // Remove last assistant message
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')
    if (!lastUserMsg) return

    // Remove the last assistant message from state
    const filteredMessages = messages.slice(0, -1)
    // We need to re-send the last user message
    useChatStore.setState({ messages: filteredMessages.slice(0, -1) })

    await get().sendFollowUp(lastUserMsg.content)
  },

  stopGeneration: () => {
    if (abortController) {
      abortController.abort()
      abortController = null
    }
    set({ isProcessing: false })
    useChatStore.getState().setStreaming(false)
  }
}))
