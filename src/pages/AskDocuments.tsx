import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import ChatPanel from '@/components/ChatPanel'
import StatusBadge from '@/components/StatusBadge'
import { askDocumentRAG, getCorpusStatus } from '@/api/client'
import { useActiveRun } from '@/hooks/useActiveRun'
import type { ChatMessage } from '@/types/api'

const SUGGESTED_QUESTIONS = [
  'What does the policy say about meal periods?',
  'Are missed meal breaks compensated?',
  'How is overtime defined?',
  'What are the timekeeping accuracy requirements?',
]

export default function AskDocuments() {
  const { runId } = useActiveRun()
  const [messages, setMessages] = useState<ChatMessage[]>([])

  const corpusQ = useQuery({
    queryKey: ['corpus-status', runId],
    queryFn: () => getCorpusStatus(runId!),
    enabled: !!runId,
  })

  const askMutation = useMutation({
    mutationFn: (question: string) =>
      askDocumentRAG({ run_id: runId!, question }),
    onSuccess: (answer) => {
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
    },
  })

  function handleSend(text: string) {
    if (!runId) return
    setMessages((prev) => [...prev, { role: 'user', content: text }])
    askMutation.mutate(text)
  }

  if (!runId) {
    return (
      <div className="card" style={{ padding: 32 }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>No active run</div>
        <p style={{ color: 'var(--ink-soft)', fontSize: 14, margin: 0 }}>
          Start a run from <strong>Run Setup</strong> to populate this page.
        </p>
      </div>
    )
  }

  const corpus = corpusQ.data
  const ready = corpus?.status === 'ready'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, height: 'calc(100vh - 8rem)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, flex: 1, minHeight: 0 }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 18px',
              background: ready ? 'var(--jade-soft)' : 'var(--bg-soft)',
              borderBottom: '1px solid var(--line-soft)',
            }}
          >
            <StatusBadge status={corpus?.status ?? 'not_started'} />
            <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>
              {corpusQ.isLoading
                ? 'Loading corpus status…'
                : corpus
                  ? `${corpus.indexed_count}/${corpus.total_count} documents indexed (${corpus.readiness_pct}%)`
                  : 'Corpus status unavailable'}
            </span>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ChatPanel
              messages={messages}
              onSend={handleSend}
              placeholder={ready ? 'Ask about policy, CBA, or pay practices…' : 'Corpus not ready yet…'}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
          <div className="card">
            <div className="eyebrow" style={{ marginBottom: 10 }}>Scope</div>
            <p style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--ink-2)', margin: 0 }}>
              Answers are grounded in this run's processed documents only.
            </p>
          </div>

          <div className="card">
            <div className="eyebrow" style={{ marginBottom: 12 }}>Suggested questions</div>
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
                  disabled={!ready || askMutation.isPending}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {askMutation.error ? (
            <div className="card" style={{ fontSize: 12, color: 'oklch(0.45 0.18 25)', fontFamily: 'var(--font-mono)' }}>
              RAG failed: {(askMutation.error as Error).message}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
