interface ScoreRingProps {
  score: number
  label: string
  tag: string
  date?: string
}

export default function ScoreRing({ score, label, tag, date }: ScoreRingProps) {
  return (
    <div style={{ textAlign: 'center', padding: '20px 0 16px' }}>
      <div style={{
        fontSize: 56,
        fontWeight: 500,
        color: 'var(--text-primary)',
        lineHeight: 1,
        letterSpacing: '-2px',
      }}>
        {score}
      </div>
      <div style={{
        fontSize: 9,
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        marginTop: 6,
      }}>
        {label}
      </div>
      <div style={{
        display: 'inline-block',
        marginTop: 10,
        fontSize: 10,
        padding: '4px 14px',
        borderRadius: 20,
        background: 'var(--accent-dim)',
        color: 'var(--accent)',
      }}>
        {tag}
      </div>
      {date && (
        <div style={{
          fontSize: 9,
          color: 'var(--text-muted)',
          marginTop: 8,
        }}>
          Nuit du {date}
        </div>
      )}
    </div>
  )
}