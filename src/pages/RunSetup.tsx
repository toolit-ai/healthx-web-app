import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createRun } from '@/api/mock'

const DATA_FILES = [
  'timesheet_v3.parquet (412MB)',
  'schedule_v2.parquet (88MB)',
  'payroll_v3.parquet (240MB)',
  'employee_v2.csv (12MB)',
  'absence_codes_lkp.csv (4KB)',
]

const DOC_FILES = [
  'Toledo_CBA_2024-2027.pdf',
  'Lorain_CBA_2023-2026.pdf',
  'Springfield_CBA_2024-2027.pdf',
  '+ 11 more',
]

export default function RunSetup() {
  const navigate = useNavigate()
  const [dataPath, setDataPath] = useState('/engagements/bsmh/data/raw')
  const [docsPath, setDocsPath] = useState('/engagements/bsmh/documents')

  function handleStart() {
    createRun({
      data_input_path: dataPath,
      documents_input_path: docsPath,
    })
    navigate('/data-dq')
  }

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
          <input className="field" value={dataPath} onChange={(e) => setDataPath(e.target.value)} />
          <PathPreview items={DATA_FILES} count={5} />

          <label className="label" style={{ marginTop: 28 }}>
            Documents directory
            <span className="hint">PDF, DOCX, MD, TXT</span>
          </label>
          <input className="field" value={docsPath} onChange={(e) => setDocsPath(e.target.value)} />
          <PathPreview items={DOC_FILES} count={14} />
        </div>
      </div>

      <div>
        <div className="card" style={{ padding: 24, position: 'sticky', top: 100 }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>
            <span className="dot" />
            Run summary
          </div>
          <SummaryRow k="Engagement" v="BSMH Pay Consistency" />
          <SummaryRow k="Markets" v="9 detected" />
          <SummaryRow k="CBAs" v="11 anticipated" />
          <SummaryRow k="Temporal scope" v="14 months · trend ON" />
          <SummaryRow k="Estimated runtime" v="~12 min" />
          <button
            className="btn primary"
            style={{ width: '100%', marginTop: 18, padding: '12px' }}
            onClick={handleStart}
          >
            Start run →
          </button>
          <div
            style={{
              fontSize: 11,
              color: 'var(--ink-mute)',
              marginTop: 12,
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.06em',
            }}
          >
            Initializes 5 subgraphs · ledger row created
          </div>
        </div>

        <div className="card" style={{ padding: 24, marginTop: 16 }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>
            <span className="dot" />
            Discovery preview
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
            {[
              ['5 tables', 'timesheet_v3, schedule_v2, payroll_v3, employee_v2, absence_codes_lkp'],
              ['14 docs', '9 CBAs · 5 policy documents'],
              ['18 pay practices', 'OT, Consecutive Days, Stacking, Callback, Critical Staffing…'],
            ].map(([k, v]) => (
              <div key={k}>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: 'var(--ink-mute)',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    marginBottom: 2,
                  }}
                >
                  {k}
                </div>
                <div style={{ color: 'var(--ink-2)' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function PathPreview({ items, count }: { items: string[]; count: number }) {
  return (
    <div
      style={{
        marginTop: 10,
        padding: '10px 14px',
        background: 'var(--bg-soft)',
        borderRadius: 8,
        fontSize: 12,
        color: 'var(--ink-soft)',
        fontFamily: 'var(--font-mono)',
      }}
    >
      <div style={{ color: 'var(--jade-deep)', marginBottom: 6 }}>
        ✓ {count} files detected
      </div>
      {items.slice(0, 3).map((i) => (
        <div key={i} style={{ color: 'var(--ink-mute)' }}>
          ↳ {i}
        </div>
      ))}
      {items.length > 3 ? (
        <div style={{ color: 'var(--ink-mute)' }}>↳ … {items.length - 3} more</div>
      ) : null}
    </div>
  )
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
      }}
    >
      <span style={{ color: 'var(--ink-soft)' }}>{k}</span>
      <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{v}</span>
    </div>
  )
}
