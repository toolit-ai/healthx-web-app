import { useState } from 'react'
import StatusBadge from './StatusBadge'
import type { ReviewGate } from '@/types/api'

interface GateCardProps {
  gate: ReviewGate
  onDecision: (reviewId: string, decision: string, notes: string) => void
}

export default function GateCard({ gate, onDecision }: GateCardProps) {
  const [notes, setNotes] = useState('')
  const [confirmCancel, setConfirmCancel] = useState(false)

  const isPending = gate.status === 'pending'

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{gate.gate_name}</h3>
        <StatusBadge status={gate.status} />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">Guards: {gate.guards}</p>
      <p className="mt-2 text-sm leading-relaxed">{gate.details}</p>

      {isPending && (
        <div className="mt-4 space-y-3">
          <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
            This run is paused here until a decision is recorded.
          </div>
          <textarea
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            rows={3}
            placeholder="Notes (required)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <button
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
              disabled={!notes.trim()}
              onClick={() => onDecision(gate.review_id, 'approve', notes)}
            >
              Approve
            </button>
            <button
              className="rounded-md border border-border bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80 disabled:opacity-50"
              disabled={!notes.trim()}
              onClick={() => onDecision(gate.review_id, 'request_rework', notes)}
            >
              Request rework
            </button>
            <button
              className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
              disabled={!notes.trim() || !confirmCancel}
              onClick={() => onDecision(gate.review_id, 'cancel_run', notes)}
            >
              Cancel run
            </button>
          </div>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={confirmCancel}
              onChange={(e) => setConfirmCancel(e.target.checked)}
              className="rounded border-border"
            />
            Confirm cancel run
          </label>
        </div>
      )}

      {gate.status === 'approved' && (
        <div className="mt-4 rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-800">
          Gate approved. Run resumed.
        </div>
      )}
      {gate.status === 'rework_requested' && (
        <div className="mt-4 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
          Rework requested. Pipeline will re-run affected stages.
        </div>
      )}
      {gate.status === 'cancelled' && (
        <div className="mt-4 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-800">
          Run cancelled.
        </div>
      )}
    </div>
  )
}
