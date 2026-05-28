import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  ApiError,
  createRun,
  previewPaths,
  type PathPreviewSide,
} from '@/api/client'
import { useActiveRun } from '@/hooks/useActiveRun'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'

const DEFAULT_DATA_PATH =
  '/Users/rishabharya/Desktop/bsmh-workspace/bsmh-agentic-system/demo_upload/set_a_clean'
const DEFAULT_DOCS_PATH =
  '/Users/rishabharya/Desktop/bsmh-workspace/bsmh-agentic-system/demo_upload/docs'

export default function RunSetup() {
  const navigate = useNavigate()
  const { setRunId } = useActiveRun()
  const [dataPath, setDataPath] = useState(DEFAULT_DATA_PATH)
  const [docsPath, setDocsPath] = useState(DEFAULT_DOCS_PATH)

  const debouncedData = useDebouncedValue(dataPath, 300)
  const debouncedDocs = useDebouncedValue(docsPath, 300)

  const preview = useQuery({
    queryKey: ['paths-preview', debouncedData, debouncedDocs],
    queryFn: () => previewPaths({ data_path: debouncedData, docs_path: debouncedDocs }),
    enabled: !!debouncedData && !!debouncedDocs,
  })

  const createMutation = useMutation({
    mutationFn: () =>
      createRun({ data_input_path: dataPath, documents_input_path: docsPath }),
    onSuccess: (run) => {
      setRunId(run.run_id)
      navigate('/data-dq')
    },
  })

  const canStart =
    !!dataPath &&
    !!docsPath &&
    !createMutation.isPending &&
    !(preview.data && (!preview.data.data.exists || !preview.data.docs.exists))

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 28, maxWidth: 1280 }}>
      <div>
        <div className="card" style={{ padding: 28 }}>
          <div className="eyebrow" style={{ marginBottom: 18 }}>
            <span className="dot" />
            Sources
          </div>
          <h2 className="h3" style={{ margin: '0 0 24px' }}>
            Point HealthX at your data.
          </h2>

          <label className="label">
            Data directory
            <span className="hint">CSV, XLSX, or Parquet</span>
          </label>
          <input
            className="field"
            value={dataPath}
            onChange={(e) => setDataPath(e.target.value)}
          />
          <PreviewChips
            side={preview.data?.data}
            loading={preview.isLoading || (preview.isFetching && !preview.data)}
            error={preview.error}
            empty={!debouncedData}
          />

          <label className="label" style={{ marginTop: 28 }}>
            Documents directory
            <span className="hint">PDF, DOCX, MD, TXT</span>
          </label>
          <input
            className="field"
            value={docsPath}
            onChange={(e) => setDocsPath(e.target.value)}
          />
          <PreviewChips
            side={preview.data?.docs}
            loading={preview.isLoading || (preview.isFetching && !preview.data)}
            error={preview.error}
            empty={!debouncedDocs}
          />
        </div>
      </div>

      <div>
        <div className="card" style={{ padding: 24, position: 'sticky', top: 100 }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>
            <span className="dot" />
            Run summary
          </div>
          <SummaryRow k="Data path" v={truncate(dataPath, 36)} />
          <SummaryRow k="Docs path" v={truncate(docsPath, 36)} />
          <SummaryRow
            k="Data files"
            v={summaryCount(preview.data?.data, preview.isFetching)}
          />
          <SummaryRow
            k="Doc files"
            v={summaryCount(preview.data?.docs, preview.isFetching)}
          />
          <button
            className="btn primary"
            disabled={!canStart}
            style={{ width: '100%', marginTop: 18, padding: '12px' }}
            onClick={() => createMutation.mutate()}
          >
            {createMutation.isPending ? 'Starting…' : 'Start run →'}
          </button>
          {createMutation.error ? (
            <div
              style={{
                marginTop: 12,
                fontSize: 12,
                color: 'oklch(0.45 0.18 25)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {createMutation.error instanceof ApiError
                ? `Start failed: ${createMutation.error.message}`
                : 'Start failed.'}
            </div>
          ) : null}
          <div
            style={{
              fontSize: 11,
              color: 'var(--ink-mute)',
              marginTop: 12,
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.06em',
            }}
          >
            POST /runs · run row created · graph dispatched
          </div>
        </div>
      </div>
    </div>
  )
}

function summaryCount(side: PathPreviewSide | undefined, loading: boolean): string {
  if (loading && !side) return 'checking…'
  if (!side) return '—'
  if (!side.exists) return 'path not found'
  return `${side.count}`
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s
  return '…' + s.slice(-n)
}

function PreviewChips({
  side,
  loading,
  error,
  empty,
}: {
  side: PathPreviewSide | undefined
  loading: boolean
  error: unknown
  empty: boolean
}) {
  const baseStyle = {
    marginTop: 10,
    padding: '10px 14px',
    background: 'var(--bg-soft)',
    borderRadius: 8,
    fontSize: 12,
    color: 'var(--ink-soft)',
    fontFamily: 'var(--font-mono)',
  } as const

  if (empty) {
    return (
      <div style={baseStyle}>
        <div style={{ color: 'var(--ink-mute)' }}>Enter a path…</div>
      </div>
    )
  }
  if (loading) {
    return (
      <div style={baseStyle}>
        <div style={{ color: 'var(--ink-mute)' }}>↳ checking path…</div>
      </div>
    )
  }
  if (error) {
    return (
      <div style={baseStyle}>
        <div style={{ color: 'oklch(0.45 0.18 25)' }}>
          ✗ {error instanceof ApiError ? error.message : 'preview failed'}
        </div>
      </div>
    )
  }
  if (!side) {
    return (
      <div style={baseStyle}>
        <div style={{ color: 'var(--ink-mute)' }}>—</div>
      </div>
    )
  }
  if (!side.exists) {
    return (
      <div style={baseStyle}>
        <div style={{ color: 'oklch(0.45 0.18 25)' }}>✗ path not found or not accessible</div>
      </div>
    )
  }
  return (
    <div style={baseStyle}>
      <div style={{ color: 'var(--jade-deep)', marginBottom: 6 }}>
        ✓ {side.count} files detected
      </div>
      {side.files.slice(0, 3).map((f) => (
        <div key={f.rel_path} style={{ color: 'var(--ink-mute)' }}>
          ↳ {f.name} <span style={{ opacity: 0.6 }}>({fmtSize(f.size_bytes)})</span>
        </div>
      ))}
      {side.count > 3 ? (
        <div style={{ color: 'var(--ink-mute)' }}>↳ … {side.count - 3} more</div>
      ) : null}
    </div>
  )
}

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)}GB`
}

function SummaryRow({ k, v }: { k: string; v: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '10px 0',
        borderBottom: '1px solid var(--line-soft)',
        fontSize: 13,
        gap: 12,
      }}
    >
      <span style={{ color: 'var(--ink-soft)', flexShrink: 0 }}>{k}</span>
      <span
        style={{
          color: 'var(--ink)',
          fontWeight: 500,
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          textAlign: 'right',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {v}
      </span>
    </div>
  )
}
