import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: string
  label?: string
  variant?: 'status' | 'severity' | 'qa' | 'confidence' | 'claim'
  count?: number
}

const STATUS_MAP: Record<string, string> = {
  'not_started': 'bg-status-not-started/10 text-status-not-started border-status-not-started/30',
  'running': 'bg-status-running/10 text-status-running border-status-running/30',
  'completed': 'bg-status-completed/10 text-status-completed border-status-completed/30',
  'failed': 'bg-status-failed/10 text-status-failed border-status-failed/30',
  'blocked': 'bg-status-blocked/10 text-status-blocked border-status-blocked/30',
  'partial': 'bg-status-partial/10 text-status-partial border-status-partial/30',
  'waiting': 'bg-status-waiting/10 text-status-waiting border-status-waiting/30',
  'reindexing': 'bg-status-reindexing/10 text-status-reindexing border-status-reindexing/30',
  'pending': 'bg-status-waiting/10 text-status-waiting border-status-waiting/30',
  'approved': 'bg-status-completed/10 text-status-completed border-status-completed/30',
  'rework_requested': 'bg-status-partial/10 text-status-partial border-status-partial/30',
  'cancelled': 'bg-status-failed/10 text-status-failed border-status-failed/30',
  'not_reached': 'bg-status-not-started/10 text-status-not-started border-status-not-started/30',
  'passed': 'bg-status-completed/10 text-status-completed border-status-completed/30',
  'open': 'bg-status-running/10 text-status-running border-status-running/30',
  'waived': 'bg-status-partial/10 text-status-partial border-status-partial/30',
  'resolved': 'bg-status-completed/10 text-status-completed border-status-completed/30',
  'confirmed': 'bg-status-completed/10 text-status-completed border-status-completed/30',
  'dismissed': 'bg-status-not-started/10 text-status-not-started border-status-not-started/30',
  'processing': 'bg-status-running/10 text-status-running border-status-running/30',
  'verified': 'bg-status-completed/10 text-status-completed border-status-completed/30',
  'testable': 'bg-status-completed/10 text-status-completed border-status-completed/30',
  'untestable': 'bg-status-failed/10 text-status-failed border-status-failed/30',
  'generating': 'bg-status-running/10 text-status-running border-status-running/30',
  'high': 'bg-red-50 text-red-600 border-red-200',
  'medium': 'bg-amber-50 text-amber-600 border-amber-200',
  'low': 'bg-emerald-50 text-emerald-600 border-emerald-200',
  'critical': 'bg-red-50 text-red-600 border-red-200',
  'info': 'bg-blue-50 text-blue-600 border-blue-200',
}

export default function StatusBadge({ status, label, variant = 'status', count }: StatusBadgeProps) {
  const normalized = status.toLowerCase().replace(/\s+/g, '_')
  const style = STATUS_MAP[normalized] || STATUS_MAP[variant === 'severity' ? 'info' : 'not_started'] || ''
  const display = label || status

  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold', style)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {display}
      {count !== undefined && <span className="ml-0.5 text-[10px] opacity-70">({count})</span>}
    </span>
  )
}
