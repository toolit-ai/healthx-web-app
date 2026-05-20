import { useState } from 'react'
import { getReviewGates } from '@/api/mock'
import GateCard from '@/components/GateCard'
import NotReadyState from '@/components/NotReadyState'
import type { ReviewGate } from '@/types/api'

export default function ReviewGates() {
  const [gates, setGates] = useState<ReviewGate[]>(getReviewGates())

  function handleDecision(reviewId: string, decision: string, _notes: string) {
    setGates((prev) =>
      prev.map((g) =>
        g.review_id === reviewId
          ? {
              ...g,
              status:
                decision === 'approve'
                  ? 'approved'
                  : decision === 'request_rework'
                    ? 'rework_requested'
                    : 'cancelled',
            }
          : g
      )
    )
  }

  const allNotReached = gates.every((g) => g.status === 'not_reached')

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
        <GateCard key={gate.review_id} gate={gate} onDecision={handleDecision} />
      ))}
    </div>
  )
}
