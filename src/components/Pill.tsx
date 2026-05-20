interface PillProps {
  kind?: 'default' | 'ok' | 'warn' | 'err' | 'run' | 'ink'
  children: React.ReactNode
  dot?: boolean
}

export default function Pill({ kind = 'default', children, dot = false }: PillProps) {
  const cls = ['pill']
  if (kind === 'ok') cls.push('ok')
  if (kind === 'warn') cls.push('warn')
  if (kind === 'err') cls.push('err')
  if (kind === 'run') cls.push('run')
  if (kind === 'ink') cls.push('solid-ink')
  return (
    <span className={cls.join(' ')}>
      {dot ? <span className="dot" /> : null}
      {children}
    </span>
  )
}
