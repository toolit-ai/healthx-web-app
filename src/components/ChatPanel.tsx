import { useState, useRef, useEffect } from 'react'
import type { ChatMessage } from '@/types/api'
import StatusBadge from './StatusBadge'

interface ChatPanelProps {
  messages: ChatMessage[]
  onSend: (text: string) => void
  placeholder?: string
  disabled?: boolean
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'
  if (isUser) {
    return (
      <div style={{ alignSelf: 'flex-end', maxWidth: '75%' }}>
        <div
          style={{
            padding: '12px 16px',
            background: 'var(--ink)',
            color: 'var(--bg)',
            borderRadius: '16px 16px 4px 16px',
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          {message.content}
        </div>
        <div
          style={{
            textAlign: 'right',
            marginTop: 4,
            fontSize: 11,
            color: 'var(--ink-mute)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          You
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '85%' }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
        <span
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            background: 'var(--ink)',
            color: 'var(--bg)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 14,
          }}
        >
          x
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--ink-mute)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          HealthX RAG
        </span>
        {message.confidence ? <StatusBadge status={message.confidence} /> : null}
      </div>
      <div
        style={{
          padding: '14px 18px',
          background: 'var(--bg-card)',
          border: '1px solid var(--line-soft)',
          borderRadius: '4px 16px 16px 16px',
          fontSize: 14,
          lineHeight: 1.6,
          color: message.content.startsWith('…') ? 'var(--ink-mute)' : 'var(--ink-2)',
          fontStyle: message.content.startsWith('…') ? 'italic' : 'normal',
        }}
      >
        {message.content}
      </div>
      {message.citations && message.citations.length > 0 ? (
        <div style={{ marginTop: 12, paddingLeft: 14, borderLeft: '2px solid var(--jade)' }}>
          <div className="eyebrow" style={{ marginBottom: 8, color: 'var(--jade-deep)' }}>
            Citations
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {message.citations.map((c, i) => (
              <div key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-2)' }}>
                <span style={{ color: 'var(--ink)' }}>{c.filename}</span>
                <span style={{ color: 'var(--ink-mute)' }}>
                  {' '}
                  · {c.section}
                  {c.page ? ` · p.${c.page}` : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      {message.limitations && message.limitations.length > 0 ? (
        <div
          style={{
            marginTop: 10,
            padding: '8px 12px',
            background: 'oklch(0.95 0.06 75)',
            borderRadius: 6,
            fontSize: 12,
            color: 'oklch(0.4 0.13 75)',
          }}
        >
          △ {message.limitations.join('; ')}
        </div>
      ) : null}
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
    <div style={{ display: 'flex', height: '100%', flexDirection: 'column' }}>
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 22px',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        {messages.length === 0 && (
          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--ink-mute)' }}>
            No messages yet. Start the conversation.
          </p>
        )}
        {messages.map((msg, i) => (
          <ChatBubble key={i} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSubmit} style={{ padding: 16, borderTop: '1px solid var(--line-soft)', display: 'flex', gap: 8 }}>
        <input
          className="field"
          style={{ fontFamily: 'var(--font-sans)', flex: 1 }}
          placeholder={disabled ? 'Chat disabled' : placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={disabled}
        />
        <button type="submit" className="btn accent" disabled={disabled || !input.trim()}>
          {disabled ? '…' : 'Ask →'}
        </button>
      </form>
    </div>
  )
}
