import { describe, it, expect, beforeEach } from 'vitest'
import { useChatStore } from '@stores/chat-store'

describe('Chat Store', () => {
  beforeEach(() => {
    useChatStore.getState().clearSession()
  })

  it('should initialize with empty state', () => {
    const state = useChatStore.getState()
    expect(state.messages).toHaveLength(0)
    expect(state.currentScreenshot).toBeNull()
    expect(state.isStreaming).toBe(false)
    expect(state.sessionId).toBeNull()
  })

  it('should start a session with a screenshot', () => {
    const store = useChatStore.getState()
    store.startSession('data:image/png;base64,test')

    const state = useChatStore.getState()
    expect(state.sessionId).toBeTruthy()
    expect(state.currentScreenshot).toBe('data:image/png;base64,test')
    expect(state.messages).toHaveLength(0)
  })

  it('should add user messages', () => {
    const store = useChatStore.getState()
    store.startSession('data:image/png;base64,test')
    store.addUserMessage('What is this?')

    const state = useChatStore.getState()
    expect(state.messages).toHaveLength(1)
    expect(state.messages[0].role).toBe('user')
    expect(state.messages[0].content).toBe('What is this?')
  })

  it('should add assistant messages and append chunks', () => {
    const store = useChatStore.getState()
    store.startSession('data:image/png;base64,test')
    store.addUserMessage('Explain this')
    const msgId = store.addAssistantMessage()

    store.appendToMessage(msgId, 'Hello ')
    store.appendToMessage(msgId, 'world')

    const state = useChatStore.getState()
    expect(state.messages).toHaveLength(2)
    expect(state.messages[1].content).toBe('Hello world')
    expect(state.messages[1].isStreaming).toBe(true)
  })

  it('should finalize streaming messages', () => {
    const store = useChatStore.getState()
    store.startSession('data:image/png;base64,test')
    const msgId = store.addAssistantMessage()
    store.appendToMessage(msgId, 'Done')
    store.finalizeMessage(msgId)

    const state = useChatStore.getState()
    expect(state.messages[0].isStreaming).toBe(false)
  })

  it('should clear session completely', () => {
    const store = useChatStore.getState()
    store.startSession('data:image/png;base64,test')
    store.addUserMessage('Test')
    store.addAssistantMessage()
    store.clearSession()

    const state = useChatStore.getState()
    expect(state.messages).toHaveLength(0)
    expect(state.currentScreenshot).toBeNull()
    expect(state.sessionId).toBeNull()
    expect(state.isStreaming).toBe(false)
  })

  it('should get messages formatted for API', () => {
    const store = useChatStore.getState()
    store.startSession('data:image/png;base64,test')
    store.addUserMessage('Hello')
    const id = store.addAssistantMessage()
    store.appendToMessage(id, 'Hi there')

    const apiMessages = useChatStore.getState().getMessagesForAPI()
    expect(apiMessages).toHaveLength(2)
    expect(apiMessages[0].role).toBe('user')
    expect(apiMessages[1].role).toBe('assistant')
  })
})
