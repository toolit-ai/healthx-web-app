import MetricCard from '@/components/MetricCard'
import StatusBadge from '@/components/StatusBadge'
import DataTable from '@/components/DataTable'
import { getReports, getSectionQA } from '@/api/mock'

export default function Reports() {
  const reports = getReports()
  const qa = getSectionQA()

  return (
    <div className="space-y-4">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Reports</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Generated Reports</h1>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {reports.map((r) => (
          <div key={r.report_id} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold capitalize">{r.kind} Report</h2>
              <StatusBadge status={r.status} />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <MetricCard label="Sections" value={r.section_count} />
              <MetricCard label="QA" value={r.qa_status} tone={r.qa_status === 'passed' ? 'completed' : 'failed'} />
              <MetricCard label="Unverified" value={r.unverified_claim_count} tone={r.unverified_claim_count > 0 ? 'medium' : 'completed'} />
            </div>
            {r.generated_at && <p className="mt-2 text-xs text-muted-foreground">Generated: {new Date(r.generated_at).toLocaleString()}</p>}
            <div className="mt-3 flex gap-2">
              <button className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90">Preview</button>
              <button className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted">Download HTML</button>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-xs font-medium text-muted-foreground mb-2">Section QA</p>
        <DataTable columns={[{ key: 'section', header: 'Section' }, { key: 'status', header: 'QA Status' }, { key: 'unverified', header: 'Unverified Claims' }]} data={qa.map((s) => ({ section: s.title, status: s.qa_status, unverified: s.unverified_claims }))} />
      </div>
    </div>
  )
}
