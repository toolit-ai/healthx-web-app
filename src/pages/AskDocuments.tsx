import { useState } from 'react'
import ChatPanel from '@/components/ChatPanel'
import StatusBadge from '@/components/StatusBadge'
import { getCorpusStatus, getRagAnswer, RAG_TRANSCRIPT } from '@/api/mock'
import type { ChatMessage } from '@/types/api'

const SUGGESTED_QUESTIONS = [
  'Stacking cap across all CBAs?',
  'Callback minimum hours ROC vs non-ROC?',
  'VTO counted toward OT threshold?',
  'WEO eligibility window rules?',
  'Holiday pay premium rate?',
]

const RECENT_QUERIES = [
  'Consecutive day premium — allied health exclusion?',
  'Preceptor pay credential expiration policy',
  'Break exception manager attestation requirement',
  'Premium labor code increase YoY correlation',
]

function mapRagToMessages(): ChatMessage[] {
  return RAG_TRANSCRIPT.map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.text,
    confidence: m.confidence,
    citations: m.citations?.map((c) => ({
      chunk_id: '',
      filename: c.doc,
      page: c.page,
      section: c.section,
      excerpt: '',
    })),
    limitations: m.limitations ? [m.limitations] : undefined,
  }))
}

export default function AskDocuments() {
  const corpus = getCorpusStatus()
  const [messages, setMessages] = useState<ChatMessage[]>(mapRagToMessages())

  function handleSend(text: string) {
    setMessages((prev) => [...prev, { role: 'user', content: text }])
    const answer = getRagAnswer(text)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: answer.answer,
          confidence: answer.confidence,
          citations: answer.citations,
          limitations: answer.limitations,
          answerable: answer.answerable,
        },
      ])
    }, 600)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, height: 'calc(100vh - 8rem)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, flex: 1, minHeight: 0 }}>
        {/* Left: Chat */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
          {/* Corpus status banner */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 18px',
              background: 'var(--jade-soft)',
              borderBottom: '1px solid var(--line-soft)',
            }}
          >
            <StatusBadge status="ready" />
            <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>
              Corpus ready · {corpus.indexed_count}/{corpus.total_count} documents indexed
            </span>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ChatPanel
              messages={messages}
              onSend={handleSend}
              placeholder="Ask about policy, CBA, or pay practices…"
            />
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
          {/* Scope card */}
          <div className="card">
            <div className="eyebrow" style={{ marginBottom: 10 }}>
              Scope
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--ink-2)', margin: '0 0 14px' }}>
              Answers are grounded in 14 uploaded documents (CBAs, policies, addendums). You can filter
              by document type or specific file.
            </p>
            <button className="btn" style={{ width: '100%' }}>
              Filter documents…
            </button>
          </div>

          {/* Suggested questions */}
          <div className="card">
            <div className="eyebrow" style={{ marginBottom: 12 }}>
              Suggested questions
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="btn ghost"
                  style={{
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                    fontSize: 13,
                    padding: '8px 10px',
                    whiteSpace: 'normal',
                    lineHeight: 1.4,
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Recent queries */}
          <div className="card">
            <div className="eyebrow" style={{ marginBottom: 12 }}>
              Recent queries
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {RECENT_QUERIES.map((q) => (
                <div
                  key={q}
                  style={{
                    fontSize: 12,
                    color: 'var(--ink-2)',
                    paddingBottom: 10,
                    borderBottom: '1px solid var(--line-soft)',
                    lineHeight: 1.45,
                  }}
                >
                  {q}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
