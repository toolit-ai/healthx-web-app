import { useState } from 'react'
import ChatPanel from '@/components/ChatPanel'
import StatusBadge from '@/components/StatusBadge'
import { getCorpusStatus, getRagAnswer } from '@/api/mock'
import type { ChatMessage } from '@/types/api'

const SUGGESTED_QUESTIONS = [
  'What is the overtime rate according to the CBA?',
  'How is shift differential calculated?',
  'What is the on-call pay policy?',
  'Explain the meal premium rule.',
]

export default function AskDocuments() {
  const corpus = getCorpusStatus()
  const [messages, setMessages] = useState<ChatMessage[]>([])

  function handleSend(text: string) {
    setMessages((prev) => [...prev, { role: 'user', content: text }])
    const answer = getRagAnswer(text)
    setTimeout(() => {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: answer.answer,
        confidence: answer.confidence,
        citations: answer.citations,
        limitations: answer.limitations,
        answerable: answer.answerable,
      }])
    }, 600)
  }

  return (
    <div className="space-y-4 h-[calc(100vh-8rem)]">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Ask Documents</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Document RAG</h1>
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
        <span className="text-xs font-medium">Corpus:</span>
        <StatusBadge status={corpus.status} />
        <span className="text-xs text-muted-foreground">{corpus.indexed_count}/{corpus.total_count} indexed</span>
        <span className="text-xs text-muted-foreground ml-auto">{corpus.readiness_pct}% ready</span>
      </div>

      {messages.length === 0 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button key={q} onClick={() => handleSend(q)} className="rounded-lg border border-border bg-card p-3 text-left text-sm hover:bg-muted/50 transition-colors">
              {q}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 min-h-0 rounded-lg border border-border bg-card overflow-hidden">
        <ChatPanel messages={messages} onSend={handleSend} placeholder="Ask about policy, CBA, or pay practices..." />
      </div>
    </div>
  )
}
