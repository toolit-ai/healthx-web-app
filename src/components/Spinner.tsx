interface SpinnerProps {
  size?: number
}

export default function Spinner({ size = 14 }: SpinnerProps) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        border: `2px solid var(--line)`,
        borderTopColor: 'var(--ink)',
        borderRadius: '50%',
        animation: 'hxSpin 0.8s linear infinite',
      }}
    />
  )
}
