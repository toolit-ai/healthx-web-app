import { useState } from 'react'
import StatusBadge from '@/components/StatusBadge'
import { getReports } from '@/api/mock'

const EVIDENCE_ARTIFACTS = [
  { name: 'Overtime_evidence.parquet', size: '24 MB', kind: 'Parquet', status: 'Ready' },
  { name: 'Stacking_evidence.parquet', size: '18 MB', kind: 'Parquet', status: 'Ready' },
  { name: 'ConsecutiveDays_evidence.parquet', size: '12 MB', kind: 'Parquet', status: 'Ready' },
  { name: 'Callback_evidence.parquet', size: '9 MB', kind: 'Parquet', status: 'Ready' },
]

const CHECKLIST = [
  'Executive Summary',
  'Overtime Findings',
  'Shift Differential Analysis',
  'On-Call Pay Review',
  'Meal Premium Compliance',
]

export default function Reports() {
  const reports = getReports()
  const [downloading, setDownloading] = useState<string | null>(null)

  function handleDownload(id: string) {
    setDownloading(id)
    setTimeout(() => setDownloading(null), 1200)
  }

  const deepDive = reports.find((r) => r.kind === 'deep-dive')
  const executive = reports.find((r) => r.kind === 'executive')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Report cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Deep-dive */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 className="h3" style={{ fontSize: 22, margin: 0 }}>
              Deep-dive report
            </h2>
            <StatusBadge status={deepDive?.status || 'generating'} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                flex: 1,
                height: 6,
                background: 'var(--bg-soft)',
                borderRadius: 999,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: '36%',
                  height: '100%',
                  background: 'var(--indigo)',
                  borderRadius: 999,
                }}
              />
            </div>
            <span className="num" style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
              36%
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {CHECKLIST.map((item) => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    background: 'var(--bg-soft)',
                    color: 'var(--ink-mute)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  ○
                </span>
                <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{item}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 'auto', paddingTop: 8 }}>
            <button className="btn" disabled>
              Preview
            </button>
            <button className="btn primary" onClick={() => handleDownload('deep-dive')} disabled={downloading === 'deep-dive'}>
              {downloading === 'deep-dive' ? 'Downloading…' : 'Download'}
            </button>
          </div>
        </div>

        {/* Executive */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 className="h3" style={{ fontSize: 22, margin: 0 }}>
              Executive report
            </h2>
            <StatusBadge status={executive?.status || 'queued'} />
          </div>

          <p style={{ fontSize: 13, color: 'var(--ink-mute)', margin: 0 }}>
            Queued behind deep-dive report. Will begin once evidence aggregation completes.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {CHECKLIST.map((item) => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    background: 'var(--bg-soft)',
                    color: 'var(--ink-mute)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  ○
                </span>
                <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{item}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 'auto', paddingTop: 8 }}>
            <button className="btn" disabled>
              Preview
            </button>
            <button className="btn primary" onClick={() => handleDownload('executive')} disabled={downloading === 'executive'}>
              {downloading === 'executive' ? 'Downloading…' : 'Download'}
            </button>
          </div>
        </div>
      </div>

      {/* Evidence artifacts */}
      <div className="card">
        <div className="eyebrow" style={{ marginBottom: 16 }}>
          Evidence artifacts
        </div>
        <table className="hx">
          <thead>
            <tr>
              <th>Artifact</th>
              <th>Kind</th>
              <th>Size</th>
              <th>Status</th>
              <th style={{ width: 120 }} />
            </tr>
          </thead>
          <tbody>
            {EVIDENCE_ARTIFACTS.map((a) => (
              <tr key={a.name}>
                <td style={{ color: 'var(--ink-2)' }}>{a.name}</td>
                <td>{a.kind}</td>
                <td className="num">{a.size}</td>
                <td>
                  <span className="pill ok">{a.status}</span>
                </td>
                <td>
                  <button
                    className="btn sm"
                    onClick={() => handleDownload(a.name)}
                    disabled={downloading === a.name}
                  >
                    {downloading === a.name ? '…' : 'Download'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
