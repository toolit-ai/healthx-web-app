import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import MetricCard from '@/components/MetricCard'
import SeverityDot from '@/components/SeverityDot'
import Pill from '@/components/Pill'
import {
  getBLEDAEvidence,
  getBLEDAStatus,
  getBLEDAWorkplan,
  getFindings,
  getInsightCards,
  getKeyFactors,
  getKeyVariables,
  getScenarios,
  startBLEDA,
} from '@/api/client'
import { useActiveRun } from '@/hooks/useActiveRun'
import type { BLEDAFinding, InsightCard, KeyFactor, KeyVariables, ScenarioResult } from '@/types/api'

const TABS = ['Findings', 'Scenarios', 'Insights', 'Key Factors', 'Key Variables', 'Plan'] as const

const SEV_COLORS: Record<string, string> = {
  critical: 'oklch(0.45 0.18 25)',
  high: 'oklch(0.6 0.16 50)',
  medium: 'oklch(0.75 0.14 80)',
  low: 'oklch(0.55 0.12 150)',
}

export default function BLEDAFindings() {
  const { runId } = useActiveRun()
  const qc = useQueryClient()
  const [tab, setTab] = useState<(typeof TABS)[number]>('Findings')
  const [sevFilter, setSevFilter] = useState('all')
  const [practiceFilter, setPracticeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [conflictsOnly, setConflictsOnly] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const findingsQ = useQuery({
    queryKey: ['bl-eda-findings', runId],
    queryFn: () => getFindings(runId!),
    enabled: !!runId,
  })
  const scenariosQ = useQuery({
    queryKey: ['bl-eda-scenarios', runId],
    queryFn: () => getScenarios(runId!),
    enabled: !!runId,
  })
  const insightsQ = useQuery({
    queryKey: ['bl-eda-insights', runId],
    queryFn: () => getInsightCards(runId!),
    enabled: !!runId,
  })
  const statusQ = useQuery({
    queryKey: ['bl-eda-status', runId],
    queryFn: () => getBLEDAStatus(runId!),
    enabled: !!runId,
  })
  const keyFactorsQ = useQuery({
    queryKey: ['bl-eda-key-factors', runId],
    queryFn: () => getKeyFactors(runId!),
    enabled: !!runId && tab === 'Key Factors',
  })
  const keyVarsQ = useQuery({
    queryKey: ['bl-eda-key-variables', runId],
    queryFn: () => getKeyVariables(runId!),
    enabled: !!runId && tab === 'Key Variables',
  })
  const workplanQ = useQuery({
    queryKey: ['bl-eda-workplan', runId],
    queryFn: () => getBLEDAWorkplan(runId!),
    enabled: !!runId && tab === 'Plan',
  })

  const startMutation = useMutation({
    mutationFn: () => startBLEDA(runId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bl-eda-findings', runId] })
      qc.invalidateQueries({ queryKey: ['bl-eda-status', runId] })
    },
  })

  if (!runId) {
    return (
      <div className="card" style={{ padding: 32 }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>No active run</div>
        <p style={{ color: 'var(--ink-soft)', fontSize: 14, margin: 0 }}>
          Start a run from <strong>Run Setup</strong> to populate this page.
        </p>
      </div>
    )
  }

  const findings: BLEDAFinding[] = findingsQ.data?.findings ?? []
  const scenarios: ScenarioResult[] = scenariosQ.data?.scenarios ?? []
  const insights: InsightCard[] = insightsQ.data?.insight_cards ?? []

  const practices = useMemo(() => {
    const set = new Set<string>()
    for (const f of findings) set.add(f.pay_practice)
    return Array.from(set).sort()
  }, [findings])

  const filtered = useMemo(() => {
    return findings.filter((f) => {
      if (sevFilter !== 'all' && f.severity !== sevFilter) return false
      if (practiceFilter !== 'all' && f.pay_practice !== practiceFilter) return false
      if (statusFilter !== 'all' && f.status !== statusFilter) return false
      if (conflictsOnly && !f.rule_conflict) return false
      return true
    })
  }, [findings, sevFilter, practiceFilter, statusFilter, conflictsOnly])

  const counts = useMemo(() => {
    const c = { critical: 0, high: 0, medium: 0, low: 0, info: 0 }
    for (const f of findings) {
      if (f.severity in c) c[f.severity as keyof typeof c]++
    }
    return c
  }, [findings])

  const practiceStats = useMemo(() => {
    const map = new Map<string, number>()
    for (const f of findings) {
      map.set(f.pay_practice, (map.get(f.pay_practice) ?? 0) + 1)
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1])
  }, [findings])

  const topImpactFindings = useMemo(() =>
    [...findings]
      .filter((f) => (f.dollar_impact ?? 0) > 0)
      .sort((a, b) => b.dollar_impact - a.dollar_impact)
      .slice(0, 5),
    [findings],
  )

  const practiceBySev = useMemo(() => {
    const map = new Map<string, { critical: number; high: number; medium: number; low: number }>()
    for (const f of findings) {
      if (!map.has(f.pay_practice)) {
        map.set(f.pay_practice, { critical: 0, high: 0, medium: 0, low: 0 })
      }
      const entry = map.get(f.pay_practice)!
      if (f.severity === 'critical') entry.critical++
      else if (f.severity === 'high') entry.high++
      else if (f.severity === 'medium') entry.medium++
      else if (f.severity === 'low') entry.low++
    }
    return Array.from(map.entries())
      .sort((a, b) => {
        const ta = a[1].critical + a[1].high + a[1].medium + a[1].low
        const tb = b[1].critical + b[1].high + b[1].medium + b[1].low
        return tb - ta
      })
      .map(([practice, counts]) => ({ practice, ...counts }))
  }, [findings])

  const scenarioGroups = useMemo(() => {
    const acc: Record<string, ScenarioResult[]> = {}
    for (const s of scenarios) {
      acc[s.pay_practice] = acc[s.pay_practice] ?? []
      acc[s.pay_practice].push(s)
    }
    return acc
  }, [scenarios])

  return (
    <div>
      <BLEDABanner
        runId={runId}
        loading={findingsQ.isLoading || statusQ.isLoading}
        eventCount={statusQ.data?.event_count}
        findingCount={findings.length}
        onStart={() => startMutation.mutate()}
        starting={startMutation.isPending}
        startError={startMutation.error}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <MetricCard label="Findings" value={`${findings.length}`} sub={findingsQ.isLoading ? 'loading…' : 'persisted'} />
        <MetricCard label="Critical" value={`${counts.critical}`} sub="severity" accent="var(--crimson)" />
        <MetricCard label="High" value={`${counts.high}`} sub="severity" accent="var(--terra)" />
        <MetricCard label="Practices" value={`${practiceStats.length}`} sub="touched" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 24 }}>
        <div>
          <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--line)', flexWrap: 'wrap' }}>
            {TABS.map((t) => {
              const active = tab === t
              return (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    padding: '10px 16px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '2px solid ' + (active ? 'var(--ink)' : 'transparent'),
                    color: active ? 'var(--ink)' : 'var(--ink-soft)',
                    fontWeight: active ? 500 : 400,
                    fontSize: 13.5,
                    marginBottom: -1,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {t}
                </button>
              )
            })}
          </div>

          {tab === 'Findings' && topImpactFindings.length > 0 && (
            <div className="card" style={{ padding: 16, marginBottom: 20 }}>
              <div className="eyebrow" style={{ marginBottom: 10 }}>Top findings by $ exposure</div>
              <ResponsiveContainer width="100%" height={topImpactFindings.length * 36 + 20}>
                <BarChart
                  layout="vertical"
                  data={topImpactFindings.map((f) => ({
                    title: f.title.length > 45 ? f.title.slice(0, 45) + '…' : f.title,
                    impact: f.dollar_impact,
                    severity: f.severity,
                  }))}
                  margin={{ left: 0, right: 80, top: 0, bottom: 0 }}
                >
                  <XAxis type="number" tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: 'var(--ink-mute)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(Number(v) / 1000).toFixed(0)}K`} />
                  <YAxis type="category" dataKey="title" width={220} tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: 'var(--ink-soft)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, fontFamily: 'var(--font-mono)' }} formatter={(v) => [`$${Number(v).toLocaleString()}`, 'Exposure']} />
                  <Bar dataKey="impact" radius={[0, 3, 3, 0]}>
                    {topImpactFindings.map((f, i) => (
                      <Cell key={i} fill={SEV_COLORS[f.severity] ?? 'var(--brand)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          {tab === 'Findings' && (
            <FindingsTab
              runId={runId}
              loading={findingsQ.isLoading}
              findings={filtered}
              practices={practices}
              sevFilter={sevFilter}
              practiceFilter={practiceFilter}
              statusFilter={statusFilter}
              conflictsOnly={conflictsOnly}
              onSevFilter={setSevFilter}
              onPracticeFilter={setPracticeFilter}
              onStatusFilter={setStatusFilter}
              onConflictsOnly={setConflictsOnly}
              expandedId={expandedId}
              onExpand={setExpandedId}
            />
          )}

          {tab === 'Scenarios' && <ScenariosTab loading={scenariosQ.isLoading} groups={scenarioGroups} />}
          {tab === 'Insights' && <InsightsTab loading={insightsQ.isLoading} insights={insights} />}
          {tab === 'Key Factors' && <KeyFactorsTab loading={keyFactorsQ.isLoading} factors={keyFactorsQ.data?.factors ?? []} />}
          {tab === 'Key Variables' && <KeyVariablesTab loading={keyVarsQ.isLoading} vars={keyVarsQ.data ?? null} />}
          {tab === 'Plan' && <PlanTab loading={workplanQ.isLoading} plan={workplanQ.data ?? null} />}
        </div>

        <div
          className="card"
          style={{ padding: 22, alignSelf: 'flex-start', position: 'sticky', top: 100 }}
        >
          <div className="eyebrow" style={{ marginBottom: 14 }}>
            <span className="dot" />
            Per-practice findings
          </div>
          {practiceStats.length === 0 ? (
            <div style={{ color: 'var(--ink-soft)', fontSize: 13 }}>No practices yet.</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={Math.max(60, practiceBySev.length * 24)}>
                <BarChart layout="vertical" data={practiceBySev} margin={{ left: 0, right: 8, top: 0, bottom: 0 }}>
                  <XAxis type="number" tick={{ fontSize: 9, fontFamily: 'var(--font-mono)', fill: 'var(--ink-mute)' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="practice" width={90} tick={{ fontSize: 9, fontFamily: 'var(--font-mono)', fill: 'var(--ink-soft)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 11, fontFamily: 'var(--font-mono)' }} />
                  <Bar dataKey="critical" stackId="a" fill={SEV_COLORS.critical} />
                  <Bar dataKey="high" stackId="a" fill={SEV_COLORS.high} />
                  <Bar dataKey="medium" stackId="a" fill={SEV_COLORS.medium} />
                  <Bar dataKey="low" stackId="a" fill={SEV_COLORS.low} radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
                {practiceStats.map(([name, count]) => (
                  <div
                    key={name}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8 }}
                  >
                    <span style={{ flex: 1, fontSize: 13, color: 'var(--ink-2)' }}>{name}</span>
                    <span className="num" style={{ fontSize: 11, color: 'var(--ink-mute)' }}>{count}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function BLEDABanner({
  runId,
  loading,
  eventCount,
  findingCount,
  onStart,
  starting,
  startError,
}: {
  runId: string
  loading: boolean
  eventCount: number | undefined
  findingCount: number
  onStart: () => void
  starting: boolean
  startError: unknown
}) {
  return (
    <div
      style={{
        padding: '16px 24px',
        background: 'linear-gradient(90deg, oklch(0.94 0.05 260), var(--bg-card))',
        border: '1px solid oklch(0.85 0.05 260)',
        borderRadius: 12,
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>
          BL-EDA · run {runId}
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 2 }}>
          {loading ? 'Loading…' : `${findingCount} findings · ${eventCount ?? 0} events`}
        </div>
      </div>
      <button className="btn primary sm" disabled={starting} onClick={onStart}>
        {starting ? 'Starting BL-EDA…' : '▶ Start BL-EDA'}
      </button>
      {startError ? (
        <span style={{ fontSize: 12, color: 'oklch(0.45 0.18 25)' }}>
          {(startError as Error).message}
        </span>
      ) : null}
    </div>
  )
}

function FindingsTab({
  runId,
  loading,
  findings,
  practices,
  sevFilter,
  practiceFilter,
  statusFilter,
  conflictsOnly,
  onSevFilter,
  onPracticeFilter,
  onStatusFilter,
  onConflictsOnly,
  expandedId,
  onExpand,
}: {
  runId: string
  loading: boolean
  findings: BLEDAFinding[]
  practices: string[]
  sevFilter: string
  practiceFilter: string
  statusFilter: string
  conflictsOnly: boolean
  onSevFilter: (s: string) => void
  onPracticeFilter: (s: string) => void
  onStatusFilter: (s: string) => void
  onConflictsOnly: (v: boolean) => void
  expandedId: string | null
  onExpand: (id: string | null) => void
}) {
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        <span className="eyebrow" style={{ marginRight: 4 }}>Severity</span>
        {['all', 'critical', 'high', 'medium', 'low'].map((s) => (
          <button
            key={s}
            onClick={() => onSevFilter(s)}
            className="btn sm"
            style={{
              background: sevFilter === s ? 'var(--ink)' : 'transparent',
              color: sevFilter === s ? 'var(--bg)' : 'var(--ink-2)',
              borderColor: sevFilter === s ? 'var(--ink)' : 'var(--line)',
              textTransform: 'capitalize',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        <span className="eyebrow" style={{ marginRight: 4 }}>Practice</span>
        <select
          value={practiceFilter}
          onChange={(e) => onPracticeFilter(e.target.value)}
          style={{
            fontSize: 12.5,
            padding: '4px 8px',
            border: '1px solid var(--line)',
            borderRadius: 6,
            background: 'var(--bg-card)',
            color: 'var(--ink-2)',
            fontFamily: 'var(--font-sans)',
          }}
        >
          <option value="all">All practices</option>
          {practices.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>

        <span className="eyebrow" style={{ marginLeft: 8 }}>Status</span>
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilter(e.target.value)}
          style={{
            fontSize: 12.5,
            padding: '4px 8px',
            border: '1px solid var(--line)',
            borderRadius: 6,
            background: 'var(--bg-card)',
            color: 'var(--ink-2)',
            fontFamily: 'var(--font-sans)',
          }}
        >
          {['all', 'pass', 'warning', 'fail', 'skipped'].map((s) => (
            <option key={s} value={s}>{s === 'all' ? 'All statuses' : s}</option>
          ))}
        </select>

        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--ink-2)', marginLeft: 8, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={conflictsOnly}
            onChange={(e) => onConflictsOnly(e.target.checked)}
          />
          Rule conflicts only
        </label>
      </div>

      {loading ? (
        <div className="card" style={{ padding: 22, color: 'var(--ink-soft)', fontSize: 13 }}>Loading findings…</div>
      ) : findings.length === 0 ? (
        <div className="card" style={{ padding: 22, color: 'var(--ink-soft)', fontSize: 13 }}>
          No findings yet. Click ▶ Start BL-EDA to run the analysis (or wait for it to complete).
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {findings.map((f) => (
            <FindingRow
              key={f.finding_id}
              runId={runId}
              f={f}
              open={expandedId === f.finding_id}
              onToggle={() => onExpand(expandedId === f.finding_id ? null : f.finding_id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function FindingRow({
  runId,
  f,
  open,
  onToggle,
}: {
  runId: string
  f: BLEDAFinding
  open: boolean
  onToggle: () => void
}) {
  const [evidenceOpen, setEvidenceOpen] = useState(false)
  const evidenceQ = useQuery({
    queryKey: ['bl-eda-evidence', runId, f.finding_id],
    queryFn: () => getBLEDAEvidence(runId, f.finding_id),
    enabled: evidenceOpen,
  })

  return (
    <div
      className="card"
      style={{
        padding: 0,
        overflow: 'hidden',
        borderColor: open ? 'var(--line)' : 'var(--line-soft)',
        borderLeft: f.rule_conflict ? '3px solid var(--crimson, oklch(0.55 0.22 25))' : undefined,
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          padding: '18px 22px',
          background: 'transparent',
          border: 'none',
          textAlign: 'left',
          cursor: 'pointer',
          fontFamily: 'var(--font-sans)',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'flex-start' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
              <SeverityDot sev={f.severity} />
              <Pill kind="ink">{f.pay_practice}</Pill>
              <span className="num" style={{ color: 'var(--ink-mute)', fontSize: 11 }}>{f.finding_id}</span>
              {f.rule_conflict && (
                <span style={{ fontSize: 11, color: 'oklch(0.45 0.18 25)', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
                  ⚠ rule conflict
                </span>
              )}
            </div>
            <div style={{ fontSize: 14.5, color: 'var(--ink)', lineHeight: 1.45, fontWeight: 500 }}>
              {f.title}
            </div>
            <div style={{ display: 'flex', gap: 22, marginTop: 12, fontSize: 12, color: 'var(--ink-soft)' }}>
              <span><b style={{ color: 'var(--ink-2)' }} className="num">{f.affected_count?.toLocaleString() ?? '—'}</b> affected</span>
              <span><b style={{ color: 'var(--ink-2)' }} className="num">{f.hours_impact?.toLocaleString() ?? '—'}</b> hrs</span>
              <span><b style={{ color: 'var(--terra)' }} className="num">${f.dollar_impact?.toLocaleString() ?? '—'}</b> exposure</span>
            </div>
          </div>
          <span style={{ color: 'var(--ink-mute)', fontSize: 14, paddingTop: 8 }}>{open ? '▾' : '▸'}</span>
        </div>
      </button>
      {open && (
        <div
          style={{
            padding: '0 22px 22px',
            borderTop: '1px solid var(--line-soft)',
            paddingTop: 18,
            background: 'var(--bg-soft)',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Finding</div>
              <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.55, margin: 0 }}>{f.finding}</p>
              {f.recommended_action ? (
                <>
                  <div className="eyebrow" style={{ marginTop: 14, marginBottom: 6 }}>Recommended action</div>
                  <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.55, margin: 0 }}>{f.recommended_action}</p>
                </>
              ) : null}
              {f.rule_conflict && f.rule_conflict_priority && (
                <div style={{ marginTop: 14, padding: '8px 12px', background: 'oklch(0.97 0.04 25)', borderRadius: 6, borderLeft: '3px solid oklch(0.55 0.22 25)', fontSize: 12, color: 'oklch(0.4 0.16 25)' }}>
                  Rule conflict — priority: {f.rule_conflict_priority}
                </div>
              )}
            </div>
            <div>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Source rules</div>
              <div className="num" style={{ fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.9 }}>
                {f.source_rule_ids.length > 0 ? f.source_rule_ids.map((r) => `↳ ${r}`).join('\n') : '—'}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 16, borderTop: '1px solid var(--line-soft)', paddingTop: 14 }}>
            <button
              className="btn sm"
              onClick={() => setEvidenceOpen(!evidenceOpen)}
              style={{ marginBottom: evidenceOpen ? 12 : 0 }}
            >
              {evidenceOpen ? 'Hide evidence' : 'Load evidence'}
            </button>
            {evidenceOpen && (
              <div>
                {evidenceQ.isLoading ? (
                  <div style={{ color: 'var(--ink-soft)', fontSize: 12 }}>Loading evidence…</div>
                ) : evidenceQ.error ? (
                  <div style={{ color: 'oklch(0.45 0.18 25)', fontSize: 12 }}>No evidence available.</div>
                ) : Array.isArray(evidenceQ.data) ? (
                  <table className="hx" style={{ fontSize: 12 }}>
                    <thead>
                      <tr>
                        {Object.keys((evidenceQ.data as Record<string, unknown>[])[0] ?? {}).map((k) => (
                          <th key={k}>{k}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(evidenceQ.data as Record<string, unknown>[]).slice(0, 20).map((row, i) => (
                        <tr key={i}>
                          {Object.values(row).map((v, j) => (
                            <td key={j} className="num">{String(v ?? '—')}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <pre style={{ fontSize: 11, color: 'var(--ink-2)', overflowX: 'auto', background: 'var(--bg-card)', padding: 12, borderRadius: 6, margin: 0 }}>
                    {JSON.stringify(evidenceQ.data, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function ScenariosTab({
  loading,
  groups,
}: {
  loading: boolean
  groups: Record<string, ScenarioResult[]>
}) {
  if (loading) return <div className="card" style={{ padding: 22, color: 'var(--ink-soft)', fontSize: 13 }}>Loading…</div>
  const entries = Object.entries(groups)
  if (entries.length === 0) {
    return (
      <div className="card" style={{ padding: 22, color: 'var(--ink-soft)', fontSize: 13 }}>
        No scenarios available.
      </div>
    )
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {entries.map(([practice, items]) => (
        <div key={practice} className="card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
            <h3 className="h3" style={{ margin: 0 }}>{practice}</h3>
            <Pill>What-if scenarios</Pill>
          </div>
          <table className="hx">
            <thead>
              <tr>
                <th>Scenario</th>
                <th>Cost Δ</th>
                <th>Hours Δ</th>
                <th>Employees Δ</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.scenario_id}>
                  <td style={{ color: 'var(--ink)' }}>{s.title}</td>
                  <td className="num" style={{ color: s.cost_impact < 0 ? 'var(--jade-deep)' : 'var(--ink-2)' }}>
                    {fmtCost(s.cost_impact)}
                  </td>
                  <td className="num">{fmtNum(s.hours_impact)}</td>
                  <td className="num">{fmtNum(s.employee_impact)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}

function InsightsTab({ loading, insights }: { loading: boolean; insights: InsightCard[] }) {
  if (loading) return <div className="card" style={{ padding: 22, color: 'var(--ink-soft)', fontSize: 13 }}>Loading insights…</div>
  if (insights.length === 0) {
    return (
      <div className="card" style={{ padding: 22, color: 'var(--ink-soft)', fontSize: 13 }}>
        No insight cards yet.
      </div>
    )
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {insights.map((c) => (
        <div key={c.card_id} className="card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
            <SeverityDot sev={c.severity} />
            <Pill kind="ink">{c.pay_practice}</Pill>
          </div>
          <h3 className="h3" style={{ margin: '0 0 8px', fontSize: 16 }}>{c.headline}</h3>
          <p style={{ margin: 0, fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.55 }}>{c.body}</p>
          {c.recommended_action && (
            <div style={{ marginTop: 10, fontSize: 12, color: 'var(--jade-deep)', fontStyle: 'italic' }}>
              → {c.recommended_action}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function KeyFactorsTab({ loading, factors }: { loading: boolean; factors: KeyFactor[] }) {
  if (loading) return <div className="card" style={{ padding: 22, color: 'var(--ink-soft)', fontSize: 13 }}>Loading key factors…</div>
  if (factors.length === 0) {
    return <div className="card" style={{ padding: 22, color: 'var(--ink-soft)', fontSize: 13 }}>No key factors computed yet.</div>
  }
  const chartData = [...factors]
    .sort((a, b) => b.effect_size - a.effect_size)
    .slice(0, 10)
    .map((f) => ({
      label: `${f.dimension ?? '?'} → ${f.measure}`,
      effect: f.effect_size,
      direction: f.direction,
    }))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card" style={{ padding: 22 }}>
        <div className="eyebrow" style={{ marginBottom: 14 }}>Top 10 by effect size</div>
        <ResponsiveContainer width="100%" height={Math.max(80, chartData.length * 32)}>
          <BarChart layout="vertical" data={chartData} margin={{ left: 0, right: 24, top: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--line-soft)" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: 'var(--ink-mute)' }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="label" width={180} tick={{ fontSize: 9, fontFamily: 'var(--font-mono)', fill: 'var(--ink-soft)' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, fontFamily: 'var(--font-mono)' }} formatter={(v) => [Number(v).toFixed(3), 'Effect size']} />
            <Bar dataKey="effect" radius={[0, 3, 3, 0]}>
              {chartData.map((d, i) => (
                <Cell key={i} fill={d.direction === 'increasing' || d.direction === 'positive' ? 'oklch(0.55 0.12 150)' : 'oklch(0.45 0.18 25)'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="hx">
          <thead>
            <tr>
              <th>Factor type</th>
              <th>Measure</th>
              <th>Dimension</th>
              <th>Effect size</th>
              <th>Direction</th>
              <th>Tier</th>
              <th>Practice</th>
            </tr>
          </thead>
          <tbody>
            {factors.map((f) => (
              <tr key={f.factor_id}>
                <td><Pill>{f.factor_type}</Pill></td>
                <td className="num">{f.measure}</td>
                <td className="num" style={{ color: 'var(--ink-soft)' }}>{f.dimension ?? '—'}</td>
                <td className="num">{f.effect_size?.toFixed(3)}</td>
                <td style={{ color: f.direction === 'decreasing' ? 'var(--terra)' : 'var(--jade-deep)', fontSize: 12 }}>{f.direction}</td>
                <td className="num" style={{ color: 'var(--ink-soft)' }}>{f.tier}</td>
                <td><Pill kind="ink">{f.pay_practice}</Pill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function KeyVariablesTab({ loading, vars }: { loading: boolean; vars: KeyVariables | null }) {
  if (loading) return <div className="card" style={{ padding: 22, color: 'var(--ink-soft)', fontSize: 13 }}>Loading key variables…</div>
  if (!vars) return <div className="card" style={{ padding: 22, color: 'var(--ink-soft)', fontSize: 13 }}>No key variables yet.</div>

  const groups: Array<{ label: string; items: string[] }> = [
    { label: 'Measures', items: vars.measures ?? [] },
    { label: 'Dimensions', items: vars.dimensions ?? [] },
    { label: 'Time columns', items: vars.time_columns ?? [] },
    { label: 'Entity keys', items: vars.entity_keys ?? [] },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      {groups.map(({ label, items }) => (
        <div key={label} className="card" style={{ padding: 20 }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>{label}</div>
          {items.length === 0 ? (
            <div style={{ color: 'var(--ink-soft)', fontSize: 13 }}>None detected.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {items.map((v) => (
                <div key={v} className="num" style={{ fontSize: 13, color: 'var(--ink-2)', padding: '4px 0', borderBottom: '1px solid var(--line-soft)' }}>
                  {v}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function PlanTab({ loading, plan }: { loading: boolean; plan: Record<string, unknown> | null }) {
  if (loading) return <div className="card" style={{ padding: 22, color: 'var(--ink-soft)', fontSize: 13 }}>Loading workplan…</div>
  if (!plan) return <div className="card" style={{ padding: 22, color: 'var(--ink-soft)', fontSize: 13 }}>No BL-EDA workplan yet.</div>
  return (
    <div className="card" style={{ padding: 22 }}>
      <div className="eyebrow" style={{ marginBottom: 12 }}>BL-EDA Workplan</div>
      <pre style={{ fontSize: 11.5, color: 'var(--ink-2)', overflowX: 'auto', margin: 0, lineHeight: 1.6 }}>
        {JSON.stringify(plan, null, 2)}
      </pre>
    </div>
  )
}

function fmtCost(n: number): string {
  if (n === 0) return '$0'
  const sign = n < 0 ? '−' : '+'
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2).replace(/\.00$/, '')}M`
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(0)}K`
  return `${sign}$${abs.toLocaleString()}`
}

function fmtNum(n: number): string {
  if (n === 0) return '0'
  const sign = n < 0 ? '−' : '+'
  return `${sign}${Math.abs(n).toLocaleString()}`
}
