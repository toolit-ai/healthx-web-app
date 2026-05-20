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
          ? { ...g, status: decision === 'approve' ? 'approved' : decision === 'request_rework' ? 'rework_requested' : 'cancelled' }
          : g
      )
    )
  }

  const allNotReached = gates.every((g) => g.status === 'not_reached')

  if (allNotReached) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Review Gates</h1>
        <NotReadyState
          reason="No review gates yet."
          prerequisite="Gates appear when the pipeline reaches a checkpoint (BL mapping / report QA)."
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight">Review Gates</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Runs pause indefinitely at a pending gate — there is no auto-timeout. Notes are recorded as the audit trail.
        </p>
      </section>

      <div className="space-y-4">
        {gates.map((gate) => (
          <GateCard key={gate.review_id} gate={gate} onDecision={handleDecision} />
        ))}
      </div>
    </div>
  )
}
