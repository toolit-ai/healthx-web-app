import { cn } from '@/lib/utils'
import type { StageProgress } from '@/types/api'

interface StageTrackerProps {
  stages: StageProgress[]
}

function StageItem({ stage, depth = 0 }: { stage: StageProgress; depth?: number }) {
  const dotClass =
    stage.status === 'completed'
      ? 'bg-status-completed'
      : stage.status === 'running'
        ? 'bg-status-running ring-2 ring-status-running/30'
        : stage.status === 'failed'
          ? 'bg-status-failed'
          : stage.status === 'blocked'
            ? 'bg-status-blocked'
            : 'bg-status-not-started'

  return (
    <div className={cn('flex items-start gap-3', depth > 0 && 'ml-6 mt-2')}>
      <div className={cn('mt-1.5 h-2.5 w-2.5 rounded-full shrink-0', dotClass)} />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className={cn('text-sm font-medium', stage.status === 'not_started' && 'text-muted-foreground')}>
            {stage.name}
          </p>
          <span className="text-xs text-muted-foreground">{stage.progress_pct}%</span>
        </div>
        {stage.progress_pct > 0 && stage.progress_pct < 100 && (
          <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn('h-full rounded-full', stage.status === 'completed' ? 'bg-status-completed' : 'bg-status-running')}
              style={{ width: `${stage.progress_pct}%` }}
            />
          </div>
        )}
        {stage.sub_stages && stage.sub_stages.length > 0 && (
          <div className="mt-1">
            {stage.sub_stages.map((sub) => (
              <StageItem key={sub.stage_id} stage={sub} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function StageTracker({ stages }: StageTrackerProps) {
  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-4">
      {stages.map((stage) => (
        <StageItem key={stage.stage_id} stage={stage} />
      ))}
    </div>
  )
}
