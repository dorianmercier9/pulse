export default function Header() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 20px 0',
    }}>
      <span style={{
        fontSize: 12,
        fontWeight: 600,
        color: 'var(--accent)',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
      }}>
        Pulse
      </span>
      <div style={{
        width: 30,
        height: 30,
        borderRadius: '50%',
        background: 'var(--surface)',
        border: '0.5px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 11,
        color: 'var(--text-muted)',
        fontWeight: 500,
      }}>
        D
      </div>
    </div>
  )
}