import { Link, useLocation } from 'react-router-dom'
import Logo from './Logo'
import Pill from './Pill'

const PIPELINE_STAGES = [
  { id: 'setup', label: 'Run Setup', icon: '01', route: '/run-setup', note: 'Inputs & weights' },
  { id: 'data', label: 'Data & DQ', icon: '02', route: '/data-dq', note: 'Profile + quality' },
  { id: 'docs', label: 'Documents & Rules', icon: '03', route: '/documents-rules', note: 'Extract business logic' },
  { id: 'gates', label: 'Review Gates', icon: '04', route: '/review-gates', note: 'Human-in-the-loop' },
  { id: 'findings', label: 'BL-EDA Findings', icon: '05', route: '/findings', note: 'Materiality-ranked' },
  { id: 'ask', label: 'Ask Documents', icon: '06', route: '/ask-documents', note: 'Document RAG' },
  { id: 'reports', label: 'Reports', icon: '07', route: '/reports', note: 'Deep-dive + Exec' },
  { id: 'status', label: 'Status Chat', icon: '08', route: '/status', note: 'Run telemetry' },
]

const STAGE_STATUS: Record<string, string> = {
  setup: 'ok',
  data: 'ok',
  docs: 'ok',
  gates: 'ok',
  findings: 'run',
  ask: 'ok',
  reports: 'idle',
  status: 'idle',
}

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '260px 1fr',
        minHeight: '100vh',
        background: 'var(--bg)',
      }}
    >
      <SideRail currentRoute={location.pathname} />
      <main style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <TopBar currentRoute={location.pathname} />
        <div style={{ padding: '28px 36px 80px', flex: 1 }}>{children}</div>
      </main>
    </div>
  )
}

function SideRail({ currentRoute }: { currentRoute: string }) {
  return (
    <aside
      style={{
        borderRight: '1px solid var(--line-soft)',
        background: 'var(--bg-soft)',
        padding: '20px 0',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ padding: '0 20px 20px', borderBottom: '1px solid var(--line-soft)' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Logo />
        </Link>
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Pill kind="run" dot>
            RUN ACTIVE
          </Pill>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-mute)' }}>
            R-2026-0312
          </span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 8, fontFamily: 'var(--font-mono)' }}>
          BSMH · Pay Consistency
        </div>
      </div>

      <nav style={{ padding: '16px 12px', flex: 1 }}>
        <div className="eyebrow" style={{ padding: '8px 10px 12px' }}>
          Pipeline
        </div>
        {PIPELINE_STAGES.map((s) => {
          const active = s.route === currentRoute
          return (
            <Link
              key={s.id}
              to={s.route}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                width: '100%',
                padding: '10px 12px',
                background: active ? 'var(--bg-card)' : 'transparent',
                border: '1px solid ' + (active ? 'var(--line)' : 'transparent'),
                borderRadius: 10,
                color: active ? 'var(--ink)' : 'var(--ink-2)',
                fontSize: 13.5,
                fontWeight: active ? 500 : 400,
                textAlign: 'left',
                marginBottom: 2,
                cursor: 'pointer',
                transition: 'background 100ms',
                fontFamily: 'var(--font-sans)',
                textDecoration: 'none',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: 'var(--ink-mute)',
                  width: 18,
                }}
              >
                {s.icon}
              </span>
              <span style={{ flex: 1 }}>{s.label}</span>
              <StageDot id={s.id} />
            </Link>
          )
        })}
      </nav>

      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--line-soft)', fontSize: 12, color: 'var(--ink-soft)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: 'var(--terra)',
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 500,
            }}
          >
            MS
          </span>
          <span>M. Singh</span>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-mute)', letterSpacing: '0.06em' }}>
          Analytics · admin
        </div>
      </div>
    </aside>
  )
}

function StageDot({ id }: { id: string }) {
  const k = STAGE_STATUS[id] || 'idle'
  const color = k === 'ok' ? 'var(--jade)' : k === 'run' ? 'var(--indigo)' : 'var(--ink-mute)'
  return (
    <span
      style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: color,
        animation: k === 'run' ? 'hxPulse 1.4s ease-in-out infinite' : 'none',
      }}
    />
  )
}

function TopBar({ currentRoute }: { currentRoute: string }) {
  const meta = PIPELINE_STAGES.find((s) => s.route === currentRoute)
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '18px 36px',
        borderBottom: '1px solid var(--line-soft)',
        background: 'color-mix(in oklch, var(--bg) 92%, transparent)',
        backdropFilter: 'blur(8px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        gap: 24,
      }}
    >
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 11,
            color: 'var(--ink-mute)',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}
        >
          <span>Run R-2026-0312</span>
          <span style={{ color: 'var(--line)' }}>/</span>
          <span>
            Stage {meta?.icon} of 08
          </span>
          <span style={{ color: 'var(--line)' }}>/</span>
          <span style={{ color: 'var(--jade-deep)' }}>BL-EDA executing</span>
        </div>
        <h1
          style={{
            margin: '4px 0 0',
            fontFamily: 'var(--font-display)',
            fontSize: 30,
            fontWeight: 400,
            letterSpacing: '-0.015em',
            lineHeight: 1.1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {meta?.label}
        </h1>
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexShrink: 0 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-mute)', letterSpacing: '0.06em' }}>
          updated 11:05:01
        </span>
        <button className="btn ghost sm" title="Manual refresh — no polling enabled">
          ↻ Refresh
        </button>
      </div>
    </div>
  )
}
