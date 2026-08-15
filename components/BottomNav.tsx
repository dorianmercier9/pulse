'use client'

import { Home, MessageCircle, BarChart2 } from 'lucide-react'

const items = [
  { icon: Home, label: 'Accueil', key: 'accueil' },
  { icon: MessageCircle, label: 'Chat', key: 'chat' },
  { icon: BarChart2, label: 'Stats', key: 'stats' },
]

interface BottomNavProps {
  active: string
  onChange: (key: string) => void
}

export default function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: 430,
      background: 'var(--bg)',
      borderTop: '0.5px solid var(--border)',
      display: 'flex',
      justifyContent: 'space-around',
      padding: '10px 0 24px',
      zIndex: 50,
    }}>
      {items.map(({ icon: Icon, label, key }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <Icon
            size={20}
            color={active === key ? 'var(--accent)' : 'var(--text-muted)'}
            strokeWidth={active === key ? 2 : 1.5}
          />
          <span style={{
            fontSize: 9,
            color: active === key ? 'var(--accent)' : 'var(--text-muted)',
          }}>
            {label}
          </span>
        </button>
      ))}
    </div>
  )
}