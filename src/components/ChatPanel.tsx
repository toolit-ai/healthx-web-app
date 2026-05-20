import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import type { ChatMessage } from '@/types/api'

interface ChatPanelProps {
  messages: ChatMessage[]
  onSend: (text: string) => void
  placeholder?: string
  disabled?: boolean
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'
  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[80%] rounded-lg px-4 py-2 text-sm',
          isUser ? 'bg-muted text-foreground' : 'border border-border bg-card text-foreground'
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        {!isUser && message.answerable === false && (
          <p className="mt-1 text-xs text-amber-600">Not answerable from corpus</p>
        )}
        {!isUser && message.confidence && (
          <p className="mt-1 text-xs text-muted-foreground">Confidence: {message.confidence}</p>
        )}
        {!isUser && message.citations && message.citations.length > 0 && (
          <details className="mt-2">
            <summary className="cursor-pointer text-xs text-muted-foreground">Citations ({message.citations.length})</summary>
            <div className="mt-1 space-y-1">
              {message.citations.map((c, i) => (
                <div key={i} className="rounded bg-muted p-2 text-xs">
                  <p className="font-medium">{c.filename} {c.page && `(p. ${c.page})`}</p>
                  <p className="text-muted-foreground">{c.excerpt}</p>
                </div>
              ))}
            </div>
          </details>
        )}
        {!isUser && message.limitations && message.limitations.length > 0 && (
          <p className="mt-2 text-xs text-muted-foreground">Limitations: {message.limitations.join('; ')}</p>
        )}
      </div>
    </div>
  )
}

export default function ChatPanel({ messages, onSend, placeholder = 'Ask a question...', disabled = false }: ChatPanelProps) {
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || disabled) return
    onSend(input.trim())
    setInput('')
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">No messages yet. Start the conversation.</p>
        )}
        {messages.map((msg, i) => (
          <ChatBubble key={i} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSubmit} className="border-t border-border p-3">
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder={disabled ? 'Chat disabled' : placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={disabled}
          />
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            disabled={disabled || !input.trim()}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  )
}
