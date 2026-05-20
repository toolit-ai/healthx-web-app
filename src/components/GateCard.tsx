import { useState } from 'react'
import Pill from './Pill'
import type { ReviewGate } from '@/types/api'

interface GateCardProps {
  gate: ReviewGate
  onDecision: (reviewId: string, decision: string, notes: string) => void
}

export default function GateCard({ gate, onDecision }: GateCardProps) {
  const [notes, setNotes] = useState('')
  const [confirmCancel, setConfirmCancel] = useState(false)

  const isPending = gate.status === 'pending'
  const isApproved = gate.status === 'approved'

  const meta: [string, string][] = [
    ['Flagged rules', '3'],
    ['Low-confidence mappings', '5'],
    ['Decision by', 'm.singh'],
    ['Decision at', '11:04:22'],
  ]

  return (
    <div className="card" style={{ padding: 28, opacity: isPending ? 0.85 : 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>
            {isApproved ? '✓ Decided · approved' : '⏳ Not reached'}
          </div>
          <h2 className="h3" style={{ margin: '0 0 10px' }}>
            {gate.gate_name}
          </h2>
          <p style={{ color: 'var(--ink-soft)', maxWidth: 600, lineHeight: 1.55, margin: 0, fontSize: 14 }}>
            {gate.guards}
          </p>
        </div>
        {isApproved ? (
          <Pill kind="ok" dot>
            Approved
          </Pill>
        ) : (
          <Pill kind="warn" dot>
            Not reached
          </Pill>
        )}
      </div>

      <div
        style={{
          marginTop: 24,
          padding: 18,
          background: 'var(--bg-soft)',
          borderRadius: 10,
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 18,
        }}
      >
        {meta.map(([k, v]) => (
          <div key={k}>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--ink-mute)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              {k}
            </div>
            <div className="num" style={{ fontSize: 14, color: 'var(--ink-2)', marginTop: 6 }}>
              {v}
            </div>
          </div>
        ))}
      </div>

      {isApproved ? (
        <div style={{ marginTop: 20 }}>
          <label className="label">Decision notes</label>
          <div
            style={{
              padding: 14,
              background: 'var(--bg-soft)',
              borderRadius: 8,
              fontSize: 13,
              color: 'var(--ink-2)',
              lineHeight: 1.55,
            }}
          >
            {gate.details}
          </div>
        </div>
      ) : isPending ? (
        <div style={{ marginTop: 20 }}>
          <div
            style={{
              marginBottom: 12,
              padding: '10px 14px',
              background: 'oklch(0.95 0.06 75)',
              borderRadius: 8,
              fontSize: 13,
              color: 'oklch(0.4 0.13 75)',
            }}
          >
            This run is paused here until a decision is recorded.
          </div>
          <textarea
            className="field"
            style={{ minHeight: 80, fontFamily: 'var(--font-sans)' }}
            placeholder="Notes (required)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            <button
              className="btn primary sm"
              disabled={!notes.trim()}
              onClick={() => onDecision(gate.review_id, 'approve', notes)}
            >
              Approve
            </button>
            <button
              className="btn sm"
              disabled={!notes.trim()}
              onClick={() => onDecision(gate.review_id, 'request_rework', notes)}
            >
              Request rework
            </button>
            <button
              className="btn sm"
              disabled={!notes.trim() || !confirmCancel}
              onClick={() => onDecision(gate.review_id, 'cancel_run', notes)}
            >
              Cancel run
            </button>
          </div>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 10,
              fontSize: 12,
              color: 'var(--ink-soft)',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={confirmCancel}
              onChange={(e) => setConfirmCancel(e.target.checked)}
              style={{ accentColor: 'var(--jade)' }}
            />
            Confirm cancel run
          </label>
        </div>
      ) : (
        <div
          style={{
            marginTop: 20,
            padding: 18,
            border: '1px dashed var(--line)',
            borderRadius: 10,
            color: 'var(--ink-mute)',
            fontSize: 13,
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.04em',
          }}
        >
          Actions enabled once BL-EDA execution completes.
        </div>
      )}
    </div>
  )
}
