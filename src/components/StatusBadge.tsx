import Pill from './Pill'

interface StatusBadgeProps {
  status: string
  label?: string
}

const STATUS_MAP: Record<string, { kind: 'default' | 'ok' | 'warn' | 'err' | 'run' | 'ink'; label: string }> = {
  completed: { kind: 'ok', label: 'Completed' },
  running: { kind: 'run', label: 'Running' },
  failed: { kind: 'err', label: 'Failed' },
  blocked: { kind: 'warn', label: 'Blocked' },
  partial: { kind: 'warn', label: 'Partial' },
  not_started: { kind: 'default', label: 'Not started' },
  waiting_for_review: { kind: 'warn', label: 'Awaiting review' },
  waived: { kind: 'warn', label: 'Waived' },
  resolved: { kind: 'ok', label: 'Resolved' },
  open: { kind: 'err', label: 'Open' },
  extracted: { kind: 'ok', label: 'Extracted' },
  ocr_used: { kind: 'warn', label: 'OCR' },
  verified: { kind: 'ok', label: 'Verified' },
  flagged: { kind: 'warn', label: 'Flagged' },
  high: { kind: 'ok', label: 'High confidence' },
  medium: { kind: 'warn', label: 'Medium confidence' },
  low: { kind: 'err', label: 'Low confidence' },
  critical: { kind: 'err', label: 'Critical' },
  approved: { kind: 'ok', label: 'Approved' },
  rework_requested: { kind: 'warn', label: 'Rework requested' },
  cancelled: { kind: 'err', label: 'Cancelled' },
  not_reached: { kind: 'default', label: 'Not reached' },
  pending: { kind: 'warn', label: 'Pending' },
  processing: { kind: 'run', label: 'Processing' },
  testable: { kind: 'ok', label: 'Testable' },
  untestable: { kind: 'err', label: 'Untestable' },
  generating: { kind: 'run', label: 'Generating' },
  queued: { kind: 'default', label: 'Queued' },
  ready: { kind: 'ok', label: 'Ready' },
  passed: { kind: 'ok', label: 'Passed' },
}

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const normalized = status.toLowerCase().replace(/\s+/g, '_')
  const m = STATUS_MAP[normalized] || { kind: 'default' as const, label: status }
  return <Pill kind={m.kind} dot>{label || m.label}</Pill>
}
