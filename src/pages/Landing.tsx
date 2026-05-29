import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Logo from '@/components/Logo'

const NAV_SECTIONS = [
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'subgraphs', label: 'Agents' },
  { id: 'evidence', label: 'Evidence' },
  { id: 'review', label: 'Review' },
]

function smoothTo(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  window.scrollTo({ top: el.offsetTop - 72, behavior: 'smooth' })
}

function NavBar() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        background: scrolled ? 'color-mix(in oklch, var(--bg) 82%, transparent)' : 'transparent',
        borderBottom: scrolled ? '1px solid var(--line-soft)' : '1px solid transparent',
        transition: 'all 200ms ease',
      }}
    >
      <div
        style={{
          maxWidth: 1320,
          margin: '0 auto',
          padding: '20px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Logo />
        <nav style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          {NAV_SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => smoothTo(s.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--ink-2)',
                fontSize: 14,
                fontWeight: 400,
                cursor: 'pointer',
                padding: 0,
                fontFamily: 'var(--font-sans)',
              }}
            >
              {s.label}
            </button>
          ))}
        </nav>
        <Link to="/run-setup" className="btn primary sm">
          Open platform →
        </Link>
      </div>
    </header>
  )
}

function HeroVisual() {
  const threads = [
    { cols: [{ c: 'var(--ink)', f: 1.4 }, { c: 'var(--jade)', f: 0.9 }, { c: 'var(--terra)', f: 1.1 }, { c: 'var(--ink)', f: 0.7 }] },
    { cols: [{ c: 'var(--jade-soft)', f: 0.9 }, { c: 'var(--jade-deep)', f: 1.3 }, { c: 'var(--terra-soft)', f: 0.6 }, { c: 'var(--amber)', f: 0.7 }, { c: 'var(--ink)', f: 1.1 }] },
    { cols: [{ c: 'var(--terra)', f: 1.4 }, { c: 'var(--jade)', f: 1.1 }, { c: 'var(--ink)', f: 0.6 }] },
    { cols: [{ c: 'var(--ink)', f: 0.7 }, { c: 'var(--amber)', f: 0.5 }, { c: 'var(--jade-deep)', f: 1.4 }, { c: 'var(--terra)', f: 1.0 }] },
  ]

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 24,
        paddingLeft: 24,
      }}
    >
      {threads.map((t, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            height: 80,
            borderRadius: 999,
            overflow: 'hidden',
            boxShadow: '0 28px 60px -28px rgba(26,24,20,0.30), 0 2px 6px rgba(26,24,20,0.06)',
            animation: `hxFloat${(i % 3) + 1} ${7 + i}s ease-in-out infinite`,
            animationDelay: `${i * 0.5}s`,
          }}
        >
          {t.cols.map((c, j) => (
            <div key={j} style={{ flex: c.f, background: c.c }} />
          ))}
        </div>
      ))}
      <div
        style={{
          position: 'absolute',
          bottom: -28,
          left: 24,
          right: 0,
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: 'var(--font-mono)',
          fontSize: 10.5,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--ink-mute)',
        }}
      >
        <span>evidence threads · stage 01 → 08</span>
        <span>run R-2026-0312</span>
      </div>
    </div>
  )
}

function Hero() {
  return (
    <section style={{ padding: '56px 56px 112px' }}>
      <div
        style={{
          maxWidth: 1320,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1.05fr 0.95fr',
          gap: 56,
          alignItems: 'center',
        }}
      >
        <div>
          <div className="eyebrow" style={{ marginBottom: 28 }}>
            <span className="dot" />
            Agentic intelligence · v2.6 Spectrum
          </div>
          <h1 className="display" style={{ margin: 0 }}>
            Workforce pay,
            <br />
            <em>understood</em> end‑to‑end.
          </h1>
          <p
            style={{
              fontSize: 19,
              color: 'var(--ink-soft)',
              lineHeight: 1.55,
              marginTop: 32,
              maxWidth: 520,
              textWrap: 'pretty',
            }}
          >
            HealthX turns policy documents, CBAs, payroll, and timekeeping into evidence-backed
            findings, deep-dive reports, and grounded answers. Five specialist agents, one durable
            run, every claim cited.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 36, alignItems: 'center' }}>
            <Link to="/run-setup" className="btn primary" style={{ padding: '14px 22px', fontSize: 15 }}>
              Open the platform →
            </Link>
            <button
              className="btn"
              onClick={() => smoothTo('pipeline')}
              style={{ padding: '14px 22px', fontSize: 15 }}
            >
              Read the architecture
            </button>
          </div>
          <div style={{ display: 'flex', gap: 28, marginTop: 36, flexWrap: 'wrap' }}>
            {['Document-grounded answers', 'Human-in-the-loop review gates', 'Durable LangGraph orchestration'].map(
              (t) => (
                <div
                  key={t}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 13,
                    color: 'var(--ink-soft)',
                  }}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--jade)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {t}
                </div>
              )
            )}
          </div>
        </div>
        <div style={{ height: 520, position: 'relative' }}>
          <HeroVisual />
        </div>
      </div>
    </section>
  )
}

function PipelineSection() {
  const stages = [
    { id: 'setup', label: 'Run Setup', icon: '01', note: 'Inputs & sources' },
    { id: 'data', label: 'Data & DQ', icon: '02', note: 'Profile + quality' },
    { id: 'docs', label: 'Documents & Rules', icon: '03', note: 'Extract business logic' },
    { id: 'gates', label: 'Review Gates', icon: '04', note: 'Human-in-the-loop' },
    { id: 'findings', label: 'BL-EDA Findings', icon: '05', note: 'By severity' },
    { id: 'ask', label: 'Ask Documents', icon: '06', note: 'Document RAG' },
    { id: 'reports', label: 'Reports', icon: '07', note: 'Deep-dive + Exec' },
    { id: 'status', label: 'Status Chat', icon: '08', note: 'Run telemetry' },
  ]

  return (
    <section id="pipeline" style={{ padding: '96px 56px', borderTop: '1px solid var(--line-soft)' }}>
      <div style={{ maxWidth: 1320, margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.3fr',
            gap: 56,
            alignItems: 'end',
            marginBottom: 56,
          }}
        >
          <div>
            <div className="eyebrow" style={{ marginBottom: 24 }}>
              <span className="dot" />
              01 — Pipeline
            </div>
            <h2 className="h2" style={{ margin: 0 }}>
              One run.
              <br />
              <em>One source of truth.</em>
            </h2>
          </div>
          <p
            style={{
              fontSize: 17,
              color: 'var(--ink-soft)',
              lineHeight: 1.55,
              margin: 0,
              maxWidth: 540,
              textWrap: 'pretty',
            }}
          >
            Eight stages run left-to-right against a single execution ledger. Each stage exposes
            its state, artifacts, and review surface in its own page. No polling, no run selector,
            one active run at a time.
          </p>
        </div>

        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--line-soft)',
            borderRadius: 'var(--r-4)',
            padding: 28,
            boxShadow: 'var(--shadow-2)',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${stages.length}, 1fr)`, gap: 0 }}>
            {stages.map((s, i) => (
              <div
                key={s.id}
                style={{
                  padding: '20px 14px',
                  borderRight: i < stages.length - 1 ? '1px dashed var(--line)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 168,
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: 'var(--ink-mute)',
                    letterSpacing: '0.14em',
                    marginBottom: 18,
                  }}
                >
                  {s.icon}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 19,
                    lineHeight: 1.15,
                    letterSpacing: '-0.005em',
                    marginBottom: 10,
                    textWrap: 'balance',
                    color: 'var(--ink)',
                  }}
                >
                  {s.label}
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', lineHeight: 1.5, marginTop: 'auto' }}>
                  {s.note}
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: 24,
              padding: '14px 20px',
              background: 'var(--bg-soft)',
              borderRadius: 'var(--r-2)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontFamily: 'var(--font-mono)',
              fontSize: 11.5,
              color: 'var(--ink-soft)',
              letterSpacing: '0.06em',
            }}
          >
            <span>
              <span
                style={{
                  display: 'inline-block',
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'var(--jade)',
                  marginRight: 10,
                  verticalAlign: 1,
                  animation: 'hxPulse 1.8s ease-in-out infinite',
                }}
              />
              RUNTIME · LangGraph orchestration · 5 fan-out points · durable checkpoints
            </span>
            <span style={{ color: 'var(--ink-mute)' }}>~12 min typical · resumable</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function SubgraphsSection() {
  const graphs = [
    { n: '01', name: 'validation_and_bl_eda', role: 'Owner of the run', body: 'Owns the full lifecycle from intake through evidence persistence. Five Send() fan-out points: tables, documents, rules (mapping), rules (normalization), pay practices.', mutates: true },
    { n: '02', name: 'document_rag', role: 'Grounded answers', body: 'Read-only Q&A over the processed corpus. Resolves scope, retrieves chunks, reranks, packs, generates, verifies citations, persists query audit.', mutates: false },
    { n: '03', name: 'status_chat', role: 'Operational truth', body: 'Deterministic ledger queries. No LLM generation. Maps five MECE buttons to fetches over the execution ledger, stage progress, and artifact registry.', mutates: false },
    { n: '04', name: 'deep_dive_report', role: 'Evidence narrative', body: 'Builds the full HTML evidence report from BL-EDA artifacts. Methods, per-practice findings, cross-practice analysis, discussion questions, evidence appendix.', mutates: true },
    { n: '05', name: 'executive_report', role: 'Decision narrative', body: 'Compresses validated deep-dive evidence into a decision-oriented HTML report: top decision areas, recommendation options, impacts, risks, next 30 days.', mutates: true },
  ]

  return (
    <section id="subgraphs" style={{ padding: '96px 56px', borderTop: '1px solid var(--line-soft)' }}>
      <div style={{ maxWidth: 1320, margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.3fr',
            gap: 56,
            alignItems: 'end',
            marginBottom: 56,
          }}
        >
          <div>
            <div className="eyebrow" style={{ marginBottom: 24 }}>
              <span className="dot" />
              02 — Agents
            </div>
            <h2 className="h2" style={{ margin: 0 }}>
              Five specialist
              <br />
              <em>subgraphs.</em>
            </h2>
          </div>
          <p
            style={{
              fontSize: 17,
              color: 'var(--ink-soft)',
              lineHeight: 1.55,
              margin: 0,
              maxWidth: 540,
              textWrap: 'pretty',
            }}
          >
            Each graph owns its authority, its state contract, and its risk profile. Status chat and
            document RAG never mutate analysis state. Report graphs never re-derive evidence. The
            boundary is the design.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 0,
            border: '1px solid var(--line)',
            borderRadius: 'var(--r-3)',
            overflow: 'hidden',
            background: 'var(--bg-card)',
          }}
        >
          {graphs.map((g, i) => (
            <div
              key={g.name}
              style={{
                padding: '28px 22px',
                borderRight: i < graphs.length - 1 ? '1px solid var(--line-soft)' : 'none',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 320,
              }}
            >
              <div
                className="num"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: 'var(--ink-mute)',
                  letterSpacing: '0.14em',
                  marginBottom: 18,
                }}
              >
                {g.n}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  color: 'var(--ink)',
                  letterSpacing: '0.02em',
                  marginBottom: 6,
                  wordBreak: 'break-word',
                }}
              >
                {g.name}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 22,
                  fontStyle: 'italic',
                  color: 'var(--jade-deep)',
                  letterSpacing: '-0.01em',
                  marginBottom: 16,
                  lineHeight: 1.15,
                }}
              >
                {g.role}
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: 'var(--ink-soft)',
                  lineHeight: 1.55,
                  margin: 0,
                  flex: 1,
                  textWrap: 'pretty',
                }}
              >
                {g.body}
              </p>
              <div
                style={{
                  marginTop: 20,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10.5,
                  color: g.mutates ? 'var(--terra)' : 'var(--jade-deep)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                {g.mutates ? 'mutates state' : 'read-only'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function EvidenceSection() {
  return (
    <section id="evidence" style={{ padding: '96px 56px', borderTop: '1px solid var(--line-soft)' }}>
      <div style={{ maxWidth: 1320, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 80, alignItems: 'center' }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 24 }}>
              <span className="dot" />
              03 — Evidence
            </div>
            <h2 className="h2" style={{ margin: 0 }}>
              Every finding
              <br />
              <em>traces home.</em>
            </h2>
            <p
              style={{
                fontSize: 17,
                color: 'var(--ink-soft)',
                lineHeight: 1.55,
                marginTop: 24,
                maxWidth: 460,
                textWrap: 'pretty',
              }}
            >
              Findings link back to rule IDs, cited document sections, and the structured-data rows
              that triggered them. Auditable from the executive memo down to the punch-level row.
            </p>
            <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
              {[
                ['Citation coverage', '100%'],
                ['Source-row trace', 'punch-level'],
                ['Discoverable practices', 'runtime'],
              ].map(([k, v]) => (
                <div key={k}>
                  <div
                    className="num"
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 36,
                      letterSpacing: '-0.02em',
                      color: 'var(--ink)',
                    }}
                  >
                    {v}
                  </div>
                  <div className="eyebrow" style={{ marginTop: 6 }}>
                    {k}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--line-soft)',
              borderRadius: 'var(--r-3)',
              padding: 28,
              boxShadow: 'var(--shadow-2)',
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 22,
                paddingBottom: 16,
                borderBottom: '1px solid var(--line-soft)',
              }}
            >
              <span style={{ color: 'var(--ink)', fontWeight: 500 }}>F-0142 · Critical</span>
              <span className="pill err" style={{ color: 'oklch(0.4 0.16 25)', background: 'oklch(0.95 0.05 25)', borderColor: 'transparent' }}>
                <span className="dot" />$1.42M exposure
              </span>
            </div>
            <div
              style={{
                color: 'var(--ink-2)',
                lineHeight: 1.6,
                fontFamily: 'var(--font-sans)',
                fontSize: 14,
                marginBottom: 24,
              }}
            >
              "VTO/VTU/MTO/MTU counted as worked hours toward OT threshold at St. Vincent Toledo."
            </div>

            <div className="eyebrow" style={{ marginBottom: 14 }}>
              Evidence trail
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                ['R-0017', 'Toledo CBA §4.3 · p.27', 'verified'],
                ['R-0023', 'Central Pay Policy §2.1 · p.4', 'verified'],
                ['21,440', 'payroll_v3 matched rows', 'data'],
                ['1,428', 'employees affected', 'data'],
              ].map(([k, v, kind]) => (
                <div
                  key={k}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '78px 1fr auto',
                    gap: 12,
                    alignItems: 'center',
                    paddingLeft: 14,
                    borderLeft: '2px solid var(--jade)',
                  }}
                >
                  <span style={{ color: 'var(--ink)' }}>{k}</span>
                  <span style={{ color: 'var(--ink-soft)' }}>{v}</span>
                  <span
                    style={{
                      fontSize: 10,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: kind === 'data' ? 'var(--ink-mute)' : 'var(--jade-deep)',
                    }}
                  >
                    {kind}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ReviewSection() {
  return (
    <section id="review" style={{ padding: '96px 56px', borderTop: '1px solid var(--line-soft)' }}>
      <div style={{ maxWidth: 1320, margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.3fr',
            gap: 56,
            alignItems: 'end',
            marginBottom: 56,
          }}
        >
          <div>
            <div className="eyebrow" style={{ marginBottom: 24 }}>
              <span className="dot" />
              04 — Review
            </div>
            <h2 className="h2" style={{ margin: 0 }}>
              Human gates,
              <br />
              <em>by design.</em>
            </h2>
          </div>
          <p
            style={{
              fontSize: 17,
              color: 'var(--ink-soft)',
              lineHeight: 1.55,
              margin: 0,
              maxWidth: 540,
              textWrap: 'pretty',
            }}
          >
            Two review gates pause the graph at high-stakes transitions: before BL-EDA execution,
            and before reports are marked executive-ready. Every decision carries notes, a
            timestamp, and an actor.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <GateMini
            n="GATE 01"
            title="BL Mapping Review"
            status="Approved"
            statusKind="ok"
            guards="Guards BL-EDA execution."
            line1="3 rules flagged · 5 low-confidence mappings"
            line2="m.singh · 11:04:22 · 3 mappings corrected"
          />
          <GateMini
            n="GATE 02"
            title="Report QA Review"
            status="Pending"
            statusKind="warn"
            guards="Guards executive-ready report status."
            line1="awaiting BL-EDA persistence completion"
            line2="next: render deep-dive, then promote on approval"
          />
        </div>
      </div>
    </section>
  )
}

function GateMini({
  n,
  title,
  status,
  statusKind,
  guards,
  line1,
  line2,
}: {
  n: string
  title: string
  status: string
  statusKind: 'ok' | 'warn' | 'err' | 'run' | 'default' | 'ink'
  guards: string
  line1: string
  line2: string
}) {
  return (
    <div className="card" style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div className="num" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-mute)', letterSpacing: '0.14em' }}>
          {n}
        </div>
        <span className={`pill ${statusKind}`}>
          <span className="dot" />{status}
        </span>
      </div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 28, margin: 0, letterSpacing: '-0.01em', fontWeight: 400 }}>
        {title}
      </h3>
      <p style={{ color: 'var(--ink-soft)', fontSize: 14, lineHeight: 1.55, marginTop: 8, marginBottom: 20 }}>
        {guards}
      </p>

      <div
        style={{
          padding: '14px 16px',
          background: 'var(--bg-soft)',
          borderRadius: 10,
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          lineHeight: 1.9,
          color: 'var(--ink-2)',
        }}
      >
        <div>↳ {line1}</div>
        <div style={{ color: 'var(--ink-mute)' }}>↳ {line2}</div>
      </div>
    </div>
  )
}

function RuntimeStrip() {
  const stats = [
    { v: '8', l: 'Pipeline stages' },
    { v: '5', l: 'Specialist subgraphs' },
    { v: '5', l: 'Send() fan-out points' },
    { v: '18', l: 'Pay practices supported' },
    { v: '12 min', l: 'Typical run time' },
  ]
  return (
    <section style={{ padding: '0 56px' }}>
      <div style={{ maxWidth: 1320, margin: '0 auto' }}>
        <div
          style={{
            background: 'var(--ink)',
            color: 'var(--bg)',
            borderRadius: 'var(--r-4)',
            padding: '56px 48px',
            display: 'grid',
            gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
            gap: 24,
          }}
        >
          {stats.map((s, i) => (
            <div
              key={s.l}
              style={{
                borderLeft: i > 0 ? '1px solid rgba(243,238,229,0.16)' : 'none',
                paddingLeft: i > 0 ? 24 : 0,
              }}
            >
              <div
                className="num"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 56,
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                  fontWeight: 400,
                }}
              >
                {s.v}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'rgba(243,238,229,0.6)',
                  marginTop: 18,
                }}
              >
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FinalCTA() {
  return (
    <section style={{ padding: '120px 56px' }}>
      <div style={{ maxWidth: 880, margin: '0 auto', textAlign: 'center' }}>
        <h2
          className="display"
          style={{ margin: 0, fontSize: 'clamp(40px, 6vw, 76px)', textWrap: 'balance' }}
        >
          A live run is loaded.
          <br />
          <em>Open it.</em>
        </h2>
        <p
          style={{
            fontSize: 17,
            color: 'var(--ink-soft)',
            maxWidth: 560,
            margin: '28px auto 36px',
            lineHeight: 1.55,
            textWrap: 'pretty',
          }}
        >
          The platform demo carries a real BSMH-shaped engagement at the BL-EDA execution stage.
          Step through every screen end to end — Run Setup through Status Chat.
        </p>
        <Link to="/run-setup" className="btn primary" style={{ padding: '14px 24px', fontSize: 15 }}>
          Open the platform →
        </Link>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer style={{ padding: '48px 56px 56px', borderTop: '1px solid var(--line-soft)', background: 'var(--bg-soft)' }}>
      <div
        style={{
          maxWidth: 1320,
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          gap: 32,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ maxWidth: 360 }}>
          <Logo />
          <p
            style={{
              color: 'var(--ink-soft)',
              fontSize: 13,
              marginTop: 14,
              lineHeight: 1.6,
              textWrap: 'pretty',
            }}
          >
            The agentic intelligence layer for healthcare workforce operations. Evidence-first by
            construction.
          </p>
        </div>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--ink-mute)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            textAlign: 'right',
            lineHeight: 2,
          }}
        >
          <div>© 2026 HealthX Labs</div>
          <div>v2.6 · build 2026.05.29</div>
          <div>SOC 2 Type II · HIPAA-aligned</div>
        </div>
      </div>
    </footer>
  )
}

export default function Landing() {
  return (
    <div>
      <NavBar />
      <Hero />
      <PipelineSection />
      <SubgraphsSection />
      <EvidenceSection />
      <ReviewSection />
      <RuntimeStrip />
      <FinalCTA />
      <Footer />
    </div>
  )
}
