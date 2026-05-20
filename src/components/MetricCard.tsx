interface MetricCardProps {
  label: string
  value: string | number
  sub?: string
  accent?: string
}

export default function MetricCard({ label, value, sub, accent }: MetricCardProps) {
  return (
    <div className="card" style={{ padding: '18px 20px' }}>
      <div className="eyebrow" style={{ marginBottom: 10 }}>
        {label}
      </div>
      <div
        className="num"
        style={{
          fontSize: 30,
          fontWeight: 500,
          letterSpacing: '-0.02em',
          color: accent || 'var(--ink)',
        }}
      >
        {value}
      </div>
      {sub ? (
        <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 6 }}>
          {sub}
        </div>
      ) : null}
    </div>
  )
}
