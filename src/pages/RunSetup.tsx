import { useState } from 'react'
import { Link } from 'react-router-dom'
import { createRun } from '@/api/mock'

export default function RunSetup() {
  const [dataPath, setDataPath] = useState('')
  const [docsPath, setDocsPath] = useState('')
  const [tenant, setTenant] = useState('default')
  const [user, setUser] = useState('default')
  const [weightsOpen, setWeightsOpen] = useState(false)
  const [weights, setWeights] = useState({ accuracy: 40, compliance: 30, equity: 20, efficiency: 10 })
  const [submitted, setSubmitted] = useState(false)
  const [runId, setRunId] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = createRun({ data_input_path: dataPath, documents_input_path: docsPath, tenant_id: tenant, user_id: user, materiality_weights: weights })
    setRunId(result.run_id)
    setSubmitted(true)
  }

  const totalWeights = Object.values(weights).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Run Setup</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Start a New Analysis</h1>
      </div>

      {submitted ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 space-y-3">
          <p className="text-sm font-medium text-emerald-800">Run created successfully</p>
          <p className="font-mono text-xs text-emerald-700">{runId}</p>
          <div className="flex gap-3">
            <Link to="/status" className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700">View Status</Link>
            <Link to="/" className="rounded-md border border-emerald-300 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100">Back to Home</Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3 rounded-lg border border-border bg-card p-4">
            <label className="block">
              <span className="text-sm font-medium">Data Input Path</span>
              <input required type="text" className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm" placeholder="/path/to/workforce/data" value={dataPath} onChange={(e) => setDataPath(e.target.value)} />
              <span className="text-xs text-muted-foreground">Directory containing CSV/XLSX files</span>
            </label>
            <label className="block">
              <span className="text-sm font-medium">Documents Input Path</span>
              <input required type="text" className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm" placeholder="/path/to/policy/docs" value={docsPath} onChange={(e) => setDocsPath(e.target.value)} />
              <span className="text-xs text-muted-foreground">Directory containing PDF/DOCX/MD/TXT files</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm font-medium">Tenant ID</span>
                <input type="text" className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm" value={tenant} onChange={(e) => setTenant(e.target.value)} />
              </label>
              <label className="block">
                <span className="text-sm font-medium">User ID</span>
                <input type="text" className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm" value={user} onChange={(e) => setUser(e.target.value)} />
              </label>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <button type="button" onClick={() => setWeightsOpen((v) => !v)} className="flex items-center justify-between w-full text-sm font-medium">
              <span>Materiality Weights {totalWeights !== 100 && <span className="text-amber-600 text-xs ml-2">Must sum to 100% (current: {totalWeights}%)</span>}</span>
              <span className="text-muted-foreground">{weightsOpen ? '−' : '+'}</span>
            </button>
            {weightsOpen && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                {Object.entries(weights).map(([key, value]) => (
                  <label key={key} className="block">
                    <span className="text-xs font-medium capitalize">{key}</span>
                    <input type="number" min={0} max={100} className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm" value={value} onChange={(e) => setWeights((w) => ({ ...w, [key]: Number(e.target.value) }))} />
                  </label>
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={totalWeights !== 100} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-40">
            Launch Run
          </button>
        </form>
      )}
    </div>
  )
}
