import { useState, useRef, useEffect } from 'react'
import { Send, Square, RefreshCw, Plus, X } from 'lucide-react'
import { cn } from '@lib/utils'

interface ChatInputProps {
  onSend: (message: string) => Promise<void>
  onRegenerate: () => Promise<void>
  onStop: () => void
  isStreaming: boolean
  isProcessing: boolean
  hasMessages: boolean
  disabled?: boolean
  onCapture?: () => void
  pendingScreenshot?: string | null
  onClearPending?: () => void
}

export function ChatInput({
  onSend,
  onRegenerate,
  onStop,
  isStreaming,
  isProcessing,
  hasMessages,
  disabled,
  onCapture,
  pendingScreenshot,
  onClearPending
}: ChatInputProps): JSX.Element {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = `${Math.min(el.scrollHeight, 150)}px`
    }
  }, [input])

  const handleSend = async (): Promise<void> => {
    if (!input.trim() || isProcessing) return
    const message = input.trim()
    setInput('')
    await onSend(message)
  }

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="chat-input-container">
      {pendingScreenshot && (
        <div className="chat-input-pending-image">
          <img src={pendingScreenshot} alt="Pending capture" />
          <button className="chat-input-pending-close" onClick={onClearPending} title="Remove image">
            <X size={14} />
          </button>
        </div>
      )}
      <div className={cn('chat-input-wrapper', disabled && 'opacity-50')}>
        {onCapture && (
          <button 
            className="chat-attach-btn" 
            onClick={onCapture}
            title="Capture Screenshot"
            disabled={isProcessing}
          >
            <Plus size={20} />
          </button>
        )}
        <textarea
          ref={textareaRef}
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? 'Capture a screenshot to start...' : 'Ask anything...'}
          disabled={disabled || isProcessing}
          rows={1}
        />

        <div className="chat-input-actions">
          {isStreaming ? (
            <button className="chat-send-btn chat-stop-btn" onClick={onStop} title="Stop">
              <Square size={16} />
            </button>
          ) : (
            <button
              className="chat-send-btn"
              onClick={handleSend}
              disabled={!input.trim() || isProcessing || disabled}
              title="Send (Enter)"
            >
              <Send size={16} />
            </button>
          )}
        </div>
      </div>


    </div>
  )
}
