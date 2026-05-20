import { useState } from 'react'
import MetricCard from '@/components/MetricCard'
import SeverityDot from '@/components/SeverityDot'
import Pill from '@/components/Pill'
import Spinner from '@/components/Spinner'
import { getScenarios, FINDINGS, BL_EDA_RUNNING } from '@/api/mock'

const TABS = ['Findings', 'Scenarios'] as const

interface MockFinding {
  id: string
  severity: string
  practice: string
  title: string
  affected: number
  hours: string
  dollars: string
  rules: string[]
  discussion: string
}

const FINDINGS_DATA: MockFinding[] = FINDINGS as MockFinding[]

export default function BLEDAFindings() {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Findings')
  const [sevFilter, setSevFilter] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(FINDINGS_DATA[0]?.id || null)
  const scenarios = getScenarios()

  const filtered =
    sevFilter === 'all'
      ? FINDINGS_DATA
      : FINDINGS_DATA.filter((f) => f.severity === sevFilter)

  const scenarioGroups = scenarios.reduce(
    (acc, s) => {
      if (!acc[s.pay_practice]) acc[s.pay_practice] = []
      acc[s.pay_practice].push(s)
      return acc
    },
    {} as Record<string, typeof scenarios>
  )

  return (
    <div>
      {/* Banner */}
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
        <Spinner size={16} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>
            BL-EDA execution · Stage 5 of 10 pay practices
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 2 }}>
            3 critical findings persisted · 9 high · 26 medium/low · est. 4 min
            remaining
          </div>
        </div>
        <div style={{ flex: '0 0 200px' }}>
          <div
            style={{
              height: 6,
              background: 'var(--bg-soft)',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: '50%',
                background: 'var(--indigo)',
                borderRadius: 3,
              }}
            />
          </div>
          <div
            className="num"
            style={{
              fontSize: 11,
              color: 'var(--ink-soft)',
              marginTop: 4,
              textAlign: 'right',
            }}
          >
            50%
          </div>
        </div>
      </div>

      {/* MetricCards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <MetricCard label="Findings" value="38" sub="+12 in last 4 min" />
        <MetricCard
          label="Critical"
          value="3"
          sub="$2.03M exposure"
          accent="var(--crimson)"
        />
        <MetricCard
          label="High"
          value="9"
          sub="$1.30M exposure"
          accent="var(--terra)"
        />
        <MetricCard label="Practices covered" value="5 / 10" sub="executing" />
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 24 }}>
        {/* Left */}
        <div>
          {/* Tab bar */}
          <div
            style={{
              display: 'flex',
              gap: 4,
              marginBottom: 24,
              borderBottom: '1px solid var(--line)',
            }}
          >
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
                    borderBottom:
                      '2px solid ' + (active ? 'var(--ink)' : 'transparent'),
                    color: active ? 'var(--ink)' : 'var(--ink-soft)',
                    fontWeight: active ? 500 : 400,
                    fontSize: 13.5,
                    marginBottom: -1,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  {t}
                </button>
              )
            })}
          </div>

          {tab === 'Findings' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  marginBottom: 14,
                  alignItems: 'center',
                }}
              >
                <span className="eyebrow" style={{ marginRight: 8 }}>
                  Filter
                </span>
                {['all', 'critical', 'high', 'medium', 'low'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSevFilter(s)}
                    className="btn sm"
                    style={{
                      background: sevFilter === s ? 'var(--ink)' : 'transparent',
                      color: sevFilter === s ? 'var(--bg)' : 'var(--ink-2)',
                      borderColor:
                        sevFilter === s ? 'var(--ink)' : 'var(--line)',
                      textTransform: 'capitalize',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filtered.map((f) => (
                  <FindingRow
                    key={f.id}
                    f={f}
                    open={expandedId === f.id}
                    onToggle={() =>
                      setExpandedId(expandedId === f.id ? null : f.id)
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {tab === 'Scenarios' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {Object.entries(scenarioGroups).map(([practice, items]) => (
                <div key={practice} className="card" style={{ padding: 22 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      marginBottom: 16,
                    }}
                  >
                    <h3 className="h3" style={{ margin: 0 }}>
                      {practice}
                    </h3>
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
                          <td
                            className="num"
                            style={{
                              color:
                                s.cost_impact < 0
                                  ? 'var(--jade-deep)'
                                  : 'var(--ink-2)',
                            }}
                          >
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
          )}
        </div>

        {/* Right — Practice Execution rail */}
        <div
          className="card"
          style={{
            padding: 22,
            alignSelf: 'flex-start',
            position: 'sticky',
            top: 100,
          }}
        >
          <div className="eyebrow" style={{ marginBottom: 14 }}>
            <span className="dot" />
            Per-practice execution
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {BL_EDA_RUNNING.map((p) => {
              const icon =
                p.status === 'completed' ? (
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 12,
                    }}
                  >
                    ✓
                  </span>
                ) : p.status === 'running' ? (
                  <Spinner size={11} />
                ) : (
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 12,
                    }}
                  >
                    ○
                  </span>
                )
              const col =
                p.status === 'completed'
                  ? 'var(--jade-deep)'
                  : p.status === 'running'
                    ? 'var(--indigo)'
                    : 'var(--ink-mute)'
              return (
                <div
                  key={p.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 10px',
                    borderRadius: 8,
                    background:
                      p.status === 'running'
                        ? 'oklch(0.94 0.05 260)'
                        : 'transparent',
                  }}
                >
                  <span
                    style={{
                      width: 18,
                      color: col,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 12,
                    }}
                  >
                    {icon}
                  </span>
                  <span style={{ flex: 1, fontSize: 13, color: 'var(--ink-2)' }}>
                    {p.name}
                  </span>
                  <span
                    className="num"
                    style={{
                      fontSize: 11,
                      color: 'var(--ink-mute)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {p.findings > 0 ? `${p.findings} findings` : ''}
                  </span>
                </div>
              )
            })}
          </div>
          <div
            style={{
              marginTop: 16,
              padding: 12,
              borderTop: '1px solid var(--line-soft)',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--ink-mute)',
              letterSpacing: '0.04em',
            }}
          >
            Send() fan-out · 10 practices · 2 concurrent
          </div>
        </div>
      </div>
    </div>
  )
}

function FindingRow({
  f,
  open,
  onToggle,
}: {
  f: MockFinding
  open: boolean
  onToggle: () => void
}) {
  return (
    <div
      className="card"
      style={{
        padding: 0,
        overflow: 'hidden',
        borderColor: open ? 'var(--line)' : 'var(--line-soft)',
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
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: 16,
            alignItems: 'flex-start',
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <SeverityDot sev={f.severity} />
              <Pill kind="ink">{f.practice}</Pill>
              <span
                className="num"
                style={{ color: 'var(--ink-mute)', fontSize: 11 }}
              >
                {f.id}
              </span>
            </div>
            <div
              style={{
                fontSize: 14.5,
                color: 'var(--ink)',
                lineHeight: 1.45,
                fontWeight: 500,
              }}
            >
              {f.title}
            </div>
            <div
              style={{
                display: 'flex',
                gap: 22,
                marginTop: 12,
                fontSize: 12,
                color: 'var(--ink-soft)',
              }}
            >
              <span>
                <b style={{ color: 'var(--ink-2)' }} className="num">
                  {f.affected.toLocaleString()}
                </b>{' '}
                affected
              </span>
              <span>
                <b style={{ color: 'var(--ink-2)' }} className="num">
                  {f.hours}
                </b>{' '}
                hrs
              </span>
              <span>
                <b style={{ color: 'var(--terra)' }} className="num">
                  {f.dollars}
                </b>{' '}
                exposure
              </span>
              <span style={{ color: 'var(--ink-mute)' }}>
                ← {f.rules.join(', ')}
              </span>
            </div>
          </div>
          <span
            style={{
              color: 'var(--ink-mute)',
              fontSize: 14,
              paddingTop: 8,
            }}
          >
            {open ? '▾' : '▸'}
          </span>
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
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 24,
            }}
          >
            <div>
              <div className="eyebrow" style={{ marginBottom: 8 }}>
                Discussion
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: 'var(--ink-2)',
                  lineHeight: 1.55,
                  margin: 0,
                }}
              >
                {f.discussion}
              </p>
            </div>
            <div>
              <div className="eyebrow" style={{ marginBottom: 8 }}>
                Evidence trail
              </div>
              <div
                className="num"
                style={{
                  fontSize: 12,
                  color: 'var(--ink-soft)',
                  lineHeight: 1.9,
                }}
              >
                ↳ {f.rules.length} source rule(s)
                <br />
                ↳ {f.affected.toLocaleString()} matched rows
                <br />
                ↳ aggregated across{' '}
                {f.practice === 'Overtime' ? '9 markets' : '3 markets'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
            <button className="btn accent sm">Download evidence ↓</button>
            <button className="btn sm">Open in deep-dive</button>
            <button className="btn sm">Add to executive brief</button>
          </div>
        </div>
      )}
    </div>
  )
}

function fmtCost(n: number): string {
  if (n === 0) return '$0'
  const sign = n < 0 ? '−' : '+'
  const abs = Math.abs(n)
  if (abs >= 1000000) return `${sign}$${(abs / 1000000).toFixed(2).replace(/\.00$/, '')}M`
  if (abs >= 1000) return `${sign}$${(abs / 1000).toFixed(0)}K`
  return `${sign}$${abs.toLocaleString()}`
}

function fmtNum(n: number): string {
  if (n === 0) return '0'
  const sign = n < 0 ? '−' : '+'
  return `${sign}${Math.abs(n).toLocaleString()}`
}
