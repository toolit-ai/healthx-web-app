import { useState } from 'react'
import MetricCard from '@/components/MetricCard'
import DataTable from '@/components/DataTable'
import StatusBadge from '@/components/StatusBadge'
import { getDQIssues, getDQStatus, getTableProfiles, getBivariateProfiles, getWorkforceContext, getRelationships, getCatalog } from '@/api/mock'

const TABS = ['Issues & Resolution', 'Table Profiles', 'Bivariate Analysis', 'Workforce Context', 'Relationships', 'Catalog'] as const

export default function DataAndDQ() {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Issues & Resolution')
  const dqIssues = getDQIssues()
  const dqStatus = getDQStatus()
  const profiles = getTableProfiles()
  const bivariate = getBivariateProfiles()
  const workforce = getWorkforceContext()
  const relationships = getRelationships()
  const catalog = getCatalog()

  return (
    <div className="space-y-4">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Data & DQ</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Data Quality & Profiles</h1>
      </div>

      <div className="grid gap-3 sm:grid-cols-5">
        <MetricCard label="Gate Passed" value={dqStatus.gate_passed ? 'Yes' : 'No'} tone={dqStatus.gate_passed ? 'completed' : 'blocked'} />
        <MetricCard label="Critical" value={dqStatus.critical_count} tone="critical" />
        <MetricCard label="High" value={dqStatus.high_count} tone="high" />
        <MetricCard label="Medium" value={dqStatus.medium_count} tone="medium" />
        <MetricCard label="Waived" value={dqStatus.waived_count} tone="partial" />
      </div>

      <div className="flex flex-wrap gap-2 border-b border-border pb-2">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-md px-3 py-1.5 text-xs font-medium ${tab === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Issues & Resolution' && (
        <div className="space-y-3">
          {dqIssues.map((issue) => (
            <div key={issue.issue_id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={issue.severity} variant="severity" />
                <StatusBadge status={issue.status} />
                <span className="font-mono text-xs text-muted-foreground">{issue.issue_id}</span>
              </div>
              <p className="mt-2 text-sm font-medium">{issue.table_name}.{issue.column_name} — {issue.check_type}</p>
              <p className="text-sm text-muted-foreground">{issue.description}</p>
              <p className="mt-1 text-xs text-muted-foreground">Affected rows: {issue.affected_row_count.toLocaleString()}</p>
              {issue.waive_notes && <p className="mt-2 text-xs bg-muted p-2 rounded">Waived: {issue.waive_notes}</p>}
            </div>
          ))}
        </div>
      )}

      {tab === 'Table Profiles' && (
        <div className="space-y-6">
          {profiles.map((p) => (
            <div key={p.table_name} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-baseline justify-between">
                <h3 className="text-sm font-semibold">{p.table_name}</h3>
                <span className="font-mono text-xs text-muted-foreground">{p.row_count.toLocaleString()} rows · {p.column_count} cols</span>
              </div>
              <DataTable columns={[{ key: 'column', header: 'Column' }, { key: 'type', header: 'Type' }, { key: 'null_rate', header: 'Null %' }, { key: 'unique', header: 'Unique' }, { key: 'mean', header: 'Mean' }, { key: 'std', header: 'Std' }]} data={p.column_profiles.map((c) => ({ column: c.column, type: c.type, null_rate: `${(c.null_rate * 100).toFixed(1)}%`, unique: c.unique_count.toLocaleString(), mean: c.mean?.toFixed(2) ?? '-', std: c.std?.toFixed(2) ?? '-' }))} />
            </div>
          ))}
        </div>
      )}

      {tab === 'Bivariate Analysis' && (
        <div className="space-y-6">
          {bivariate.map((b) => (
            <div key={b.table_name} className="rounded-lg border border-border bg-card p-4 space-y-4">
              <h3 className="text-sm font-semibold">{b.table_name}</h3>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Correlations</p>
                <DataTable columns={[{ key: 'col_a', header: 'A' }, { key: 'col_b', header: 'B' }, { key: 'type', header: 'Type' }, { key: 'value', header: 'Value' }]} data={b.measure_correlations.map((c) => ({ col_a: c.col_a, col_b: c.col_b, type: c.assoc_type, value: c.value.toFixed(3) }))} />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">VIF Scores</p>
                <DataTable columns={[{ key: 'column', header: 'Column' }, { key: 'vif', header: 'VIF' }, { key: 'risk', header: 'Risk' }]} data={b.vif_scores.map((v) => ({ column: v.column, vif: v.vif.toFixed(2), risk: v.risk }))} />
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'Workforce Context' && (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <MetricCard label="Payroll Table" value={workforce.detected_payroll_table} />
            <MetricCard label="Top Codes 80%" value={workforce.top_codes_80pct_threshold} />
            <MetricCard label="Time Grain" value={workforce.time_grain} />
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">Pay Code Concentration</p>
            <DataTable columns={[{ key: 'code', header: 'Code' }, { key: 'hours', header: 'Hours' }, { key: 'pct', header: '%' }]} data={workforce.pay_code_concentration.map((c) => ({ code: c.code, hours: c.hours.toLocaleString(), pct: `${c.pct.toFixed(1)}%` }))} />
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">Segment Health</p>
            <DataTable columns={[{ key: 'segment', header: 'Segment' }, { key: 'score', header: 'DQ Score' }]} data={workforce.segment_health_scores.map((s) => ({ segment: s.segment, score: s.dq_score.toFixed(2) }))} />
          </div>
        </div>
      )}

      {tab === 'Relationships' && (
        <div className="rounded-lg border border-border bg-card p-4">
          <DataTable columns={[{ key: 'a', header: 'Table A' }, { key: 'col_a', header: 'Column A' }, { key: 'b', header: 'Table B' }, { key: 'col_b', header: 'Column B' }, { key: 'type', header: 'Type' }, { key: 'conf', header: 'Conf' }]} data={relationships.map((r) => ({ a: r.table_a, col_a: r.column_a, b: r.table_b, col_b: r.column_b, type: r.relationship_type, conf: r.confidence.toFixed(2) }))} />
        </div>
      )}

      {tab === 'Catalog' && (
        <div className="rounded-lg border border-border bg-card p-4">
          <DataTable columns={[{ key: 'table', header: 'Table' }, { key: 'column', header: 'Column' }, { key: 'type', header: 'Type' }, { key: 'null_rate', header: 'Null %' }, { key: 'uniqueness', header: 'Unique' }, { key: 'semantic', header: 'Semantic' }]} data={catalog.map((c) => ({ table: c.table_name, column: c.column_name, type: c.data_type, null_rate: `${(c.null_rate * 100).toFixed(1)}%`, uniqueness: c.uniqueness.toFixed(2), semantic: c.inferred_semantic_type }))} />
        </div>
      )}
    </div>
  )
}
