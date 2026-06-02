import { useState } from 'react'
import { User, Bot, Copy, Check, RefreshCw } from 'lucide-react'
import { MarkdownRenderer } from './MarkdownRenderer'
import { cn, copyToClipboard, formatTimestamp } from '@lib/utils'
import type { ChatMessage as ChatMessageType } from '@typings/chat'

interface ChatMessageProps {
  message: ChatMessageType
  isLast?: boolean
  onRegenerate?: () => void
  isProcessing?: boolean
}

export function ChatMessage({ message, isLast, onRegenerate, isProcessing }: ChatMessageProps): JSX.Element {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'

  const handleCopy = async (): Promise<void> => {
    await copyToClipboard(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn('chat-msg', isUser ? 'chat-msg-user' : 'chat-msg-assistant')}>
      <div className="chat-msg-avatar">
        {isUser ? (
          <div className="chat-avatar-user">
            <User size={16} />
          </div>
        ) : (
          <div className="chat-avatar-bot">
            <Bot size={16} />
          </div>
        )}
      </div>

      <div className="chat-msg-body">
        <div className="chat-msg-header">
          <span className="chat-msg-role">{isUser ? 'You' : 'SnapAssist AI'}</span>
          <span className="chat-msg-time">{formatTimestamp(message.timestamp)}</span>
        </div>

        <div className="chat-msg-content">
          {message.screenshot && (
            <div className="chat-msg-screenshot">
              <img src={message.screenshot} alt="Captured context" />
            </div>
          )}
          {isUser ? (
            <p>{message.content}</p>
          ) : (
            <>
              <MarkdownRenderer content={message.content} />
              {message.isStreaming && (
                <span className="chat-msg-cursor">▊</span>
              )}
            </>
          )}
        </div>

        {!isUser && message.content && !message.isStreaming && (
          <div className="chat-msg-actions">
            <button className="chat-msg-action-btn" onClick={handleCopy} title="Copy">
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            {isLast && onRegenerate && (
              <button 
                className="chat-msg-action-btn" 
                onClick={onRegenerate} 
                disabled={isProcessing}
                title="Regenerate"
              >
                <RefreshCw size={14} />
                Regenerate
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
