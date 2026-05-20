import { HARNESS_DEFAULT_VERSION } from '@/engine/harness/config.schema'
import { DEFAULT_MODELS, MODEL_PINNED_DATE } from '@/config/models'

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-3xl px-6 py-16">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          healthx · web app · v0.0.1
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Agentic Workforce Analytics
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Browser-native AAA (Autonomous Agentic Arc) pipeline for healthcare workforce and
          pay-practice validation. Bring your own LLM key, point at a folder, run the full
          evidence-backed BL-EDA cycle without leaving the tab.
        </p>

        <section className="mt-10 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Harness
            </p>
            <p className="mt-1 font-mono text-sm">version {HARNESS_DEFAULT_VERSION}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Models pinned
            </p>
            <p className="mt-1 font-mono text-sm">{MODEL_PINNED_DATE}</p>
          </div>
        </section>

        <ul className="mt-6 space-y-2 font-mono text-sm text-muted-foreground">
          <li>· extraction: {DEFAULT_MODELS.extraction}</li>
          <li>· reasoning: {DEFAULT_MODELS.reasoning}</li>
          <li>· classification: {DEFAULT_MODELS.classification}</li>
          <li>· narrative: {DEFAULT_MODELS.narrative}</li>
        </ul>

        <footer className="mt-16 border-t border-border pt-6 text-xs text-muted-foreground">
          Phase 0 bootstrap. Engine, agents, and UI pages land in subsequent phases — see
          {' '}
          <a
            className="underline-offset-4 hover:underline"
            href="https://toolit-ai.github.io/healthx-platform-kb/"
          >
            healthx-platform-kb
          </a>{' '}
          for the architecture and roadmap.
        </footer>
      </main>
    </div>
  )
}
