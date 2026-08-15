interface SectionCardProps {
  icon: string
  iconBg: string
  title: string
  subtitle: string
  badge?: string
  hasNotif?: boolean
  onClick: () => void
}

export default function SectionCard({
  icon,
  iconBg,
  title,
  subtitle,
  badge,
  hasNotif,
  onClick,
}: SectionCardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--surface)',
        border: `0.5px solid ${hasNotif ? 'var(--border-accent)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-md)',
        padding: '11px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        cursor: 'pointer',
        position: 'relative',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {badge && (
        <div style={{
          position: 'absolute',
          top: -6,
          right: -6,
          background: 'var(--accent)',
          color: '#fff',
          fontSize: 8,
          fontWeight: 600,
          padding: '2px 7px',
          borderRadius: 20,
          whiteSpace: 'nowrap',
        }}>
          {badge}
        </div>
      )}
      <div style={{
        width: 30,
        height: 30,
        borderRadius: 8,
        background: iconBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 14,
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: 11,
          fontWeight: 500,
          color: 'var(--text-secondary)',
          marginBottom: 2,
        }}>
          {title}
        </div>
        <div style={{
          fontSize: 10,
          color: 'var(--text-muted)',
          lineHeight: 1.4,
        }}>
          {subtitle}
        </div>
      </div>
      <div style={{
        fontSize: 16,
        color: hasNotif ? 'var(--accent)' : 'var(--border)',
      }}>
        ›
      </div>
    </div>
  )
}