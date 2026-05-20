import { useState } from 'react'
import StageTracker from '@/components/StageTracker'
import StatusBadge from '@/components/StatusBadge'
import { getProgressSnapshot, getStatusAnswer } from '@/api/mock'

const BUTTONS = [
  { key: 'running', label: "What's running" },
  { key: 'completed', label: 'What completed' },
  { key: 'blockers', label: 'Any blockers' },
  { key: 'artifacts', label: 'Artifacts ready' },
  { key: 'next', label: "What's next" },
] as const

export default function StatusChat() {
  const progress = getProgressSnapshot()
  const [activeAnswer, setActiveAnswer] = useState<{ question: string; answer: string } | null>(null)

  function ask(type: string) {
    const result = getStatusAnswer(type)
    setActiveAnswer(result)
  }

  const runningStages = progress.stages.filter((s) => s.status === 'running')
  const completedStages = progress.stages.filter((s) => s.status === 'completed')

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
      {/* Left: Stage tracker */}
      <div>
        <StageTracker stages={progress.stages} />
      </div>

      {/* Right: Ask + Answer */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Ask card */}
        <div className="card">
          <div className="eyebrow" style={{ marginBottom: 14 }}>
            Ask about status
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {BUTTONS.map((b) => (
              <button
                key={b.key}
                onClick={() => ask(b.key)}
                className="btn ghost"
                style={{ fontSize: 13 }}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Answer card */}
        {activeAnswer && (
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 className="h3" style={{ fontSize: 18, margin: 0 }}>
                {activeAnswer.question}
              </h3>
              <StatusBadge status="ready" />
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--ink-2)', margin: '0 0 16px' }}>
              {activeAnswer.answer}
            </p>
            <div style={{ borderTop: '1px solid var(--line-soft)', paddingTop: 12 }}>
              <div className="eyebrow" style={{ marginBottom: 10 }}>
                Run metadata
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--ink-soft)' }}>Run ID</span>
                  <span className="num" style={{ color: 'var(--ink-2)' }}>{progress.run_id}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--ink-soft)' }}>Overall progress</span>
                  <span className="num" style={{ color: 'var(--ink-2)' }}>{progress.progress_pct}%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--ink-soft)' }}>Stages completed</span>
                  <span className="num" style={{ color: 'var(--ink-2)' }}>{completedStages.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--ink-soft)' }}>Currently running</span>
                  <span className="num" style={{ color: 'var(--ink-2)' }}>{runningStages.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--ink-soft)' }}>Blocked by review</span>
                  <span style={{ color: progress.blocked_by_review ? 'var(--crimson)' : 'var(--jade-deep)' }}>
                    {progress.blocked_by_review ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
