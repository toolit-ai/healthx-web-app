import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import StatusBadge from '@/components/StatusBadge'
import { downloadReport, generateReport, getReports, getSectionQA } from '@/api/client'
import { useActiveRun } from '@/hooks/useActiveRun'
import type { ReportInfo } from '@/types/api'

export default function Reports() {
  const { runId } = useActiveRun()
  const [downloading, setDownloading] = useState<string | null>(null)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  const reportsQ = useQuery({
    queryKey: ['reports', runId],
    queryFn: () => getReports(runId!),
    enabled: !!runId,
  })

  const sectionQaQ = useQuery({
    queryKey: ['reports-section-qa', runId],
    queryFn: () => getSectionQA(runId!),
    enabled: !!runId,
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

  async function handleDownload(kind: 'deep-dive' | 'executive') {
    setDownloading(kind)
    setDownloadError(null)
    try {
      await downloadReport(runId!, kind)
    } catch (e) {
      setDownloadError((e as Error).message)
    } finally {
      setDownloading(null)
    }
  }

  const reports: ReportInfo[] = reportsQ.data?.reports ?? []
  const deepDive = reports.find((r) => r.kind === 'deep-dive')
  const executive = reports.find((r) => r.kind === 'executive')
  const sections = sectionQaQ.data?.sections ?? []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <ReportCard
          title="Deep-dive report"
          kind="deep-dive"
          runId={runId}
          info={deepDive}
          loading={reportsQ.isLoading}
          onDownload={() => handleDownload('deep-dive')}
          downloading={downloading === 'deep-dive'}
          sections={sections}
        />
        <ReportCard
          title="Executive report"
          kind="executive"
          runId={runId}
          info={executive}
          loading={reportsQ.isLoading}
          onDownload={() => handleDownload('executive')}
          downloading={downloading === 'executive'}
          sections={sections}
        />
      </div>

      {downloadError ? (
        <div className="card" style={{ padding: 14, color: 'oklch(0.45 0.18 25)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
          Download failed: {downloadError}
        </div>
      ) : null}

      <div className="card">
        <div className="eyebrow" style={{ marginBottom: 16 }}>Section QA</div>
        {sectionQaQ.isLoading ? (
          <div style={{ color: 'var(--ink-soft)', fontSize: 13 }}>Loading QA rollup…</div>
        ) : sections.length === 0 ? (
          <div style={{ color: 'var(--ink-soft)', fontSize: 13 }}>No sections yet.</div>
        ) : (
          <table className="hx">
            <thead>
              <tr>
                <th>Section</th>
                <th>QA</th>
                <th>Unverified claims</th>
              </tr>
            </thead>
            <tbody>
              {sections.map((s) => (
                <tr key={s.section_id}>
                  <td style={{ color: 'var(--ink-2)' }}>{s.title}</td>
                  <td><StatusBadge status={s.qa_status} /></td>
                  <td className="num">{s.unverified_claims}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function ReportCard({
  title,
  kind,
  runId,
  info,
  loading,
  onDownload,
  downloading,
  sections,
}: {
  title: string
  kind: 'deep-dive' | 'executive'
  runId: string
  info: ReportInfo | undefined
  loading: boolean
  onDownload: () => void
  downloading: boolean
  sections: Array<{ section_id: string; title: string; qa_status: string; unverified_claims: number }>
}) {
  const queryClient = useQueryClient()
  const generateMutation = useMutation({
    mutationFn: () => generateReport(runId, kind),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports', runId] })
    },
  })

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 className="h3" style={{ fontSize: 22, margin: 0 }}>{title}</h2>
        <StatusBadge status={loading ? 'loading' : info?.status ?? 'not_started'} />
      </div>

      <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
        {loading
          ? 'Loading…'
          : info
            ? `${info.section_count} sections · ${info.unverified_claim_count} unverified claims · QA ${info.qa_status}`
            : 'Not yet generated.'}
      </div>

      {generateMutation.isError ? (
        <div style={{ fontSize: 12, color: 'oklch(0.45 0.18 25)', fontFamily: 'var(--font-mono)' }}>
          Generate failed: {(generateMutation.error as Error).message}
        </div>
      ) : null}

      {sections.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sections.slice(0, 6).map((s) => (
            <div key={s.section_id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 4,
                  background: s.qa_status === 'passed' ? 'var(--jade-soft)' : 'var(--bg-soft)',
                  color: s.qa_status === 'passed' ? 'var(--jade-deep)' : 'var(--ink-mute)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {s.qa_status === 'passed' ? '✓' : '○'}
              </span>
              <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{s.title}</span>
            </div>
          ))}
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: 10, marginTop: 'auto', paddingTop: 8 }}>
        <button
          className="btn"
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending || info?.status === 'generating'}
        >
          {generateMutation.isPending || info?.status === 'generating' ? 'Generating…' : 'Generate'}
        </button>
        <button
          className="btn primary"
          onClick={onDownload}
          disabled={downloading || info?.status !== 'completed'}
        >
          {downloading ? 'Downloading…' : 'Download'}
        </button>
      </div>
    </div>
  )
}
