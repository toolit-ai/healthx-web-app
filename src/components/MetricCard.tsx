import { cn } from '@/lib/utils'

interface MetricCardProps {
  label: string
  value: string | number
  delta?: string
  tone?: string | null
}

export default function MetricCard({ label, value, delta, tone }: MetricCardProps) {
  const toneClass =
    tone === 'critical' || tone === 'failed'
      ? 'border-l-red-500'
      : tone === 'high' || tone === 'blocked'
        ? 'border-l-orange-500'
        : tone === 'medium' || tone === 'partial'
          ? 'border-l-amber-500'
          : tone === 'completed' || tone === 'low'
            ? 'border-l-emerald-500'
            : tone === 'running'
              ? 'border-l-blue-500'
              : 'border-l-border'

  return (
    <div className={cn('rounded-lg border border-border bg-card p-4 border-l-4', toneClass)}>
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
      {delta && <p className="mt-0.5 text-xs text-muted-foreground">{delta}</p>}
    </div>
  )
}
