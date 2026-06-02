import { useRef, useEffect } from 'react'
import { Camera, Trash2 } from 'lucide-react'
import { useChatStore } from '@stores/chat-store'
import { useAIStore } from '@stores/ai-store'
import { useSettingsStore } from '@stores/settings-store'
import { ChatMessage } from '@components/chat/ChatMessage'
import { ChatInput } from '@components/chat/ChatInput'
import { ScreenshotPreview } from '@components/overlay/ScreenshotPreview'

export function ChatPage(): JSX.Element {
  const { messages, currentScreenshot, pendingScreenshot, setPendingScreenshot, isStreaming, sessionId, error, clearSession } = useChatStore()
  const { currentMode, setMode, isProcessing, analyzeScreenshot, sendFollowUp, regenerate, stopGeneration } = useAIStore()
  const { appMode } = useSettingsStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleCapture = async (): Promise<void> => {
    try {
      await window.electronAPI.startCapture()
    } catch (err) {
      console.error('Capture failed:', err)
    }
  }

  const handleSendMessage = async (message: string): Promise<void> => {
    if (!sessionId && currentScreenshot) {
      await analyzeScreenshot(currentScreenshot, message)
    } else {
      await sendFollowUp(message)
    }
  }

  const handleAnalyze = async (): Promise<void> => {
    if (currentScreenshot) {
      await analyzeScreenshot(currentScreenshot)
    }
  }

  // The empty state is removed so it defaults to showing the chat layout

  return (
    <div className="page chat-page">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-left">
          <h2>Chat Session</h2>
          {sessionId && (
            <span className="chat-session-badge">
              <div className="chat-session-dot" />
              Active
            </span>
          )}
        </div>
        <div className="chat-header-actions">
          <button className="chat-action-btn" onClick={clearSession} title="Clear Session">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="chat-body">
        {/* Screenshot Preview */}
        {currentScreenshot && (
          <div className="chat-screenshot-strip">
            <ScreenshotPreview
              src={currentScreenshot}
              compact
              onAnalyze={handleAnalyze}
              isAnalyzing={isProcessing}
            />
          </div>
        )}

        {/* Messages */}
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <ChatMessage 
              key={msg.id} 
              message={msg} 
              isLast={index === messages.length - 1}
              onRegenerate={regenerate}
              isProcessing={isProcessing}
            />
          ))}

          {error && (
            <div className="chat-error">
              <span>⚠️ {error}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <ChatInput
        onSend={handleSendMessage}
        onRegenerate={regenerate}
        onStop={stopGeneration}
        isStreaming={isStreaming}
        isProcessing={isProcessing}
        hasMessages={messages.length > 0}
        onCapture={handleCapture}
        pendingScreenshot={pendingScreenshot}
        onClearPending={() => setPendingScreenshot(null)}
      />
    </div>
  )
}
