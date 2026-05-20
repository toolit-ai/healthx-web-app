import { useState, useMemo } from 'react'
import MetricCard from '@/components/MetricCard'
import StatusBadge from '@/components/StatusBadge'
import SeverityDot from '@/components/SeverityDot'
import Pill from '@/components/Pill'
import {
  getDQIssues,
  getDQStatus,
  getTableProfiles,
  getBivariateProfiles,
  getWorkforceContext,
  getRelationships,
  getCatalog,
} from '@/api/mock'

const TABS = [
  { id: 'issues', label: 'Issues & resolution' },
  { id: 'profiles', label: 'Table profiles' },
  { id: 'bivar', label: 'Bivariate analysis' },
  { id: 'workforce', label: 'Workforce context' },
  { id: 'rels', label: 'Relationships' },
  { id: 'catalog', label: 'Catalog' },
] as const

export default function DataAndDQ() {
  const [tab, setTab] = useState<string>('issues')
  return (
    <div>
      <DQBanner />
      <TabBar value={tab} onChange={setTab} tabs={TABS} />
      {tab === 'issues' && <DQIssues />}
      {tab === 'profiles' && <TableProfiles />}
      {tab === 'bivar' && <BivariateAnalysis />}
      {tab === 'workforce' && <WorkforceContext />}
      {tab === 'rels' && <Relationships />}
      {tab === 'catalog' && <Catalog />}
    </div>
  )
}

function DQBanner() {
  const dqStatus = getDQStatus()
  return (
    <div
      style={{
        padding: '16px 24px',
        background: 'var(--jade-soft)',
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
          background: 'var(--jade-deep)',
        }}
      />
      <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--jade-deep)' }}>
        BL-EDA gate: CLEAR
      </span>
      <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
        No blocking issues. {dqStatus.waived_count} waived · {dqStatus.critical_count + dqStatus.high_count + dqStatus.medium_count} resolved · 2 advisory.
      </span>
      <span
        style={{
          marginLeft: 'auto',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--ink-soft)',
        }}
      >
        Last DQ pass: 10:11:05
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

function DQIssues() {
  const [exp, setExp] = useState<number | null>(null)
  const issues = getDQIssues()

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 20 }}>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
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
            {issues.map((it, i) => (
              <>
                <tr onClick={() => setExp(exp === i ? null : i)} style={{ cursor: 'pointer' }}>
                  <td>
                    <SeverityDot sev={it.severity} />
                    <span style={{ textTransform: 'capitalize' }}>{it.severity}</span>
                  </td>
                  <td className="num" style={{ color: 'var(--ink)' }}>
                    {it.table_name}
                  </td>
                  <td className="num">{it.column_name}</td>
                  <td className="num">{it.check_type}</td>
                  <td>{it.description}</td>
                  <td>
                    <StatusBadge status={it.status} />
                  </td>
                  <td style={{ color: 'var(--ink-mute)' }}>{exp === i ? '▾' : '▸'}</td>
                </tr>
                {exp === i ? (
                  <tr>
                    <td colSpan={7} style={{ background: 'var(--bg-soft)', padding: 20 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                        <div>
                          <div className="eyebrow" style={{ marginBottom: 10 }}>
                            Acknowledge & waive
                          </div>
                          <textarea
                            className="field"
                            placeholder="Reason for waiving (required)"
                            style={{ minHeight: 80, fontFamily: 'var(--font-sans)', resize: 'vertical' }}
                          />
                          <button className="btn sm" style={{ marginTop: 10 }}>
                            Waive issue
                          </button>
                        </div>
                        <div>
                          <div className="eyebrow" style={{ marginBottom: 10 }}>
                            Provide corrected file
                          </div>
                          <input
                            className="field"
                            placeholder={`/path/to/corrected/${it.table_name}.parquet`}
                          />
                          <button className="btn accent sm" style={{ marginTop: 10 }}>
                            Re-run DQ for this table →
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : null}
              </>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <MetricCard label="DQ Score" value="94.2" sub="Run threshold ≥ 85" accent="var(--jade-deep)" />
        <MetricCard label="Rows ingested" value="11.4M" sub="across 5 tables" />
        <MetricCard label="Issues open" value="2" sub="0 critical · 1 medium · 1 low" />
        <div className="card" style={{ padding: 20 }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>
            Pay code concentration
          </div>
          <PayCodeBars />
        </div>
      </div>
    </div>
  )
}

function PayCodeBars() {
  const codes = [
    { code: 'REG', pct: 62 },
    { code: 'OT15', pct: 14 },
    { code: 'SD3', pct: 8 },
    { code: 'WDF', pct: 5 },
    { code: 'VTO', pct: 4 },
    { code: 'MTO', pct: 3 },
    { code: 'CALL', pct: 2 },
    { code: 'PREM', pct: 2 },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      {codes.map((c) => (
        <div
          key={c.code}
          style={{
            display: 'grid',
            gridTemplateColumns: '50px 1fr 50px',
            gap: 10,
            alignItems: 'center',
          }}
        >
          <span className="num" style={{ fontSize: 12, color: 'var(--ink-2)' }}>
            {c.code}
          </span>
          <div
            style={{
              height: 8,
              background: 'var(--bg-soft)',
              borderRadius: 4,
              overflow: 'hidden',
            }}
          >
            <div
              style={{ width: `${c.pct}%`, height: '100%', background: 'var(--jade)' }}
            />
          </div>
          <span
            className="num"
            style={{ fontSize: 11, color: 'var(--ink-soft)', textAlign: 'right' }}
          >
            {c.pct}%
          </span>
        </div>
      ))}
    </div>
  )
}

function TableProfiles() {
  const profiles = getTableProfiles()

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
      {profiles.map((t) => {
        const nullRate =
          t.column_profiles.reduce((sum, c) => sum + c.null_rate, 0) /
          (t.column_profiles.length || 1)
        const dqScore = Math.round(100 - nullRate * 100)
        return (
          <div key={t.table_name} className="card" style={{ padding: 22 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}
            >
              <h3 className="h3" style={{ margin: 0, fontSize: 22 }}>
                {t.table_name}
              </h3>
              <Pill kind="ok" dot>
                DQ {dqScore}
              </Pill>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 14,
                marginTop: 20,
              }}
            >
              <StatChip label="Rows" v={formatRows(t.row_count)} />
              <StatChip label="Columns" v={t.column_count} />
              <StatChip label="Null rate" v={`${(nullRate * 100).toFixed(1)}%`} />
            </div>
            <div
              style={{
                marginTop: 18,
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--ink-mute)',
                letterSpacing: '0.06em',
              }}
            >
              Stages 1–3 ✓ · Stage 4 (bivariate) ✓ · Stage 5 (workforce) ✓
            </div>
          </div>
        )
      })}
    </div>
  )
}

function formatRows(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`
  return `${n}`
}

function StatChip({ label, v }: { label: string; v: string | number }) {
  return (
    <div>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--ink-mute)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>
      <div
        className="num"
        style={{
          fontSize: 20,
          fontWeight: 500,
          marginTop: 4,
          letterSpacing: '-0.01em',
        }}
      >
        {v}
      </div>
    </div>
  )
}

function BivariateAnalysis() {
  const bivariate = getBivariateProfiles()
  const bp = bivariate[0]

  // Derive unique columns from correlations + VIF
  const allCols = useMemo(() => {
    const set = new Set<string>()
    bp?.measure_correlations.forEach((c) => {
      set.add(c.col_a)
      set.add(c.col_b)
    })
    bp?.vif_scores.forEach((v) => set.add(v.column))
    return Array.from(set).slice(0, 5)
  }, [bp])

  const matrix = useMemo(() => {
    const m: number[][] = []
    for (let i = 0; i < allCols.length; i++) {
      const row: number[] = []
      for (let j = 0; j < allCols.length; j++) {
        if (i === j) {
          row.push(1)
        } else {
          const pair = bp?.measure_correlations.find(
            (p) =>
              (p.col_a === allCols[i] && p.col_b === allCols[j]) ||
              (p.col_a === allCols[j] && p.col_b === allCols[i])
          )
          row.push(pair?.value ?? 0)
        }
      }
      m.push(row)
    }
    return m
  }, [allCols, bp])

  function colorFor(v: number) {
    const a = Math.abs(v)
    if (a >= 0.9) return 'var(--crimson)'
    if (a >= 0.7) return 'var(--terra)'
    if (a >= 0.4) return 'var(--amber)'
    return 'var(--jade-soft)'
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <div className="eyebrow" style={{ marginBottom: 14 }}>
          Correlation matrix (Pearson)
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `100px repeat(${allCols.length}, 1fr)`,
            gap: 4,
          }}
        >
          <div />
          {allCols.map((c) => (
            <div
              key={c}
              className="num"
              style={{ fontSize: 10, color: 'var(--ink-mute)', textAlign: 'center' }}
            >
              {abbreviate(c)}
            </div>
          ))}
          {matrix.map((row, i) => (
            <>
              <div className="num" style={{ fontSize: 11, color: 'var(--ink-soft)' }}>
                {abbreviate(allCols[i])}
              </div>
              {row.map((v, j) => (
                <div
                  key={j}
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
              ))}
            </>
          ))}
        </div>
      </div>
      <div className="card" style={{ padding: 22 }}>
        <div className="eyebrow" style={{ marginBottom: 14 }}>
          VIF scores
        </div>
        <table className="hx">
          <thead>
            <tr>
              <th>Column</th>
              <th>VIF</th>
              <th>Risk</th>
            </tr>
          </thead>
          <tbody>
            {bp?.vif_scores.map((v) => (
              <tr key={v.column}>
                <td className="num">{v.column}</td>
                <td
                  className="num"
                  style={{
                    color: v.vif > 10 ? 'var(--crimson)' : v.vif > 5 ? 'var(--terra)' : 'var(--ink-2)',
                  }}
                >
                  {v.vif.toFixed(1)}
                </td>
                <td>
                  <Pill
                    kind={v.risk === 'high' ? 'err' : v.risk === 'medium' ? 'warn' : 'ok'}
                    dot
                  >
                    {v.risk}
                  </Pill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div
          style={{
            marginTop: 14,
            padding: 12,
            background: 'oklch(0.95 0.06 75)',
            borderRadius: 8,
            fontSize: 13,
            color: 'oklch(0.4 0.13 75)',
          }}
        >
          △ {bp?.high_correlation_pairs ?? 0} high-collinearity pairs detected. BL-EDA will
          fall back to univariate models for these dimensions.
        </div>
      </div>
    </div>
  )
}

function abbreviate(s: string): string {
  if (s === 'hours_worked') return 'hrs_wk'
  if (s === 'scheduled_hours') return 'sched_hrs'
  if (s === 'ot_hrs') return 'ot_hrs'
  if (s === 'base_rate') return 'base_rt'
  if (s === 'tenure') return 'tenure'
  if (s === 'years_service') return 'yrs_svc'
  if (s === 'facility_id') return 'fac_id'
  return s
}

function WorkforceContext() {
  const workforce = getWorkforceContext()
  const sortedSegments = useMemo(
    () => [...workforce.segment_health_scores].sort((a, b) => a.dq_score - b.dq_score),
    [workforce.segment_health_scores]
  )

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
        <MetricCard label="Total hours (14mo)" value="183.4M" sub="11.4M rows" />
        <MetricCard label="Premium share" value="22.8%" sub="OT + SD + WDF + CALL" />
        <MetricCard label="OT rate" value="9.4%" sub="vs 7.1% benchmark" accent="var(--terra)" />
        <MetricCard label="Period delta" value="+18.2%" sub="Q2 vs Q1 premium hrs" />
      </div>
      <div className="card" style={{ padding: 22 }}>
        <div className="eyebrow" style={{ marginBottom: 16 }}>
          Segment health · sorted worst first
        </div>
        <table className="hx">
          <thead>
            <tr>
              <th>Segment</th>
              <th>Employees</th>
              <th>DQ score</th>
            </tr>
          </thead>
          <tbody>
            {sortedSegments.map((s, i) => (
              <tr key={i}>
                <td style={{ color: 'var(--ink)' }}>{s.segment}</td>
                <td className="num">—</td>
                <td className="num">{s.dq_score.toFixed(0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Relationships() {
  const relationships = getRelationships()

  return (
    <div className="card" style={{ padding: 28 }}>
      <div className="eyebrow" style={{ marginBottom: 20 }}>
        Cross-table relationship validation
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {relationships.map((r, i) => {
          const label = `${r.table_a}.${r.column_a} → ${r.table_b}.${r.column_b}`
          const pct = r.confidence * 100
          return (
            <div key={i} style={{ padding: 16, background: 'var(--bg-soft)', borderRadius: 10 }}>
              <div className="num" style={{ fontSize: 12, color: 'var(--ink-2)' }}>
                {label}
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 10,
                }}
              >
                <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
                  {r.relationship_type === 'foreign_key' ? 'FK integrity' : 'Domain check'}
                </span>
                <span
                  className="num"
                  style={{
                    fontWeight: 500,
                    color: pct >= 99.5 ? 'var(--jade-deep)' : 'var(--terra)',
                  }}
                >
                  {pct.toFixed(1)}%
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Catalog() {
  const catalog = getCatalog()

  // Group by table
  const tables = useMemo(() => {
    const map = new Map<string, typeof catalog>()
    for (const entry of catalog) {
      if (!map.has(entry.table_name)) map.set(entry.table_name, [])
      map.get(entry.table_name)!.push(entry)
    }
    return Array.from(map.entries()).map(([table_name, columns]) => ({
      table_name,
      concepts: columns.map((c) => c.inferred_semantic_type).join(', '),
      pk: columns.find((c) => c.inferred_semantic_type === 'entity_key')?.column_name ?? '—',
      timeGrain: inferTimeGrain(columns),
      coverage: inferCoverage(table_name),
    }))
  }, [catalog])

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <table className="hx">
        <thead>
          <tr>
            <th>Table</th>
            <th>Concepts</th>
            <th>PK</th>
            <th>Time grain</th>
            <th>Coverage</th>
          </tr>
        </thead>
        <tbody>
          {tables.map((r) => (
            <tr key={r.table_name}>
              <td className="num" style={{ color: 'var(--ink)' }}>
                {r.table_name}
              </td>
              <td className="num">{r.concepts}</td>
              <td className="num">{r.pk}</td>
              <td>{r.timeGrain}</td>
              <td className="num">{r.coverage}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function inferTimeGrain(columns: { inferred_semantic_type: string; column_name: string }[]): string {
  if (columns.some((c) => c.column_name === 'punch_ts')) return 'punch-level'
  if (columns.some((c) => c.column_name === 'shift_start')) return 'shift-level'
  if (columns.some((c) => c.column_name === 'pay_amount')) return 'pay-period'
  if (columns.some((c) => c.column_name === 'hire_date')) return 'employee'
  if (columns.some((c) => c.column_name === 'code')) return 'lookup'
  return '—'
}

function inferCoverage(tableName: string): string {
  if (tableName === 'absence_codes_lkp') return '—'
  if (tableName === 'employee_v2') return 'as-of 2026-05-01'
  return '2024-03 → 2026-05'
}
