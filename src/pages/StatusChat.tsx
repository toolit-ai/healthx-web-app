import { useState } from 'react'
import StageTracker from '@/components/StageTracker'
import { getProgressSnapshot, getStatusAnswer } from '@/api/mock'

const BUTTONS = [
  { key: 'completed', label: 'What completed?' },
  { key: 'running', label: "What's running now?" },
  { key: 'next', label: "What's next?" },
  { key: 'blockers', label: 'Any blockers?' },
  { key: 'artifacts', label: 'What artifacts are ready?' },
] as const

export default function StatusChat() {
  const progress = getProgressSnapshot()
  const [answers, setAnswers] = useState<Array<{ question: string; answer: string }>>([])

  function ask(type: string) {
    const result = getStatusAnswer(type)
    setAnswers((prev) => [...prev, result])
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Status Chat</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Pipeline Status</h1>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Run ID</p>
          <p className="font-mono text-xs text-muted-foreground">{progress.run_id}</p>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-sm font-medium">Overall Progress</p>
          <p className="text-sm font-semibold">{progress.progress_pct}%</p>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-status-running" style={{ width: `${progress.progress_pct}%` }} />
        </div>
      </div>

      <StageTracker stages={progress.stages} />

      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-xs font-medium text-muted-foreground mb-2">Ask a status question</p>
        <div className="flex flex-wrap gap-2">
          {BUTTONS.map((b) => (
            <button key={b.key} onClick={() => ask(b.key)} className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted">
              {b.label}
            </button>
          ))}
        </div>
        <div className="mt-3 space-y-2">
          {answers.map((a, i) => (
            <div key={i} className="rounded bg-muted p-3 text-sm">
              <p className="font-medium">{a.question}</p>
              <p className="mt-1 text-muted-foreground">{a.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
