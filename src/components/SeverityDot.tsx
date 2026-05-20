interface SeverityDotProps {
  sev: string
}

export default function SeverityDot({ sev }: SeverityDotProps) {
  const color =
    sev === 'critical'
      ? 'var(--crimson)'
      : sev === 'high'
        ? 'var(--terra)'
        : sev === 'medium'
          ? 'var(--amber)'
          : 'var(--jade)'
  return (
    <span
      style={{
        display: 'inline-block',
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: color,
        marginRight: 8,
      }}
    />
  )
}
