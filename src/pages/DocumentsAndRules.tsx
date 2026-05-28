import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import StatusBadge from '@/components/StatusBadge'
import Pill from '@/components/Pill'
import {
  flagRule,
  getDocumentDetail,
  getDocumentQuality,
  getDocumentSummary,
  getDocuments,
  getPayProvisionMetrics,
  getPayProvisions,
  getRulesForDocument,
  getStackingRules,
  getVariationObservations,
  submitRuleReviewDecision,
} from '@/api/client'
import { useActiveRun } from '@/hooks/useActiveRun'
import type { DocumentDetail, DocumentRecord, DocumentSummaryResponse, ExtractedRule, PayProvision, StackingRule, VariationObservation } from '@/types/api'

export default function DocumentsAndRules() {
  const { runId } = useActiveRun()
  const docsQ = useQuery({
    queryKey: ['documents', runId],
    queryFn: () => getDocuments(runId!),
    enabled: !!runId,
  })
  const docs: DocumentRecord[] = docsQ.data ?? []
  const [selectedId, setSelectedId] = useState<string>('')

  useEffect(() => {
    if (!selectedId && docs.length > 0) setSelectedId(docs[0].document_id)
  }, [docs, selectedId])

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

  const selectedDoc = docs.find((d) => d.document_id === selectedId)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <DocumentQualityStrip runId={runId} />
      <PayPolicySection runId={runId} />

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24 }}>
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
              Corpus · {docs.length} document{docs.length === 1 ? '' : 's'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
              {docs.filter((d) => d.status === 'processed').length} processed ·{' '}
              {docs.filter((d) => d.status === 'processing').length} processing ·{' '}
              {docs.filter((d) => d.status === 'failed').length} failed
            </div>
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {docsQ.isLoading ? (
              <div style={{ padding: 16, color: 'var(--ink-soft)', fontSize: 13 }}>Loading documents…</div>
            ) : docs.length === 0 ? (
              <div style={{ padding: 16, color: 'var(--ink-soft)', fontSize: 13 }}>
                No documents indexed yet. Ingestion may still be in progress.
              </div>
            ) : (
              docs.map((d) => {
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
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                      <StatusBadge status={d.status} />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink-mute)' }}>
                        {d.chunk_count} chunks · {d.rule_count} rules
                      </span>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        <div>
          {selectedDoc && (
            <div className="card" style={{ padding: 28, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20 }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="eyebrow" style={{ marginBottom: 8 }}>Selected document</div>
                  <div className="num" style={{ fontSize: 18, color: 'var(--ink)', fontWeight: 500, wordBreak: 'break-all', lineHeight: 1.3 }}>
                    {selectedDoc.filename}
                  </div>
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
                <span><b style={{ color: 'var(--ink)' }}>{selectedDoc.chunk_count}</b> chunks</span>
                <span><b style={{ color: 'var(--ink)' }}>{selectedDoc.rule_count}</b> rules extracted</span>
              </div>
            </div>
          )}

          {runId && selectedId && (
            <DocumentInsights key={selectedId} runId={runId} docId={selectedId} />
          )}

          {runId && selectedId ? (
            <RulesList runId={runId} docId={selectedId} />
          ) : (
            <div className="card" style={{ padding: 22, color: 'var(--ink-soft)', fontSize: 13 }}>
              Select a document to see extracted rules.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function DocumentQualityStrip({ runId }: { runId: string }) {
  const q = useQuery({
    queryKey: ['document-quality', runId],
    queryFn: () => getDocumentQuality(runId),
  })
  if (q.isLoading || !q.data) return null
  const d = q.data as Record<string, number>
  const items = [
    { label: 'Documents', value: d.document_count ?? d.total_documents ?? '—' },
    { label: 'Rules extracted', value: d.rule_count ?? d.total_rules ?? '—' },
    { label: 'Citation coverage', value: d.citation_coverage_pct != null ? `${Math.round(d.citation_coverage_pct * 100)}%` : '—' },
    { label: 'Need review', value: d.rules_requiring_review ?? '—' },
    { label: 'Rule conflicts', value: d.rule_conflict_count ?? '—' },
  ]
  return (
    <div
      style={{
        display: 'flex',
        gap: 0,
        background: 'var(--bg-card)',
        border: '1px solid var(--line-soft)',
        borderRadius: 10,
        overflow: 'hidden',
      }}
    >
      {items.map((it, i) => (
        <div
          key={it.label}
          style={{
            flex: 1,
            padding: '16px 20px',
            borderRight: i < items.length - 1 ? '1px solid var(--line-soft)' : 'none',
          }}
        >
          <div className="eyebrow" style={{ marginBottom: 4 }}>{it.label}</div>
          <div className="num" style={{ fontSize: 22, color: 'var(--ink)', fontWeight: 500 }}>{String(it.value)}</div>
        </div>
      ))}
    </div>
  )
}

function PayPolicySection({ runId }: { runId: string }) {
  const [open, setOpen] = useState(false)
  const [metric, setMetric] = useState<string>('')

  const metricsQ = useQuery({
    queryKey: ['pay-provision-metrics', runId],
    queryFn: () => getPayProvisionMetrics(runId),
    enabled: open,
  })
  const metrics: string[] = metricsQ.data ?? []

  useEffect(() => {
    if (metrics.length > 0 && !metric) setMetric(metrics[0])
  }, [metrics, metric])

  const provisionsQ = useQuery({
    queryKey: ['pay-provisions', runId, metric],
    queryFn: () => getPayProvisions(runId, metric),
    enabled: open && !!metric,
  })
  const stackingQ = useQuery({
    queryKey: ['stacking-rules', runId, metric],
    queryFn: () => getStackingRules(runId, metric),
    enabled: open && !!metric,
  })
  const variationQ = useQuery({
    queryKey: ['variation-observations', runId, metric],
    queryFn: () => getVariationObservations(runId, metric),
    enabled: open && !!metric,
  })

  const provisions: PayProvision[] = provisionsQ.data ?? []
  const stackingRules: StackingRule[] = stackingQ.data ?? []
  const variations: VariationObservation[] = variationQ.data ?? []

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 22px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'var(--font-sans)',
        }}
      >
        <span className="eyebrow">Pay Policy & CBA Provisions</span>
        <span style={{ color: 'var(--ink-mute)', fontSize: 14 }}>{open ? '▾' : '▸'}</span>
      </button>

      {open && (
        <div style={{ padding: '0 22px 22px', borderTop: '1px solid var(--line-soft)' }}>
          {metricsQ.isLoading ? (
            <div style={{ padding: '16px 0', color: 'var(--ink-soft)', fontSize: 13 }}>Loading metrics…</div>
          ) : metrics.length === 0 ? (
            <div style={{ padding: '16px 0', color: 'var(--ink-soft)', fontSize: 13 }}>
              No pay provisions extracted yet.
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
                <span className="eyebrow">Pay metric</span>
                <select
                  value={metric}
                  onChange={(e) => setMetric(e.target.value)}
                  style={{
                    fontSize: 13,
                    padding: '5px 10px',
                    border: '1px solid var(--line)',
                    borderRadius: 6,
                    background: 'var(--bg-card)',
                    color: 'var(--ink-2)',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  {metrics.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              {provisions.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div className="eyebrow" style={{ marginBottom: 10 }}>Provisions ({provisions.length})</div>
                  <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table className="hx" style={{ fontSize: 12 }}>
                      <thead>
                        <tr>
                          <th>Source</th>
                          <th>Authority</th>
                          <th>Market</th>
                          <th>Rate ×</th>
                          <th>Status</th>
                          <th>FLSA</th>
                        </tr>
                      </thead>
                      <tbody>
                        {provisions.map((p) => (
                          <tr key={p.provision_id} title={p.provision_text}>
                            <td className="num">{p.source_filename}</td>
                            <td>{p.policy_authority}</td>
                            <td>{p.market ?? '—'}</td>
                            <td className="num">{p.rate_multiplier != null ? `${p.rate_multiplier}×` : '—'}</td>
                            <td><StatusBadge status={p.provision_status} /></td>
                            <td style={{ color: p.flsa_concern ? 'oklch(0.45 0.18 25)' : 'var(--ink-mute)', fontSize: 11 }}>
                              {p.flsa_concern ? '⚠ concern' : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {stackingRules.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div className="eyebrow" style={{ marginBottom: 10 }}>Stacking rules ({stackingRules.length})</div>
                  <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table className="hx" style={{ fontSize: 12 }}>
                      <thead>
                        <tr>
                          <th>Premium A</th>
                          <th>Premium B</th>
                          <th>Relationship</th>
                          <th>Condition</th>
                          <th>Source</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stackingRules.map((s) => (
                          <tr key={s.stacking_rule_id}>
                            <td className="num">{s.premium_a}</td>
                            <td className="num">{s.premium_b}</td>
                            <td><Pill>{s.relationship}</Pill></td>
                            <td style={{ color: 'var(--ink-soft)', fontSize: 11 }}>{s.condition_text ?? '—'}</td>
                            <td className="num" style={{ color: 'var(--ink-soft)' }}>{s.source_filename}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {variations.length > 0 && (
                <div>
                  <div className="eyebrow" style={{ marginBottom: 10 }}>Variation observations ({variations.length})</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {variations.map((v) => (
                      <div key={v.observation_id} className="card" style={{ padding: 14 }}>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
                          <Pill kind={v.severity === 'high' ? 'err' : v.severity === 'medium' ? 'warn' : 'default'}>
                            {v.severity}
                          </Pill>
                          <Pill>{v.observation_type}</Pill>
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>{v.observation_text}</div>
                        {v.affected_markets.length > 0 && (
                          <div style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 6, fontFamily: 'var(--font-mono)' }}>
                            markets: {v.affected_markets.join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

function DocumentInsights({ runId, docId }: { runId: string; docId: string }) {
  const [tab, setTab] = useState<'Overview' | 'Content' | 'Rules'>('Overview')

  const detailQ = useQuery({
    queryKey: ['doc-detail', runId, docId],
    queryFn: () => getDocumentDetail(runId, docId),
  })

  const summaryQ = useQuery({
    queryKey: ['doc-summary', runId, docId],
    queryFn: () => getDocumentSummary(runId, docId),
    enabled: tab === 'Content',
  })

  const rulesQ = useQuery({
    queryKey: ['doc-rules', runId, docId],
    queryFn: () => getRulesForDocument(runId, docId),
  })
  const rules: ExtractedRule[] = rulesQ.data ?? []
  const detail: DocumentDetail | undefined = detailQ.data
  const summary: DocumentSummaryResponse | undefined = summaryQ.data

  const TABS = ['Overview', 'Content', 'Rules'] as const

  return (
    <div className="card" style={{ marginBottom: 16, overflow: 'hidden', padding: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--line-soft)', padding: '0 22px' }}>
        <span className="eyebrow" style={{ paddingTop: 14, paddingBottom: 14, marginRight: 20, flexShrink: 0 }}>
          Document Insights
        </span>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '14px 16px',
              background: 'transparent',
              border: 'none',
              borderBottom: tab === t ? '2px solid var(--jade)' : '2px solid transparent',
              marginBottom: -1,
              cursor: 'pointer',
              fontSize: 13,
              color: tab === t ? 'var(--ink)' : 'var(--ink-soft)',
              fontFamily: 'var(--font-sans)',
              fontWeight: tab === t ? 500 : 400,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div style={{ padding: 22 }}>
        {tab === 'Overview' && (
          detailQ.isLoading ? (
            <div style={{ color: 'var(--ink-soft)', fontSize: 13 }}>Loading…</div>
          ) : !detail ? (
            <div style={{ color: 'var(--ink-soft)', fontSize: 13 }}>No detail available.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', gap: 0, border: '1px solid var(--line-soft)', borderRadius: 8, overflow: 'hidden' }}>
                {([
                  { label: 'Pages', value: detail.page_count },
                  { label: 'Chunks', value: detail.chunk_count },
                  { label: 'Tables', value: detail.table_count },
                  { label: 'Rules', value: detail.rule_count },
                ] as Array<{ label: string; value: number }>).map((kpi, i, arr) => (
                  <div
                    key={kpi.label}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      borderRight: i < arr.length - 1 ? '1px solid var(--line-soft)' : 'none',
                    }}
                  >
                    <div className="eyebrow" style={{ marginBottom: 2, fontSize: 9 }}>{kpi.label}</div>
                    <div className="num" style={{ fontSize: 20, fontWeight: 500, color: 'var(--ink)' }}>{kpi.value}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <StatusBadge status={detail.status} />
                <Pill>{detail.document_type}</Pill>
                {detail.ocr_used && <Pill kind="warn">OCR</Pill>}
                {detail.llm_vision_used && <Pill>LLM vision</Pill>}
              </div>

              {(detail.market || detail.cba_subtype || detail.pay_practice_hint) && (
                <div style={{ fontSize: 12, color: 'var(--ink-soft)', fontFamily: 'var(--font-mono)', display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                  {detail.market && <span>market: <b style={{ color: 'var(--ink-2)' }}>{detail.market}</b></span>}
                  {detail.cba_subtype && <span>CBA: <b style={{ color: 'var(--ink-2)' }}>{detail.cba_subtype}</b></span>}
                  {detail.pay_practice_hint && <span>practice hint: <b style={{ color: 'var(--ink-2)' }}>{detail.pay_practice_hint}</b></span>}
                </div>
              )}

              {detail.processing_errors.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {detail.processing_errors.map((err, i) => (
                    <div
                      key={i}
                      style={{
                        fontSize: 12,
                        padding: '8px 12px',
                        background: 'oklch(0.97 0.02 60)',
                        border: '1px solid oklch(0.85 0.08 60)',
                        borderRadius: 6,
                        color: 'oklch(0.45 0.1 60)',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      ⚠ {err}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        )}

        {tab === 'Content' && (
          summaryQ.isLoading ? (
            <div style={{ color: 'var(--ink-soft)', fontSize: 13 }}>Loading summary…</div>
          ) : !summary || (!summary.prose_overview && !summary.key_points.length && !summary.notable_statements.length) ? (
            <div style={{ color: 'var(--ink-soft)', fontSize: 13 }}>No summary available for this document.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {summary.prose_overview && (
                <div>
                  <div className="eyebrow" style={{ marginBottom: 8 }}>Overview</div>
                  <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6, margin: 0 }}>
                    {summary.prose_overview}
                  </p>
                </div>
              )}
              {summary.key_points.length > 0 && (
                <div>
                  <div className="eyebrow" style={{ marginBottom: 8 }}>Key points</div>
                  <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {summary.key_points.map((pt, i) => (
                      <li key={i} style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>{pt}</li>
                    ))}
                  </ul>
                </div>
              )}
              {summary.notable_statements.length > 0 && (
                <div>
                  <div className="eyebrow" style={{ marginBottom: 8 }}>Notable statements</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {summary.notable_statements.map((stmt, i) => (
                      <div
                        key={i}
                        style={{
                          fontSize: 13,
                          padding: '10px 14px',
                          background: 'var(--bg-soft)',
                          borderLeft: '3px solid var(--jade)',
                          borderRadius: '0 6px 6px 0',
                          color: 'var(--ink-2)',
                          lineHeight: 1.5,
                        }}
                      >
                        {stmt}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        )}

        {tab === 'Rules' && (
          rulesQ.isLoading ? (
            <div style={{ color: 'var(--ink-soft)', fontSize: 13 }}>Loading…</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', gap: 0, border: '1px solid var(--line-soft)', borderRadius: 8, overflow: 'hidden' }}>
                {(() => {
                  const cited = rules.filter((r) => r.citation_status && r.citation_status !== 'missing' && r.citation_status !== '').length
                  const needReview = rules.filter((r) => r.requires_human_review).length
                  const typeCount = new Set(rules.map((r) => r.rule_type)).size
                  return ([
                    { label: 'Total', value: String(rules.length) },
                    { label: 'Cited', value: `${cited} / ${rules.length}` },
                    { label: 'Need review', value: String(needReview) },
                    { label: 'Rule types', value: String(typeCount) },
                  ] as Array<{ label: string; value: string }>).map((kpi, i, arr) => (
                    <div
                      key={kpi.label}
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        borderRight: i < arr.length - 1 ? '1px solid var(--line-soft)' : 'none',
                      }}
                    >
                      <div className="eyebrow" style={{ marginBottom: 2, fontSize: 9 }}>{kpi.label}</div>
                      <div className="num" style={{ fontSize: 18, fontWeight: 500, color: 'var(--ink)' }}>{kpi.value}</div>
                    </div>
                  ))
                })()}
              </div>

              {rules.length > 0 && (() => {
                const typeCounts = rules.reduce<Record<string, number>>((acc, r) => {
                  acc[r.rule_type] = (acc[r.rule_type] ?? 0) + 1
                  return acc
                }, {})
                return (
                  <div>
                    <div className="eyebrow" style={{ marginBottom: 10 }}>Rule types</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {Object.entries(typeCounts).map(([type, count]) => (
                        <span
                          key={type}
                          style={{
                            fontSize: 12,
                            padding: '4px 10px',
                            background: 'var(--bg-soft)',
                            border: '1px solid var(--line-soft)',
                            borderRadius: 20,
                            color: 'var(--ink-2)',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          {type} <b style={{ color: 'var(--ink)' }}>{count}</b>
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })()}

              {rules.length > 0 && (() => {
                const high = rules.filter((r) => r.confidence >= 0.8).length
                const med = rules.filter((r) => r.confidence >= 0.5 && r.confidence < 0.8).length
                const low = rules.filter((r) => r.confidence < 0.5).length
                return (
                  <div>
                    <div className="eyebrow" style={{ marginBottom: 10 }}>Confidence</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {[
                        { label: 'High (≥0.8)', value: high, color: 'var(--jade-deep)' },
                        { label: 'Medium', value: med, color: 'oklch(0.55 0.12 60)' },
                        { label: 'Low (<0.5)', value: low, color: 'oklch(0.45 0.18 25)' },
                      ].map((band) => (
                        <span
                          key={band.label}
                          style={{
                            fontSize: 12,
                            padding: '4px 10px',
                            background: 'var(--bg-soft)',
                            border: '1px solid var(--line-soft)',
                            borderRadius: 20,
                            color: band.color,
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          {band.label}: <b>{band.value}</b>
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })()}
            </div>
          )
        )}
      </div>
    </div>
  )
}

function RulesList({ runId, docId }: { runId: string; docId: string }) {
  const q = useQuery({
    queryKey: ['doc-rules', runId, docId],
    queryFn: () => getRulesForDocument(runId, docId),
  })
  const rules: ExtractedRule[] = q.data ?? []

  if (q.isLoading) {
    return <div className="card" style={{ padding: 22, color: 'var(--ink-soft)', fontSize: 13 }}>Loading rules…</div>
  }
  if (rules.length === 0) {
    return <div className="card" style={{ padding: 22, color: 'var(--ink-soft)', fontSize: 13 }}>No rules extracted from this document.</div>
  }

  return (
    <>
      <div className="eyebrow" style={{ margin: '0 0 12px' }}>
        Extracted rules · {rules.length} shown
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {rules.map((r) => (
          <RuleCard key={r.rule_id} rule={r} runId={runId} docId={docId} />
        ))}
      </div>
    </>
  )
}

function RuleCard({ rule, runId, docId }: { rule: ExtractedRule; runId: string; docId: string }) {
  const [open, setOpen] = useState(false)
  const [reviewAction, setReviewAction] = useState<'flag' | 'mapping_correction' | 'testability_override' | 'manual_approval' | null>(null)
  const [notes, setNotes] = useState('')
  const qc = useQueryClient()

  const flagMutation = useMutation({
    mutationFn: () => flagRule(runId, rule.rule_id, notes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['doc-rules', runId, docId] })
      setReviewAction(null)
      setNotes('')
    },
  })

  const decisionMutation = useMutation({
    mutationFn: () => submitRuleReviewDecision(
      runId,
      rule.rule_id,
      reviewAction as 'mapping_correction' | 'testability_override' | 'manual_approval',
      notes,
    ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['doc-rules', runId, docId] })
      setReviewAction(null)
      setNotes('')
    },
  })

  const handleSubmit = () => {
    if (reviewAction === 'flag') flagMutation.mutate()
    else decisionMutation.mutate()
  }

  const isPending = flagMutation.isPending || decisionMutation.isPending
  const mutError = flagMutation.error || decisionMutation.error

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
          <span className="num" style={{ color: 'var(--ink-mute)', fontSize: 12, paddingTop: 3, minWidth: 60 }}>
            {rule.rule_id}
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.5 }}>
              "{rule.rule_text}"
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
              <Pill>{rule.rule_type}</Pill>
              <StatusBadge status={rule.citation_status} />
              <StatusBadge status={rule.testability} />
              {rule.requires_human_review ? <Pill kind="warn" dot>review</Pill> : null}
            </div>
          </div>
          <span style={{ color: 'var(--ink-mute)', fontSize: 14 }}>{open ? '▾' : '▸'}</span>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, fontSize: 13 }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Governed concepts</div>
              <div className="num" style={{ color: 'var(--ink-2)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                {rule.governed_data_concepts.map((c) => `↳ ${c}`).join('\n') || '—'}
              </div>
            </div>
            <div>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Candidate tables</div>
              <div className="num" style={{ color: 'var(--ink-2)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                {rule.candidate_tables.map((t) => `↳ ${t}`).join('\n') || '—'}
              </div>
            </div>
          </div>
          {rule.citation_text && (
            <div
              style={{
                marginTop: 16,
                padding: '10px 14px',
                background: 'var(--bg-soft)',
                borderLeft: '3px solid var(--jade)',
                borderRadius: '0 6px 6px 0',
                fontSize: 13,
                color: 'var(--ink-2)',
                lineHeight: 1.5,
              }}
            >
              <span className="eyebrow" style={{ fontSize: 9, display: 'block', marginBottom: 4 }}>Citation</span>
              {rule.citation_text}
            </div>
          )}

          {rule.extraction_warnings.length > 0 && (
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {rule.extraction_warnings.map((w, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: 12,
                    padding: '6px 10px',
                    background: 'oklch(0.97 0.02 60)',
                    border: '1px solid oklch(0.85 0.08 60)',
                    borderRadius: 6,
                    color: 'oklch(0.45 0.1 60)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  ⚠ {w}
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 16, fontSize: 12, color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)' }}>
            confidence={rule.confidence?.toFixed(2)} · extracted_at={rule.extracted_at}
          </div>

          {rule.requires_human_review && (
            <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--line-soft)' }}>
              <div className="eyebrow" style={{ marginBottom: 10 }}>Review actions</div>
              {reviewAction === null ? (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button className="btn sm" onClick={() => setReviewAction('flag')}>Flag for review</button>
                  <button className="btn sm" onClick={() => setReviewAction('mapping_correction')}>Correct mapping</button>
                  <button className="btn sm" onClick={() => setReviewAction('testability_override')}>Mark untestable</button>
                  <button className="btn sm" onClick={() => setReviewAction('manual_approval')}>Approve</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 480 }}>
                  <div style={{ fontSize: 12, color: 'var(--ink-2)' }}>
                    Action: <strong>{reviewAction.replace(/_/g, ' ')}</strong>
                  </div>
                  <textarea
                    placeholder="Notes (required)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
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
                      disabled={!notes.trim() || isPending}
                      onClick={handleSubmit}
                    >
                      {isPending ? 'Submitting…' : 'Submit'}
                    </button>
                    <button className="btn sm" onClick={() => { setReviewAction(null); setNotes('') }}>Cancel</button>
                  </div>
                  {mutError && (
                    <div style={{ fontSize: 12, color: 'oklch(0.45 0.18 25)' }}>
                      {(mutError as Error).message}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
