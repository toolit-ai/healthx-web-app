import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getReviewGates, submitReviewDecision } from '@/api/client'
import GateCard from '@/components/GateCard'
import NotReadyState from '@/components/NotReadyState'
import { useActiveRun } from '@/hooks/useActiveRun'
import type { ReviewGate } from '@/types/api'

export default function ReviewGates() {
  const { runId } = useActiveRun()
  const qc = useQueryClient()

  const gatesQ = useQuery({
    queryKey: ['review-gates', runId],
    queryFn: () => getReviewGates(runId!),
    enabled: !!runId,
  })

  const decisionMutation = useMutation({
    mutationFn: ({ reviewId, decision, notes }: { reviewId: string; decision: string; notes: string }) =>
      submitReviewDecision(runId!, reviewId, {
        decision: decision as 'approve' | 'request_rework' | 'cancel',
        notes,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['review-gates', runId] })
    },
  })

  if (!runId) {
    return (
      <NotReadyState reason="No active run." prerequisite="Start a run from Run Setup." />
    )
  }

  const gates: ReviewGate[] = gatesQ.data ?? []
  const allNotReached = gates.length === 0 || gates.every((g) => g.status === 'not_reached')

  if (gatesQ.isLoading) {
    return <NotReadyState reason="Loading gates…" prerequisite="" />
  }

  if (allNotReached) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 920 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 6 }}>Review Gates</div>
          <h2 className="h3" style={{ margin: 0 }}>Human-in-the-loop checkpoints</h2>
        </div>
        <NotReadyState
          reason="No review gates yet."
          prerequisite="Gates appear when the pipeline reaches a checkpoint (BL mapping / report QA)."
        />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 920 }}>
      <div>
        <div className="eyebrow" style={{ marginBottom: 6 }}>Review Gates</div>
        <h2 className="h3" style={{ margin: 0 }}>Human-in-the-loop checkpoints</h2>
        <p style={{ color: 'var(--ink-soft)', fontSize: 14, margin: '8px 0 0', lineHeight: 1.55 }}>
          Runs pause indefinitely at a pending gate — there is no auto-timeout. Notes are recorded as the audit trail.
        </p>
      </div>

      {gates.map((gate) => (
        <GateCard
          key={gate.review_id}
          gate={gate}
          onDecision={(reviewId, decision, notes) =>
            decisionMutation.mutate({ reviewId, decision, notes })
          }
        />
      ))}

      {decisionMutation.error ? (
        <div style={{ fontSize: 12, color: 'oklch(0.45 0.18 25)', fontFamily: 'var(--font-mono)' }}>
          Decision failed: {(decisionMutation.error as Error).message}
        </div>
      ) : null}
    </div>
  )
}
