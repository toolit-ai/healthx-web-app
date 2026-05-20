interface NotReadyStateProps {
  reason: string
  prerequisite: string
}

export default function NotReadyState({ reason, prerequisite }: NotReadyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        border: '1px dashed var(--line)',
        borderRadius: 'var(--r-3)',
        background: 'var(--bg-card)',
        textAlign: 'center',
      }}
      role="status"
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'var(--bg-soft)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20,
          color: 'var(--ink-mute)',
          marginBottom: 16,
        }}
      >
        …
      </div>
      <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink-2)', margin: 0 }}>
        {reason}
      </p>
      <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 8, maxWidth: 400, lineHeight: 1.5 }}>
        {prerequisite}
      </p>
    </div>
  )
}
