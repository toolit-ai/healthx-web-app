import { useState } from 'react'
import StatusBadge from '@/components/StatusBadge'
import Pill from '@/components/Pill'
import { getDocuments, RULES_FOR_DOC } from '@/api/mock'

interface MockRule {
  id: string
  text: string
  type: string
  practice: string
  citation: string
  confidence: string
  concepts: string[]
  tables: string[]
}

const RULES: MockRule[] = RULES_FOR_DOC as MockRule[]

export default function DocumentsAndRules() {
  const docs = getDocuments()
  const [selectedId, setSelectedId] = useState(docs[0]?.document_id || '')
  const selectedDoc = docs.find((d) => d.document_id === selectedId)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24 }}>
      {/* Left — document list */}
      <div
        className="card"
        style={{
          padding: 0,
          overflow: 'hidden',
          maxHeight: '78vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ padding: 16, borderBottom: '1px solid var(--line-soft)' }}>
          <div className="eyebrow" style={{ marginBottom: 6 }}>
            Corpus · 14 documents
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
            13 extracted · 1 OCR · 0 failed
          </div>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {docs.map((d) => {
            const active = d.document_id === selectedId
            return (
              <button
                key={d.document_id}
                onClick={() => setSelectedId(d.document_id)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px 16px',
                  background: active ? 'var(--bg-soft)' : 'transparent',
                  borderLeft: '3px solid ' + (active ? 'var(--jade)' : 'transparent'),
                  border: 'none',
                  borderBottom: '1px solid var(--line-soft)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                <div
                  className="num"
                  style={{
                    fontSize: 12.5,
                    color: 'var(--ink)',
                    marginBottom: 6,
                    fontWeight: active ? 500 : 400,
                    wordBreak: 'break-word',
                  }}
                >
                  {d.filename}
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: 6,
                    alignItems: 'center',
                    flexWrap: 'wrap',
                  }}
                >
                  <StatusBadge status={d.status} />
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10.5,
                      color: 'var(--ink-mute)',
                    }}
                  >
                    {d.chunk_count} chunks · {d.rule_count} rules
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Right — selected doc + rules */}
      <div>
        {selectedDoc && (
          <div className="card" style={{ padding: 28, marginBottom: 16 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 20,
              }}
            >
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="eyebrow" style={{ marginBottom: 8 }}>
                  Selected document
                </div>
                <div
                  className="num"
                  style={{
                    fontSize: 18,
                    color: 'var(--ink)',
                    fontWeight: 500,
                    wordBreak: 'break-all',
                    lineHeight: 1.3,
                  }}
                >
                  {selectedDoc.filename}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button className="btn sm">Open in viewer ↗</button>
                <button className="btn sm">Re-run extraction</button>
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                gap: 24,
                marginTop: 22,
                paddingTop: 18,
                borderTop: '1px solid var(--line-soft)',
                fontSize: 13,
                color: 'var(--ink-soft)',
                flexWrap: 'wrap',
              }}
            >
              <span>
                <b style={{ color: 'var(--ink)' }}>{selectedDoc.chunk_count}</b> chunks
              </span>
              <span>
                <b style={{ color: 'var(--ink)' }}>{selectedDoc.rule_count}</b> rules
                extracted
              </span>
              <span>
                <b style={{ color: 'var(--jade-deep)' }}>
                  {Math.round(selectedDoc.rule_count * 0.84)}
                </b>{' '}
                auto-mapped
              </span>
              <span>
                <b style={{ color: 'var(--terra)' }}>2</b> flagged for review
              </span>
            </div>
          </div>
        )}

        <div className="eyebrow" style={{ margin: '0 0 12px' }}>
          Extracted rules · {RULES.length} shown
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {RULES.map((r) => (
            <RuleCard key={r.id} rule={r} />
          ))}
        </div>

        <div
          className="card"
          style={{ padding: 22, marginTop: 24, background: 'var(--bg-soft)' }}
        >
          <div className="eyebrow" style={{ marginBottom: 12 }}>
            Review queue · 2 rules need attention
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
            R-0029 mapping is medium-confidence (governed concept ambiguous).
            Approve, correct mapping, or mark untestable from the review gate.
          </div>
        </div>
      </div>
    </div>
  )
}

function RuleCard({ rule }: { rule: MockRule }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: 'transparent',
          border: 'none',
          width: '100%',
          textAlign: 'left',
          padding: '18px 22px',
          cursor: 'pointer',
          fontFamily: 'var(--font-sans)',
        }}
      >
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <span
            className="num"
            style={{
              color: 'var(--ink-mute)',
              fontSize: 12,
              paddingTop: 3,
              minWidth: 60,
            }}
          >
            {rule.id}
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.5 }}>
              "{rule.text}"
            </div>
            <div
              style={{
                display: 'flex',
                gap: 6,
                marginTop: 12,
                flexWrap: 'wrap',
              }}
            >
              <Pill>{rule.type}</Pill>
              <Pill kind="ink">{rule.practice}</Pill>
              <StatusBadge status={rule.citation} />
              <StatusBadge status={rule.confidence} />
            </div>
          </div>
          <span style={{ color: 'var(--ink-mute)', fontSize: 14 }}>
            {open ? '▾' : '▸'}
          </span>
        </div>
      </button>
      {open ? (
        <div
          style={{
            padding: '0 22px 22px',
            borderTop: '1px solid var(--line-soft)',
            marginTop: -1,
            paddingTop: 18,
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 24,
              fontSize: 13,
            }}
          >
            <div>
              <div className="eyebrow" style={{ marginBottom: 8 }}>
                Governed concepts
              </div>
              <div
                className="num"
                style={{ color: 'var(--ink-2)', lineHeight: 1.8, whiteSpace: 'pre-line' }}
              >
                {rule.concepts.map((c) => `↳ ${c}`).join('\n')}
              </div>
            </div>
            <div>
              <div className="eyebrow" style={{ marginBottom: 8 }}>
                Candidate tables
              </div>
              <div
                className="num"
                style={{ color: 'var(--ink-2)', lineHeight: 1.8, whiteSpace: 'pre-line' }}
              >
                {rule.tables.map((t) => `↳ ${t}`).join('\n')}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
            <button className="btn sm">Flag for review</button>
            <button className="btn sm">Correct mapping</button>
            <button className="btn sm">Mark untestable</button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
