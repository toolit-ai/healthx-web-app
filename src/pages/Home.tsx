import { Link } from 'react-router-dom'
import { getRunStatus, getProgressSnapshot } from '@/api/mock'
import MetricCard from '@/components/MetricCard'
import StageTracker from '@/components/StageTracker'

export default function Home() {
  const status = getRunStatus()
  const progress = getProgressSnapshot()

  const quickActions = [
    { label: 'Start Run', desc: 'Configure a new analysis run', to: '/run-setup' },
    { label: 'View Status', desc: 'Check pipeline progress', to: '/status' },
    { label: 'Ask Documents', desc: 'Query policy and CBA docs', to: '/ask-documents' },
    { label: 'View Reports', desc: 'Download findings reports', to: '/reports' },
  ]

  const phases = [
    { name: 'Run Setup', done: true },
    { name: 'Data Ingestion & DQ', done: true },
    { name: 'Document Intelligence', done: true },
    { name: 'Semantic Mapping', done: true },
    { name: 'BL-EDA', done: false },
    { name: 'Report Generation', done: false },
    { name: 'Export Packaging', done: false },
    { name: 'Complete', done: false },
  ]

  return (
    <div className="space-y-8">
      <section>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">healthx · web app · v1.0.0</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Agentic Workforce Analytics</h1>
        <p className="mt-2 text-muted-foreground">
          Browser-native AAA pipeline for healthcare workforce and pay-practice validation.
        </p>
      </section>

      <section className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Active Run</h2>
          <span className="font-mono text-xs text-muted-foreground">{status.run_id}</span>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-4">
          <MetricCard label="Status" value={status.status} tone={status.status === 'running' ? 'running' : status.status === 'completed' ? 'completed' : 'not_started'} />
          <MetricCard label="Stage" value={status.current_stage} />
          <MetricCard label="Progress" value={`${status.progress_pct}%`} />
          <MetricCard label="Blocked" value={status.blocked_by_review ? 'Yes' : 'No'} tone={status.blocked_by_review ? 'blocked' : 'completed'} />
        </div>
        <div className="mt-4">
          <StageTracker stages={progress.stages} />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold mb-3">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/50"
            >
              <p className="text-sm font-medium">{action.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{action.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold mb-3">Phase Completion</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
          {phases.map((phase, i) => (
            <div
              key={phase.name}
              className={`rounded-md border px-2 py-2 text-center text-xs ${
                phase.done
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-border bg-card text-muted-foreground'
              }`}
            >
              <p className="font-mono text-[10px] opacity-70">{i + 1}</p>
              <p className="mt-0.5 font-medium">{phase.name}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
