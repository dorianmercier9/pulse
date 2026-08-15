interface SleepStage {
  type: 'deep' | 'rem' | 'light' | 'awake'
  flex: number
}

const COLORS = {
  deep: 'var(--sleep-deep)',
  rem: 'var(--sleep-rem)',
  light: 'var(--sleep-light)',
  awake: 'var(--sleep-awake)',
}

const LABELS = {
  deep: 'Profond',
  rem: 'REM',
  light: 'Léger',
  awake: 'Éveil',
}

interface SleepStripProps {
  stages: SleepStage[]
}

export default function SleepStrip({ stages }: SleepStripProps) {
  return (
    <div style={{ padding: '0 20px', marginBottom: 16 }}>
      <div style={{
        display: 'flex',
        gap: 2,
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 8,
      }}>
        {stages.map((s, i) => (
          <div key={i} style={{ flex: s.flex, background: COLORS[s.type] }} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        {(['deep', 'rem', 'light', 'awake'] as const).map(type => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: COLORS[type],
            }} />
            <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>
              {LABELS[type]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}