import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import MetricCard from '@/components/MetricCard'
import StatusBadge from '@/components/StatusBadge'
import SeverityDot from '@/components/SeverityDot'
import Pill from '@/components/Pill'
import {
  getBivariate,
  getCatalog,
  getDQIssues,
  getDQStatus,
  getRelationships,
  getTableProfiles,
  getWorkforceContext,
  rerunDQTable,
  waiveDQIssue,
} from '@/api/client'
import { useActiveRun } from '@/hooks/useActiveRun'
import type {
  BivariateProfile,
  CatalogEntry,
  ColumnProfile,
  DQIssue,
  RelationshipIssue,
  TableProfile,
} from '@/types/api'

const TABS = [
  { id: 'issues', label: 'Issues & resolution' },
  { id: 'profiles', label: 'Table profiles' },
  { id: 'bivar', label: 'Bivariate analysis' },
  { id: 'workforce', label: 'Workforce context' },
  { id: 'rels', label: 'Relationships' },
  { id: 'catalog', label: 'Catalog' },
] as const

export default function DataAndDQ() {
  const { runId } = useActiveRun()
  const [tab, setTab] = useState<string>('issues')

  if (!runId) return <NoRun />

  return (
    <div>
      <DQBanner runId={runId} />
      <TabBar value={tab} onChange={setTab} tabs={TABS} />
      {tab === 'issues' && <DQIssues runId={runId} />}
      {tab === 'profiles' && <TableProfiles runId={runId} />}
      {tab === 'bivar' && <BivariateAnalysis runId={runId} />}
      {tab === 'workforce' && <WorkforceContext runId={runId} />}
      {tab === 'rels' && <Relationships runId={runId} />}
      {tab === 'catalog' && <Catalog runId={runId} />}
    </div>
  )
}

function NoRun() {
  return (
    <div className="card" style={{ padding: 32 }}>
      <div className="eyebrow" style={{ marginBottom: 10 }}>
        No active run
      </div>
      <p style={{ color: 'var(--ink-soft)', fontSize: 14, margin: 0 }}>
        Start a run from <strong>Run Setup</strong> to populate this page.
      </p>
    </div>
  )
}

function DQBanner({ runId }: { runId: string }) {
  const q = useQuery({ queryKey: ['dq-status', runId], queryFn: () => getDQStatus(runId) })
  const gateClear = !!q.data?.gate_passed
  const counts = q.data ?? { waived_count: 0, critical_count: 0, high_count: 0, medium_count: 0 }
  return (
    <div
      style={{
        padding: '16px 24px',
        background: gateClear ? 'var(--jade-soft)' : 'oklch(0.95 0.06 75)',
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        marginBottom: 20,
      }}
    >
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: gateClear ? 'var(--jade-deep)' : 'oklch(0.45 0.13 75)',
        }}
      />
      <span
        style={{
          fontSize: 14,
          fontWeight: 500,
          color: gateClear ? 'var(--jade-deep)' : 'oklch(0.45 0.13 75)',
        }}
      >
        {q.isLoading ? 'BL-EDA gate: …' : `BL-EDA gate: ${gateClear ? 'CLEAR' : 'BLOCKED'}`}
      </span>
      <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
        {counts.critical_count} critical · {counts.high_count} high · {counts.medium_count} medium ·{' '}
        {counts.waived_count} waived.
      </span>
    </div>
  )
}

function TabBar({
  value,
  onChange,
  tabs,
}: {
  value: string
  onChange: (id: string) => void
  tabs: readonly { id: string; label: string }[]
}) {
  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--line)' }}>
      {tabs.map((t) => {
        const active = value === t.id
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
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
            }}
          >
            {t.label}
          </button>
        )
      })}
    </div>
  )
}

const SEV_ORDER = ['critical', 'high', 'medium', 'low'] as const
const SEV_COLORS: Record<string, string> = {
  critical: 'oklch(0.45 0.18 25)',
  high: 'oklch(0.6 0.16 50)',
  medium: 'oklch(0.75 0.14 80)',
  low: 'oklch(0.55 0.12 150)',
}

function DQIssues({ runId }: { runId: string }) {
  const q = useQuery({ queryKey: ['dq-issues', runId], queryFn: () => getDQIssues(runId) })
  const [exp, setExp] = useState<string | null>(null)
  const [sevFilter, setSevFilter] = useState<string[]>(['critical', 'high'])
  const issues: DQIssue[] = q.data ?? []
  const filtered = issues.filter((i) => sevFilter.includes(i.severity))

  function toggleSev(sev: string) {
    setSevFilter((prev) =>
      prev.includes(sev) ? prev.filter((s) => s !== sev) : [...prev, sev],
    )
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 20 }}>
      <div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
          <span className="eyebrow">Filter</span>
          {SEV_ORDER.map((sev) => {
            const active = sevFilter.includes(sev)
            return (
              <button
                key={sev}
                onClick={() => toggleSev(sev)}
                style={{
                  padding: '4px 10px',
                  fontSize: 12,
                  border: '1px solid var(--line)',
                  borderRadius: 20,
                  background: active ? 'var(--bg-soft)' : 'transparent',
                  color: active ? 'var(--ink)' : 'var(--ink-mute)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: active ? 500 : 400,
                  textTransform: 'capitalize',
                }}
              >
                {sev}
              </button>
            )
          })}
          <span style={{ fontSize: 12, color: 'var(--ink-soft)', marginLeft: 4 }}>
            {filtered.length} of {issues.length} shown
          </span>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {q.isLoading ? (
            <EmptyCell label="Loading issues…" />
          ) : issues.length === 0 ? (
            <EmptyCell label="No DQ issues yet. Profiling may still be in progress." />
          ) : filtered.length === 0 ? (
            <EmptyCell label="No issues match the selected severity filter." />
          ) : (
            <table className="hx">
              <thead>
                <tr>
                  <th>Sev</th>
                  <th>Table</th>
                  <th>Column</th>
                  <th>Check</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.map((it) => (
                  <IssueRow
                    key={it.issue_id}
                    it={it}
                    runId={runId}
                    open={exp === it.issue_id}
                    onToggle={() => setExp(exp === it.issue_id ? null : it.issue_id)}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <DQScoreCard runId={runId} />
        <MetricCard label="Issues open" value={`${issues.filter((i) => i.status === 'open').length}`} sub="awaiting resolution" />
        <MetricCard label="Waived" value={`${issues.filter((i) => i.status === 'waived').length}`} sub="with notes" />

        {issues.length > 0 && (
          <div className="card" style={{ padding: 16 }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>Severity mix</div>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={SEV_ORDER.map((s) => ({ name: s, value: issues.filter((i) => i.severity === s).length })).filter((d) => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  dataKey="value"
                  paddingAngle={2}
                >
                  {SEV_ORDER.map((s) => (
                    <Cell key={s} fill={SEV_COLORS[s]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, fontFamily: 'var(--font-mono)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {issues.length > 0 && (() => {
          const checkCounts = Object.entries(
            issues.reduce<Record<string, number>>((acc, i) => { acc[i.check_type] = (acc[i.check_type] ?? 0) + 1; return acc }, {})
          ).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }))
          return (
            <div className="card" style={{ padding: 16 }}>
              <div className="eyebrow" style={{ marginBottom: 10 }}>By check type</div>
              <ResponsiveContainer width="100%" height={Math.max(80, checkCounts.length * 28)}>
                <BarChart layout="vertical" data={checkCounts} margin={{ left: 0, right: 24, top: 0, bottom: 0 }}>
                  <XAxis type="number" tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: 'var(--ink-mute)' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: 'var(--ink-soft)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, fontFamily: 'var(--font-mono)' }} />
                  <Bar dataKey="value" fill="var(--brand)" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )
        })()}
      </div>
    </div>
  )
}

function DQScoreCard({ runId }: { runId: string }) {
  const q = useQuery({ queryKey: ['dq-status', runId], queryFn: () => getDQStatus(runId) })
  if (q.isLoading) return <MetricCard label="DQ Score" value="…" sub="loading" />
  const passed = q.data?.gate_passed
  return (
    <MetricCard
      label="DQ Score"
      value={passed ? 'PASS' : 'BLOCKED'}
      sub={passed ? 'gate cleared' : 'see issues'}
      accent={passed ? 'var(--jade-deep)' : 'var(--crimson)'}
    />
  )
}

function IssueRow({
  it,
  runId,
  open,
  onToggle,
}: {
  it: DQIssue
  runId: string
  open: boolean
  onToggle: () => void
}) {
  const qc = useQueryClient()
  const [waiveOpen, setWaiveOpen] = useState(false)
  const [waiveNotes, setWaiveNotes] = useState('')
  const [rerunOpen, setRerunOpen] = useState(false)
  const [rerunPath, setRerunPath] = useState('')
  const [rerunSuccess, setRerunSuccess] = useState(false)

  const waiveMutation = useMutation({
    mutationFn: () => waiveDQIssue(runId, it.issue_id, waiveNotes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dq-issues', runId] })
      qc.invalidateQueries({ queryKey: ['dq-status', runId] })
      setWaiveOpen(false)
      setWaiveNotes('')
    },
  })

  const rerunMutation = useMutation({
    mutationFn: () => rerunDQTable(runId, it.table_name, rerunPath),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dq-issues', runId] })
      setRerunSuccess(true)
    },
  })

  return (
    <>
      <tr onClick={onToggle} style={{ cursor: 'pointer' }}>
        <td>
          <SeverityDot sev={it.severity} />
          <span style={{ textTransform: 'capitalize' }}>{it.severity}</span>
        </td>
        <td className="num" style={{ color: 'var(--ink)' }}>{it.table_name}</td>
        <td className="num">{it.column_name}</td>
        <td className="num">{it.check_type}</td>
        <td>{it.description}</td>
        <td>
          <StatusBadge status={it.status} />
        </td>
        <td style={{ color: 'var(--ink-mute)' }}>{open ? '▾' : '▸'}</td>
      </tr>
      {open ? (
        <tr>
          <td colSpan={7} style={{ background: 'var(--bg-soft)', padding: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 16 }}>
              <div>
                <div className="eyebrow" style={{ marginBottom: 10 }}>Affected rows</div>
                <div className="num" style={{ fontSize: 22, color: 'var(--ink)', fontWeight: 500 }}>
                  {it.affected_row_count != null ? it.affected_row_count.toLocaleString() : '—'}
                </div>
              </div>
              <div>
                <div className="eyebrow" style={{ marginBottom: 10 }}>Notes</div>
                <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>
                  {it.waive_notes ?? '—'}
                </div>
              </div>
            </div>

            {it.status === 'open' && (
              <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Waive section */}
                {!waiveOpen ? (
                  <button className="btn sm" onClick={() => setWaiveOpen(true)}>Waive issue</button>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 480 }}>
                    <div className="eyebrow">Waive with notes</div>
                    <textarea
                      placeholder="Waive notes (required)"
                      value={waiveNotes}
                      onChange={(e) => setWaiveNotes(e.target.value)}
                      rows={3}
                      style={{
                        fontSize: 13,
                        padding: '8px 10px',
                        border: '1px solid var(--line)',
                        borderRadius: 6,
                        resize: 'vertical',
                        fontFamily: 'var(--font-sans)',
                        background: 'var(--bg-card)',
                        color: 'var(--ink)',
                      }}
                    />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        className="btn primary sm"
                        disabled={!waiveNotes.trim() || waiveMutation.isPending}
                        onClick={() => waiveMutation.mutate()}
                      >
                        {waiveMutation.isPending ? 'Waiving…' : 'Confirm waive'}
                      </button>
                      <button className="btn sm" onClick={() => setWaiveOpen(false)}>Cancel</button>
                    </div>
                    {waiveMutation.error && (
                      <div style={{ fontSize: 12, color: 'oklch(0.45 0.18 25)' }}>
                        {(waiveMutation.error as Error).message}
                      </div>
                    )}
                  </div>
                )}

                {/* Re-run with corrected file section */}
                {!rerunOpen ? (
                  <button className="btn sm" onClick={() => setRerunOpen(true)}>
                    Re-run with corrected file…
                  </button>
                ) : rerunSuccess ? (
                  <div style={{ fontSize: 13, color: 'var(--jade-deep)', fontFamily: 'var(--font-mono)' }}>
                    ✓ Re-run scheduled for {it.table_name}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 480 }}>
                    <div className="eyebrow">Provide corrected file</div>
                    <input
                      type="text"
                      placeholder="/path/to/corrected.csv"
                      value={rerunPath}
                      onChange={(e) => setRerunPath(e.target.value)}
                      style={{
                        fontSize: 13,
                        padding: '7px 10px',
                        border: '1px solid var(--line)',
                        borderRadius: 6,
                        fontFamily: 'var(--font-mono)',
                        background: 'var(--bg-card)',
                        color: 'var(--ink)',
                      }}
                    />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        className="btn primary sm"
                        disabled={!rerunPath.trim() || rerunMutation.isPending}
                        onClick={() => rerunMutation.mutate()}
                      >
                        {rerunMutation.isPending ? 'Scheduling…' : `Re-run DQ for ${it.table_name}`}
                      </button>
                      <button className="btn sm" onClick={() => setRerunOpen(false)}>Cancel</button>
                    </div>
                    {rerunMutation.error && (
                      <div style={{ fontSize: 12, color: 'oklch(0.45 0.18 25)' }}>
                        {(rerunMutation.error as Error).message}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            {it.status === 'waived' && (
              <div style={{ fontSize: 12, color: 'var(--jade-deep)', fontFamily: 'var(--font-mono)' }}>
                Waived · {it.waived_at ? new Date(it.waived_at).toLocaleString() : ''}
              </div>
            )}
          </td>
        </tr>
      ) : null}
    </>
  )
}

function TableProfiles({ runId }: { runId: string }) {
  const q = useQuery({ queryKey: ['dq-profiles', runId], queryFn: () => getTableProfiles(runId) })
  const profiles: TableProfile[] = q.data?.profiles ?? []
  const [openTable, setOpenTable] = useState<string | null>(null)

  if (q.isLoading) return <EmptyCard label="Loading table profiles…" />
  if (profiles.length === 0) return <EmptyCard label="No table profiles yet." />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {profiles.map((t) => {
        const cols: ColumnProfile[] = t.columns ?? []
        const nullRate = cols.length > 0
          ? cols.reduce((sum, c) => sum + (c.null_pct ?? 0), 0) / cols.length
          : 0
        const dqScore = Math.round(100 - nullRate * 100)
        const isOpen = openTable === t.table_name

        return (
          <div key={t.table_name} className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <button
              onClick={() => setOpenTable(isOpen ? null : t.table_name)}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                padding: '18px 22px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                gap: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <h3 className="h3" style={{ margin: 0, fontSize: 18 }}>{t.table_name}</h3>
                <Pill kind="ok" dot>DQ {dqScore}</Pill>
              </div>
              <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--ink-soft)' }}>
                  <span><b style={{ color: 'var(--ink)' }}>{formatRows(t.row_count)}</b> rows</span>
                  <span><b style={{ color: 'var(--ink)' }}>{t.column_count}</b> cols</span>
                  <span><b style={{ color: 'var(--ink)' }}>{(nullRate * 100).toFixed(1)}%</b> null</span>
                </div>
                <span style={{ color: 'var(--ink-mute)' }}>{isOpen ? '▾' : '▸'}</span>
              </div>
            </button>

            {isOpen && (
              <div style={{ borderTop: '1px solid var(--line-soft)', padding: '18px 22px' }}>
                {/* KPI strip */}
                <div style={{ display: 'flex', gap: 0, border: '1px solid var(--line-soft)', borderRadius: 8, overflow: 'hidden', marginBottom: 20 }}>
                  {([
                    { label: 'Rows', value: formatRows(t.row_count) },
                    { label: 'Columns', value: String(t.column_count) },
                    { label: 'Longitudinal', value: t.is_longitudinal ? 'yes' : 'no' },
                    { label: 'Periods', value: t.n_periods != null ? String(t.n_periods) : '—' },
                  ] as Array<{ label: string; value: string }>).map((kpi, i, arr) => (
                    <div key={kpi.label} style={{ flex: 1, padding: '10px 14px', borderRight: i < arr.length - 1 ? '1px solid var(--line-soft)' : 'none' }}>
                      <div className="eyebrow" style={{ fontSize: 9, marginBottom: 2 }}>{kpi.label}</div>
                      <div className="num" style={{ fontSize: 18, fontWeight: 500, color: 'var(--ink)' }}>{kpi.value}</div>
                    </div>
                  ))}
                </div>

                {/* Column profiles table */}
                {cols.length > 0 && (
                  <TableColumnDetail cols={cols} />
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function TableColumnDetail({ cols }: { cols: ColumnProfile[] }) {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? cols : cols.slice(0, 8)

  return (
    <div>
      <div style={{ overflowX: 'auto' }}>
        <table className="hx" style={{ fontSize: 12 }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Type</th>
              <th style={{ minWidth: 140 }}>Null %</th>
              <th>Unique</th>
              <th>Skew</th>
              <th>Outlier %</th>
              <th>Top values</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((col) => {
              const nullPct = (col.null_pct ?? 0) * 100
              const nullColor = nullPct > 20 ? 'oklch(0.45 0.18 25)' : nullPct > 10 ? 'oklch(0.55 0.12 60)' : 'var(--jade-deep)'
              const skew = col.skew
              const skewColor = skew == null ? 'var(--ink-mute)'
                : Math.abs(skew) >= 2 ? 'oklch(0.45 0.18 25)'
                : Math.abs(skew) >= 1 ? 'oklch(0.55 0.12 60)'
                : 'var(--ink-2)'
              const outlier = (col.iqr_outlier_pct ?? 0) * 100
              const outlierColor = outlier > 10 ? 'oklch(0.45 0.18 25)' : outlier > 5 ? 'oklch(0.55 0.12 60)' : 'var(--ink-2)'
              const topEntries = col.top_k_freq
                ? Object.entries(col.top_k_freq).sort((a, b) => b[1] - a[1]).slice(0, 3)
                : []

              return (
                <tr key={col.name}>
                  <td className="num" style={{ color: 'var(--ink)', fontWeight: 500 }}>{col.name}</td>
                  <td>{col.var_role ? <Pill>{col.var_role}</Pill> : <span style={{ color: 'var(--ink-mute)' }}>—</span>}</td>
                  <td className="num" style={{ color: 'var(--ink-soft)' }}>{col.dtype}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: nullColor, fontFamily: 'var(--font-mono)', fontSize: 11, minWidth: 36 }}>
                        {nullPct.toFixed(1)}%
                      </span>
                      <div style={{ flex: 1, height: 6, background: 'var(--bg-soft)', borderRadius: 3, overflow: 'hidden', minWidth: 60 }}>
                        <div style={{ width: `${Math.min(nullPct, 100)}%`, height: '100%', background: nullColor, borderRadius: 3 }} />
                      </div>
                    </div>
                  </td>
                  <td className="num">{col.unique_count.toLocaleString()}</td>
                  <td className="num" style={{ color: skewColor }}>
                    {skew != null ? skew.toFixed(2) : '—'}
                  </td>
                  <td className="num" style={{ color: col.iqr_outlier_pct != null ? outlierColor : 'var(--ink-mute)' }}>
                    {col.iqr_outlier_pct != null ? `${outlier.toFixed(1)}%` : '—'}
                  </td>
                  <td>
                    {topEntries.length > 0 ? (
                      <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                        {topEntries.map(([val]) => (
                          <span
                            key={val}
                            style={{
                              fontSize: 10,
                              padding: '2px 6px',
                              background: 'var(--bg-soft)',
                              border: '1px solid var(--line-soft)',
                              borderRadius: 4,
                              fontFamily: 'var(--font-mono)',
                              color: 'var(--ink-2)',
                              maxWidth: 80,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {val}
                          </span>
                        ))}
                      </div>
                    ) : <span style={{ color: 'var(--ink-mute)' }}>—</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {cols.length > 8 && (
        <button
          className="btn sm"
          onClick={() => setShowAll(!showAll)}
          style={{ marginTop: 10 }}
        >
          {showAll ? 'Show fewer' : `Show all ${cols.length} columns`}
        </button>
      )}
    </div>
  )
}

function BivariateAnalysis({ runId }: { runId: string }) {
  const q = useQuery({ queryKey: ['dq-bivariate', runId], queryFn: () => getBivariate(runId) })
  const profiles: BivariateProfile[] = q.data?.profiles ?? []
  const bp = profiles[0]

  if (q.isLoading) return <EmptyCard label="Loading bivariate analysis…" />
  if (!bp) return <EmptyCard label="Bivariate analysis not yet available." />

  // vif_scores comes back as Record<string, number> from the API
  const vifRaw = bp.vif_scores as Record<string, number> | Array<{ column: string; vif: number; risk: string }>
  const vifList: Array<{ column: string; vif: number; risk: string }> = Array.isArray(vifRaw)
    ? vifRaw
    : Object.entries(vifRaw as Record<string, number>).map(([column, vif]) => ({
        column,
        vif,
        risk: vif > 10 ? 'high' : vif > 5 ? 'medium' : 'low',
      }))

  const cols = Array.from(
    new Set(bp.measure_correlations.flatMap((c) => [c.col_a, c.col_b])),
  ).slice(0, 5)

  const kwPairs = (bp.dimension_measure_assoc ?? [])
    .filter((p) => {
      const assocType = (p as { assoc_type?: string }).assoc_type
      return assocType === 'kruskal_h' || assocType == null
    })
    .sort((a, b) => (b.value ?? b.stat ?? 0) - (a.value ?? a.stat ?? 0))

  const cvPairs = (bp.dimension_pair_assoc ?? [])
    .sort((a, b) => b.value - a.value)

  function corrFor(i: number, j: number): number {
    if (i === j) return 1
    const pair = bp.measure_correlations.find(
      (p) =>
        (p.col_a === cols[i] && p.col_b === cols[j]) ||
        (p.col_a === cols[j] && p.col_b === cols[i]),
    )
    return pair?.value ?? 0
  }

  function colorFor(v: number) {
    const a = Math.abs(v)
    if (a >= 0.9) return 'var(--crimson)'
    if (a >= 0.7) return 'var(--terra)'
    if (a >= 0.4) return 'var(--amber)'
    return 'var(--jade-soft)'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card" style={{ padding: 22 }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>Correlation matrix (Pearson)</div>
          {cols.length === 0 ? (
            <div style={{ color: 'var(--ink-soft)', fontSize: 13 }}>No measure correlations available.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: `100px repeat(${cols.length}, 1fr)`, gap: 4 }}>
              <div />
              {cols.map((c) => (
                <div key={c} className="num" style={{ fontSize: 10, color: 'var(--ink-mute)', textAlign: 'center' }}>
                  {c}
                </div>
              ))}
              {cols.map((rowCol, i) => (
                <>
                  <div key={`row-${i}`} className="num" style={{ fontSize: 11, color: 'var(--ink-soft)' }}>{rowCol}</div>
                  {cols.map((_, j) => {
                    const v = corrFor(i, j)
                    return (
                      <div
                        key={`${i}-${j}`}
                        style={{
                          height: 36,
                          background: colorFor(v),
                          borderRadius: 4,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'var(--font-mono)',
                          fontSize: 10,
                          color: Math.abs(v) >= 0.7 ? '#fff' : 'var(--ink-2)',
                        }}
                      >
                        {v.toFixed(2)}
                      </div>
                    )
                  })}
                </>
              ))}
            </div>
          )}
        </div>

        <div className="card" style={{ padding: 22 }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>VIF scores</div>
          {vifList.length === 0 ? (
            <div style={{ color: 'var(--ink-soft)', fontSize: 13 }}>No VIF scores reported.</div>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(80, vifList.length * 32)}>
              <BarChart layout="vertical" data={vifList} margin={{ left: 0, right: 40, top: 0, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: 'var(--ink-mute)' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="column" width={100} tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: 'var(--ink-soft)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, fontFamily: 'var(--font-mono)' }} formatter={(v) => [Number(v).toFixed(1), 'VIF']} />
                <ReferenceLine x={5} stroke="oklch(0.6 0.16 50)" strokeDasharray="4 2" label={{ value: '5', position: 'top', fontSize: 9, fill: 'oklch(0.6 0.16 50)' }} />
                <ReferenceLine x={10} stroke="oklch(0.45 0.18 25)" strokeDasharray="4 2" label={{ value: '10', position: 'top', fontSize: 9, fill: 'oklch(0.45 0.18 25)' }} />
                <Bar dataKey="vif" radius={[0, 3, 3, 0]}>
                  {vifList.map((v) => (
                    <Cell key={v.column} fill={v.vif > 10 ? 'oklch(0.45 0.18 25)' : v.vif > 5 ? 'oklch(0.6 0.16 50)' : 'oklch(0.55 0.12 150)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {kwPairs.length > 0 && (
        <div className="card" style={{ padding: 22 }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>Kruskal-Wallis (dimension × measure)</div>
          <ResponsiveContainer width="100%" height={Math.max(80, Math.min(kwPairs.length, 15) * 30)}>
            <BarChart
              layout="vertical"
              data={kwPairs.slice(0, 15).map((p) => ({
                label: `${(p.dimension ?? p.col_a) ?? '?'} × ${(p.measure ?? p.col_b) ?? '?'}`,
                h: p.value ?? p.stat ?? 0,
                sig: p.p_value != null && p.p_value < 0.05,
                pval: p.p_value,
              }))}
              margin={{ left: 0, right: 60, top: 0, bottom: 0 }}
            >
              <XAxis type="number" tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: 'var(--ink-mute)' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="label" width={160} tick={{ fontSize: 9, fontFamily: 'var(--font-mono)', fill: 'var(--ink-soft)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, fontFamily: 'var(--font-mono)' }} formatter={(v, _n, item) => [Number(v).toFixed(2) + (item.payload?.pval != null ? ` (p=${Number(item.payload.pval).toFixed(3)})` : ''), 'H-stat']} />
              <Bar dataKey="h" radius={[0, 3, 3, 0]}>
                {kwPairs.slice(0, 15).map((p, i) => {
                  const sig = p.p_value != null && p.p_value < 0.05
                  return <Cell key={i} fill={sig ? 'oklch(0.45 0.18 25)' : 'oklch(0.55 0.08 230)'} />
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {cvPairs.length > 0 && (
        <div className="card" style={{ padding: 22 }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>Cramér's V (dimension pairs)</div>
          <table className="hx" style={{ fontSize: 12 }}>
            <thead>
              <tr>
                <th>Dim A</th>
                <th>Dim B</th>
                <th>Cramér's V</th>
                <th>Significant</th>
              </tr>
            </thead>
            <tbody>
              {cvPairs.map((p, i) => {
                const sig = p.significant ?? p.value >= 0.5
                return (
                  <tr key={i}>
                    <td className="num">{p.col_a}</td>
                    <td className="num">{p.col_b}</td>
                    <td
                      className="num"
                      style={{ color: p.value >= 0.7 ? 'var(--crimson)' : p.value >= 0.5 ? 'var(--terra)' : 'var(--ink-2)' }}
                    >
                      {p.value.toFixed(3)}
                    </td>
                    <td style={{ color: sig ? 'var(--jade-deep)' : 'var(--ink-mute)' }}>
                      {sig ? '✓' : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function WorkforceContext({ runId }: { runId: string }) {
  const q = useQuery({
    queryKey: ['dq-workforce', runId],
    queryFn: () => getWorkforceContext(runId),
  })

  if (q.isLoading) return <EmptyCard label="Loading workforce context…" />
  const data = q.data
  if (!data) {
    return <EmptyCard label="Workforce context not yet available." />
  }
  const ctx = data
  const sortedSegments = [...ctx.segment_health_scores].sort((a, b) => a.dq_score - b.dq_score)
  const recentPeriods = [...ctx.temporal_period_stats].slice(-12)
  const hourDist = ctx.hour_distribution ?? {}

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Detected columns KPI strip */}
      <div style={{ display: 'flex', gap: 0, background: 'var(--bg-card)', border: '1px solid var(--line-soft)', borderRadius: 10, overflow: 'hidden' }}>
        {[
          { label: 'Payroll table', value: ctx.detected_payroll_table ?? '—' },
          { label: 'Hours col', value: ctx.detected_hours_column ?? '—' },
          { label: 'Value col', value: ctx.detected_value_column ?? '—' },
          { label: 'Pay code col', value: ctx.detected_pay_code_column ?? '—' },
          { label: 'Time grain', value: ctx.time_grain ?? '—' },
        ].map((kpi, i, arr) => (
          <div key={kpi.label} style={{ flex: 1, padding: '12px 16px', borderRight: i < arr.length - 1 ? '1px solid var(--line-soft)' : 'none' }}>
            <div className="eyebrow" style={{ marginBottom: 4, fontSize: 9 }}>{kpi.label}</div>
            <div className="num" style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {kpi.value}
            </div>
          </div>
        ))}
      </div>

      {/* Pay code concentration */}
      <div className="card" style={{ padding: 22 }}>
        <div className="eyebrow" style={{ marginBottom: 16 }}>Pay code concentration (Pareto)</div>
        {ctx.pay_code_concentration.length === 0 ? (
          <div style={{ color: 'var(--ink-soft)', fontSize: 13 }}>No pay code data available.</div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart
              data={ctx.pay_code_concentration.slice(0, 15).map((c) => ({
                pay_code: c.pay_code,
                pct: (c.pct_of_total_hours ?? 0) * 100,
                cumulative: (c.cumulative_pct_hours ?? 0) * 100,
              }))}
              margin={{ left: 0, right: 48, top: 8, bottom: 50 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line-soft)" />
              <XAxis dataKey="pay_code" tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: 'var(--ink-mute)' }} angle={-45} textAnchor="end" axisLine={false} tickLine={false} interval={0} />
              <YAxis yAxisId="left" tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: 'var(--ink-mute)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${Number(v).toFixed(0)}%`} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: 'var(--ink-mute)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${Number(v).toFixed(0)}%`} />
              <Tooltip contentStyle={{ fontSize: 12, fontFamily: 'var(--font-mono)' }} formatter={(v, name) => [`${Number(v).toFixed(1)}%`, name === 'pct' ? '% of hours' : 'cumulative %']} />
              <ReferenceLine yAxisId="right" y={80} stroke="oklch(0.6 0.16 50)" strokeDasharray="4 2" />
              <Bar yAxisId="left" dataKey="pct" fill="var(--jade)" radius={[3, 3, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="cumulative" stroke="oklch(0.6 0.16 50)" dot={false} strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Temporal trends */}
      {recentPeriods.length > 0 && (
        <div className="card" style={{ padding: 22 }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>
            Temporal trends · {ctx.time_grain ?? ''} · last {recentPeriods.length} periods
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart
              data={recentPeriods.map((p) => ({
                period: p.period,
                total_hours: p.total_hours ?? 0,
                employee_count: p.employee_count ?? 0,
              }))}
              margin={{ left: 0, right: 48, top: 8, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line-soft)" />
              <XAxis dataKey="period" tick={{ fontSize: 9, fontFamily: 'var(--font-mono)', fill: 'var(--ink-mute)' }} angle={-45} textAnchor="end" axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: 'var(--ink-mute)' }} axisLine={false} tickLine={false} tickFormatter={(v) => Number(v) >= 1000 ? `${(Number(v) / 1000).toFixed(0)}K` : String(v)} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: 'var(--ink-mute)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, fontFamily: 'var(--font-mono)' }} />
              <Bar yAxisId="right" dataKey="employee_count" fill="oklch(0.7 0.1 240)" radius={[3, 3, 0, 0]} name="Employees" />
              <Line yAxisId="left" type="monotone" dataKey="total_hours" stroke="var(--brand)" dot={false} strokeWidth={2} name="Total hours" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Hour distribution */}
      {Object.keys(hourDist).length > 0 && (
        <div className="card" style={{ padding: 22 }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>Hour distribution</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={Object.entries(hourDist).map(([name, value]) => {
                  const v = typeof value === 'number' ? value : 0
                  return { name, value: v <= 1 ? v * 100 : v }
                })}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
                paddingAngle={2}
              >
                {Object.entries(hourDist).map(([name]) => {
                  const lc = name.toLowerCase()
                  const fill = lc.includes('regular') ? 'oklch(0.55 0.12 150)'
                    : lc.includes('over') ? 'oklch(0.6 0.16 50)'
                    : lc.includes('premium') ? 'oklch(0.45 0.18 25)'
                    : 'oklch(0.6 0.08 230)'
                  return <Cell key={name} fill={fill} />
                })}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, fontFamily: 'var(--font-mono)' }} formatter={(v) => [`${Number(v).toFixed(1)}%`, '']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Segment health */}
      <div className="card" style={{ padding: 22 }}>
        <div className="eyebrow" style={{ marginBottom: 16 }}>Segment health · sorted worst first</div>
        {sortedSegments.length === 0 ? (
          <div style={{ color: 'var(--ink-soft)', fontSize: 13 }}>No segment health data available.</div>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(80, sortedSegments.length * 32)}>
            <BarChart
              layout="vertical"
              data={sortedSegments.map((s) => ({
                label: `${s.segment_column} = ${s.segment_value}`,
                score: s.dq_score,
              }))}
              margin={{ left: 0, right: 24, top: 0, bottom: 0 }}
            >
              <XAxis type="number" domain={[0, 1]} tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: 'var(--ink-mute)' }} axisLine={false} tickLine={false} tickFormatter={(v) => Number(v).toFixed(1)} />
              <YAxis type="category" dataKey="label" width={160} tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: 'var(--ink-soft)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, fontFamily: 'var(--font-mono)' }} formatter={(v) => [Number(v).toFixed(2), 'DQ score']} />
              <Bar dataKey="score" radius={[0, 3, 3, 0]}>
                {sortedSegments.map((s, i) => (
                  <Cell key={i} fill={s.dq_score >= 0.9 ? 'oklch(0.55 0.12 150)' : s.dq_score >= 0.7 ? 'oklch(0.6 0.16 50)' : 'oklch(0.45 0.18 25)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

function Relationships({ runId }: { runId: string }) {
  const q = useQuery({
    queryKey: ['dq-relationships', runId],
    queryFn: () => getRelationships(runId),
  })
  const issues: RelationshipIssue[] = q.data?.relationships ?? []

  if (q.isLoading) return <EmptyCard label="Loading relationships…" />
  if (issues.length === 0) return <EmptyCard label="No cross-table relationship issues detected." />

  return (
    <div className="card" style={{ padding: 28 }}>
      <div className="eyebrow" style={{ marginBottom: 20 }}>Cross-table relationship validation</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {issues.map((r) => {
          const sevColor = r.severity === 'critical' || r.severity === 'high' ? 'var(--crimson)' : r.severity === 'medium' ? 'var(--terra)' : 'var(--ink-soft)'
          return (
            <div key={r.issue_id} style={{ padding: 14, background: 'var(--bg-soft)', borderRadius: 10, borderLeft: `3px solid ${sevColor}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span className="num" style={{ fontSize: 12, color: 'var(--ink-2)' }}>
                  {r.table_name}{r.related_table ? ` → ${r.related_table}` : ''}
                </span>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: sevColor, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {r.severity}
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 4 }}>{r.description}</div>
              <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)' }}>
                <span>{r.check_type}</span>
                {r.affected_count > 0 && <span>{r.affected_count.toLocaleString()} affected</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Catalog({ runId }: { runId: string }) {
  const q = useQuery({ queryKey: ['dq-catalog', runId], queryFn: () => getCatalog(runId) })
  const catalog: CatalogEntry[] = q.data?.catalog ?? []

  const tables = useMemo(() => {
    const map = new Map<string, CatalogEntry[]>()
    for (const e of catalog) {
      if (!map.has(e.table_name)) map.set(e.table_name, [])
      map.get(e.table_name)!.push(e)
    }
    return Array.from(map.entries()).map(([table_name, columns]) => ({
      table_name,
      columnCount: columns.length,
      concepts: Array.from(new Set(columns.map((c) => c.inferred_semantic_type))).join(', '),
      pk: columns.find((c) => c.inferred_semantic_type === 'entity_key')?.column_name ?? '—',
    }))
  }, [catalog])

  if (q.isLoading) return <EmptyCard label="Loading catalog…" />
  if (tables.length === 0) return <EmptyCard label="Catalog not yet available." />

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <table className="hx">
        <thead>
          <tr>
            <th>Table</th>
            <th>Columns</th>
            <th>Concepts</th>
            <th>PK</th>
          </tr>
        </thead>
        <tbody>
          {tables.map((r) => (
            <tr key={r.table_name}>
              <td className="num" style={{ color: 'var(--ink)' }}>{r.table_name}</td>
              <td className="num">{r.columnCount}</td>
              <td className="num">{r.concepts}</td>
              <td className="num">{r.pk}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function EmptyCell({ label }: { label: string }) {
  return (
    <div style={{ padding: 24, color: 'var(--ink-soft)', fontSize: 13 }}>
      {label}
    </div>
  )
}

function EmptyCard({ label }: { label: string }) {
  return (
    <div className="card" style={{ padding: 24, color: 'var(--ink-soft)', fontSize: 13 }}>
      {label}
    </div>
  )
}

function formatRows(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return `${n}`
}
