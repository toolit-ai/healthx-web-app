import { useState } from 'react'
import MetricCard from '@/components/MetricCard'
import DataTable from '@/components/DataTable'
import StatusBadge from '@/components/StatusBadge'
import { getFindings, getInsightCards, getScenarios } from '@/api/mock'

const TABS = ['Findings', 'Scenarios', 'Insights'] as const

export default function BLEDAFindings() {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Findings')
  const [filterPractice, setFilterPractice] = useState('All')
  const [filterSeverity, setFilterSeverity] = useState('All')
  const findings = getFindings()
  const insights = getInsightCards()
  const scenarios = getScenarios()

  const practices = ['All', ...Array.from(new Set(findings.map((f) => f.pay_practice)))]
  const severities = ['All', 'critical', 'high', 'medium', 'low']

  const filtered = findings.filter((f) => {
    return (filterPractice === 'All' || f.pay_practice === filterPractice) && (filterSeverity === 'All' || f.severity === filterSeverity)
  })

  const criticalCount = findings.filter((f) => f.severity === 'critical').length
  const highCount = findings.filter((f) => f.severity === 'high').length
  const totalDollarImpact = findings.reduce((sum, f) => sum + f.dollar_impact, 0)

  return (
    <div className="space-y-4">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">BL-EDA Findings</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Findings & Scenarios</h1>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <MetricCard label="Total Findings" value={findings.length} />
        <MetricCard label="Critical" value={criticalCount} tone="critical" />
        <MetricCard label="High" value={highCount} tone="high" />
        <MetricCard label="Dollar Impact" value={`$${(totalDollarImpact / 1000).toFixed(0)}k`} tone="blocked" />
      </div>

      <div className="flex flex-wrap gap-2 border-b border-border pb-2">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-md px-3 py-1.5 text-xs font-medium ${tab === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Findings' && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <select className="rounded-md border border-border bg-background px-3 py-1.5 text-xs" value={filterPractice} onChange={(e) => setFilterPractice(e.target.value)}>
              {practices.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <select className="rounded-md border border-border bg-background px-3 py-1.5 text-xs" value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}>
              {severities.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <DataTable columns={[{ key: 'id', header: 'ID' }, { key: 'practice', header: 'Practice' }, { key: 'severity', header: 'Severity' }, { key: 'title', header: 'Title' }, { key: 'impact', header: 'Impact' }, { key: 'affected', header: 'Affected' }]} data={filtered.map((f) => ({ id: f.finding_id, practice: f.pay_practice, severity: f.severity, title: f.title, impact: `$${f.dollar_impact.toLocaleString()}`, affected: `${f.affected_count} (${f.affected_pct.toFixed(1)}%)` }))} />
        </div>
      )}

      {tab === 'Scenarios' && (
        <div className="grid gap-3 sm:grid-cols-2">
          {scenarios.map((s) => (
            <div key={s.scenario_id} className="rounded-lg border border-border bg-card p-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{s.scenario_id}</p>
              <p className="mt-1 text-sm font-semibold">{s.title}</p>
              <p className="text-xs text-muted-foreground">{s.pay_practice}</p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div className="rounded bg-muted p-2 text-center">
                  <p className="font-medium">${s.cost_impact.toLocaleString()}</p>
                  <p className="text-muted-foreground">Cost</p>
                </div>
                <div className="rounded bg-muted p-2 text-center">
                  <p className="font-medium">{s.hours_impact.toLocaleString()}</p>
                  <p className="text-muted-foreground">Hours</p>
                </div>
                <div className="rounded bg-muted p-2 text-center">
                  <p className="font-medium">{s.employee_impact}</p>
                  <p className="text-muted-foreground">Employees</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'Insights' && (
        <div className="space-y-3">
          {insights.map((ic) => (
            <div key={ic.card_id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <StatusBadge status={ic.severity} variant="severity" />
                <span className="font-mono text-[10px] text-muted-foreground">{ic.card_id}</span>
              </div>
              <p className="mt-2 text-sm font-semibold">{ic.headline}</p>
              <p className="text-sm text-muted-foreground">{ic.body}</p>
              {ic.recommended_action && <p className="mt-2 text-xs bg-muted p-2 rounded">Action: {ic.recommended_action}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
