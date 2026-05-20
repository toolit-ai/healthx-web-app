interface LogoProps {
  size?: number
}

export default function Logo({ size = 22 }: LogoProps) {
  return (
    <span className="hx-mark">
      <span
        className="glyph"
        style={{ width: size, height: size, fontSize: size * 0.74 }}
      >
        x
      </span>
      <span>
        HEALTH<em style={{ fontStyle: 'italic', fontFamily: 'var(--font-display)', letterSpacing: 0, fontSize: '1.05em', marginLeft: 1 }}>X</em>
      </span>
    </span>
  )
}
