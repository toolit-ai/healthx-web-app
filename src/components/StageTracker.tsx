import Spinner from './Spinner'
import Pill from './Pill'
import type { StageProgress } from '@/types/api'

interface StageTrackerProps {
  stages: StageProgress[]
}

function StageIcon({ status }: { status: string }) {
  if (status === 'completed')
    return (
      <span
        style={{
          width: 22,
          height: 22,
          borderRadius: 6,
          background: 'var(--jade-soft)',
          color: 'var(--jade-deep)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
        }}
      >
        ✓
      </span>
    )
  if (status === 'running')
    return (
      <span style={{ width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner size={12} />
      </span>
    )
  return (
    <span
      style={{
        width: 22,
        height: 22,
        borderRadius: 6,
        background: 'var(--bg-soft)',
        color: 'var(--ink-mute)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
      }}
    >
      ○
    </span>
  )
}

export default function StageTracker({ stages }: StageTrackerProps) {
  return (
    <div className="card" style={{ padding: 28 }}>
      <div className="eyebrow" style={{ marginBottom: 18 }}>
        <span className="dot" />
        Operational status
      </div>
      <h2 className="h3" style={{ margin: '0 0 24px' }}>
        Stage tracker
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {stages.map((s, i) => (
          <div
            key={s.stage_id}
            style={{
              display: 'grid',
              gridTemplateColumns: '22px 1fr auto',
              gap: 14,
              alignItems: 'center',
              padding: '9px 0',
              borderBottom: i < stages.length - 1 ? '1px solid var(--line-soft)' : 'none',
              paddingLeft: s.sub_stages && s.sub_stages.length > 0 ? 0 : 0,
            }}
          >
            <StageIcon status={s.status} />
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', minWidth: 0 }}>
              <span
                style={{
                  fontSize: 13.5,
                  color:
                    s.status === 'completed'
                      ? 'var(--ink-2)'
                      : s.status === 'running'
                        ? 'var(--ink)'
                        : 'var(--ink-mute)',
                  fontWeight: s.status === 'running' ? 500 : 400,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {s.name}
              </span>
              {s.name.includes('Gate') ? <Pill>review gate</Pill> : null}
            </div>
            <span
              className="num"
              style={{
                fontSize: 11,
                color: 'var(--ink-mute)',
                letterSpacing: '0.04em',
                whiteSpace: 'nowrap',
              }}
            >
              {s.status === 'completed' ? 'Done' : s.status === 'running' ? `${s.progress_pct}%` : '—'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
