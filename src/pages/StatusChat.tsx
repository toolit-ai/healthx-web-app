import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import StageTracker from '@/components/StageTracker'
import StatusBadge from '@/components/StatusBadge'
import { askStatus, getProgressSnapshot } from '@/api/client'
import { useActiveRun } from '@/hooks/useActiveRun'
import type { StatusChatResponse, StatusQuestionType } from '@/api/client'

const BUTTONS: ReadonlyArray<{ key: StatusQuestionType; label: string }> = [
  { key: 'what_is_running_now', label: "What's running" },
  { key: 'what_completed', label: 'What completed' },
  { key: 'any_blockers', label: 'Any blockers' },
  { key: 'artifacts_ready', label: 'Artifacts ready' },
  { key: 'whats_next', label: "What's next" },
]

type ButtonKey = StatusQuestionType

export default function StatusChat() {
  const { runId } = useActiveRun()
  const [activeAnswer, setActiveAnswer] = useState<StatusChatResponse | null>(null)

  const progressQ = useQuery({
    queryKey: ['progress', runId],
    queryFn: () => getProgressSnapshot(runId!),
    enabled: !!runId,
    refetchInterval: 3000,
  })

  const askMutation = useMutation({
    mutationFn: (qType: ButtonKey) => askStatus({ run_id: runId!, question_type: qType }),
    onSuccess: (resp) => setActiveAnswer(resp),
  })

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

  const progress = progressQ.data
  const runningStages = progress?.stages.filter((s) => s.status === 'running') ?? []
  const completedStages = progress?.stages.filter((s) => s.status === 'completed') ?? []

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
      <div>
        {progressQ.isLoading ? (
          <div className="card" style={{ padding: 22, color: 'var(--ink-soft)', fontSize: 13 }}>
            Loading stage tracker…
          </div>
        ) : progress ? (
          <StageTracker stages={progress.stages} />
        ) : (
          <div className="card" style={{ padding: 22, color: 'var(--ink-soft)', fontSize: 13 }}>
            No progress data yet.
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="card">
          <div className="eyebrow" style={{ marginBottom: 14 }}>Ask about status</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {BUTTONS.map((b) => (
              <button
                key={b.key}
                onClick={() => askMutation.mutate(b.key)}
                className="btn ghost"
                style={{ fontSize: 13 }}
                disabled={askMutation.isPending}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {askMutation.error ? (
          <div className="card" style={{ fontSize: 12, color: 'oklch(0.45 0.18 25)', fontFamily: 'var(--font-mono)' }}>
            Status query failed: {(askMutation.error as Error).message}
          </div>
        ) : null}

        {activeAnswer && (
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 className="h3" style={{ fontSize: 18, margin: 0 }}>{activeAnswer.question}</h3>
              <StatusBadge status="ready" />
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--ink-2)', margin: '0 0 16px' }}>
              {activeAnswer.answer}
            </p>
            {progress && (
              <div style={{ borderTop: '1px solid var(--line-soft)', paddingTop: 12 }}>
                <div className="eyebrow" style={{ marginBottom: 10 }}>Run metadata</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Row k="Run ID" v={progress.run_id} />
                  <Row k="Overall progress" v={`${progress.progress_pct}%`} />
                  <Row k="Stages completed" v={`${completedStages.length}`} />
                  <Row k="Currently running" v={`${runningStages.length}`} />
                  <Row
                    k="Blocked by review"
                    v={progress.blocked_by_review ? 'Yes' : 'No'}
                    color={progress.blocked_by_review ? 'var(--crimson)' : 'var(--jade-deep)'}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function Row({ k, v, color }: { k: string; v: string; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
      <span style={{ color: 'var(--ink-soft)' }}>{k}</span>
      <span className="num" style={{ color: color ?? 'var(--ink-2)' }}>{v}</span>
    </div>
  )
}
