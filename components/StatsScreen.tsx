'use client'

import { useState } from 'react'

const PERIODS = ['1J', '7J', '30J', '3M', 'An', 'Tout']

const STEPS_DATA: Record<string, { day: string; value: number; active?: boolean }[]> = {
  '1J': [{ day: 'Auj', value: 3881, active: true }],
  '7J': [
    { day: 'L', value: 6200 }, { day: 'M', value: 8400 }, { day: 'M', value: 3200 },
    { day: 'J', value: 9100 }, { day: 'V', value: 7300 }, { day: 'S', value: 11200 },
    { day: 'D', value: 3881, active: true },
  ],
  '30J': Array.from({ length: 30 }, (_, i) => ({ day: `${i + 1}`, value: Math.floor(3000 + Math.random() * 9000) })),
  '3M': Array.from({ length: 13 }, (_, i) => ({ day: `S${i + 1}`, value: Math.floor(5000 + Math.random() * 7000) })),
  'An': Array.from({ length: 12 }, (_, i) => ({ day: ['J','F','M','A','M','J','J','A','S','O','N','D'][i], value: Math.floor(4000 + Math.random() * 8000) })),
  'Tout': Array.from({ length: 2 }, (_, i) => ({ day: `'${26 + i}`, value: Math.floor(4000 + Math.random() * 8000) })),
}

const KM_DATA: Record<string, { day: string; value: number; active?: boolean }[]> = {
  '1J': [{ day: 'Auj', value: 0, active: true }],
  '7J': [
    { day: 'L', value: 0 }, { day: 'M', value: 0 }, { day: 'M', value: 0 },
    { day: 'J', value: 0 }, { day: 'V', value: 0 }, { day: 'S', value: 0 },
    { day: 'D', value: 3.4, active: true },
  ],
  '30J': Array.from({ length: 30 }, (_, i) => ({ day: `${i + 1}`, value: i % 4 === 0 ? parseFloat((2 + Math.random() * 3).toFixed(1)) : 0 })),
  '3M': Array.from({ length: 13 }, (_, i) => ({ day: `S${i + 1}`, value: parseFloat((Math.random() * 15).toFixed(1)) })),
  'An': Array.from({ length: 12 }, (_, i) => ({ day: ['J','F','M','A','M','J','J','A','S','O','N','D'][i], value: parseFloat((Math.random() * 40).toFixed(1)) })),
  'Tout': Array.from({ length: 2 }, (_, i) => ({ day: `'${26 + i}`, value: parseFloat((Math.random() * 40).toFixed(1)) })),
}

type Metric = {
  key: string
  label: string
  type: 'moy' | 'total'
  value: string
  unit: string
  delta: string
  trend: 'up' | 'down' | 'ok'
  invertedLogic?: boolean
}

const METRICS_BY_PERIOD: Record<string, Metric[]> = {
  '1J': [
    { key: 'steps', label: 'Pas totaux', type: 'total', value: '3 881', unit: '', delta: '-2 100', trend: 'down' },
    { key: 'km', label: 'Distance', type: 'total', value: '3.4', unit: 'km', delta: '+3.4', trend: 'up' },
    { key: 'sleep', label: 'Sommeil', type: 'moy', value: '7h20', unit: '', delta: '-12min', trend: 'down' },
    { key: 'cal', label: 'Cal. brûlées', type: 'total', value: '1 841', unit: 'kcal', delta: 'stable', trend: 'ok' },
    { key: 'cal_in', label: 'Cal. consommées', type: 'total', value: '—', unit: 'kcal', delta: 'saisie manuelle', trend: 'ok' },
    { key: 'exercise', label: 'Exercice', type: 'total', value: '1/1', unit: 'j', delta: '', trend: 'ok' },
    { key: 'score', label: 'Récupération', type: 'moy', value: '76', unit: '', delta: '+3', trend: 'up' },
    { key: 'vfc', label: 'VFC', type: 'moy', value: '82', unit: 'ms', delta: '+4', trend: 'up' },
    { key: 'fc', label: 'FC repos', type: 'moy', value: '49', unit: 'bpm', delta: 'stable', trend: 'ok' },
    { key: 'deep', label: 'Profond', type: 'moy', value: '92', unit: 'min', delta: '+8', trend: 'up' },
    { key: 'rem', label: 'REM', type: 'moy', value: '54', unit: 'min', delta: '-6', trend: 'down' },
    { key: 'reveils', label: 'Micro-réveils', type: 'moy', value: '20', unit: '', delta: '+3', trend: 'down', invertedLogic: true },
    { key: 'eveils', label: 'Éveils longs', type: 'moy', value: '49', unit: 'min', delta: '+12', trend: 'down', invertedLogic: true },
  ],
  '7J': [
    { key: 'steps', label: 'Pas totaux', type: 'total', value: '49 281', unit: '', delta: '+8%', trend: 'up' },
    { key: 'km', label: 'Distance', type: 'total', value: '3.4', unit: 'km', delta: 'début', trend: 'ok' },
    { key: 'sleep', label: 'Sommeil', type: 'moy', value: '7h18', unit: '/nuit', delta: '-12min', trend: 'down' },
    { key: 'cal', label: 'Cal. brûlées', type: 'total', value: '12 880', unit: 'kcal', delta: '+4%', trend: 'up' },
    { key: 'cal_in', label: 'Cal. consommées', type: 'total', value: '—', unit: 'kcal', delta: 'saisie manuelle', trend: 'ok' },
    { key: 'exercise', label: 'Exercice', type: 'total', value: '5/7', unit: 'j', delta: '+1j', trend: 'up' },
    { key: 'score', label: 'Récupération', type: 'moy', value: '74', unit: '', delta: '+2', trend: 'up' },
    { key: 'vfc', label: 'VFC', type: 'moy', value: '82', unit: 'ms', delta: '+4', trend: 'up' },
    { key: 'fc', label: 'FC repos', type: 'moy', value: '49', unit: 'bpm', delta: 'stable', trend: 'ok' },
    { key: 'deep', label: 'Profond', type: 'moy', value: '85', unit: 'min', delta: '+5', trend: 'up' },
    { key: 'rem', label: 'REM', type: 'moy', value: '78', unit: 'min', delta: '-4', trend: 'down' },
    { key: 'reveils', label: 'Micro-réveils', type: 'moy', value: '18', unit: '', delta: '+3', trend: 'down', invertedLogic: true },
    { key: 'eveils', label: 'Éveils longs', type: 'moy', value: '32', unit: 'min', delta: '+8', trend: 'down', invertedLogic: true },
  ],
  '30J': [
    { key: 'steps', label: 'Pas totaux', type: 'total', value: '198 420', unit: '', delta: '+12%', trend: 'up' },
    { key: 'km', label: 'Distance', type: 'total', value: '6.8', unit: 'km', delta: 'début', trend: 'ok' },
    { key: 'sleep', label: 'Sommeil', type: 'moy', value: '7h10', unit: '/nuit', delta: '-20min', trend: 'down' },
    { key: 'cal', label: 'Cal. brûlées', type: 'total', value: '52 100', unit: 'kcal', delta: '+6%', trend: 'up' },
    { key: 'cal_in', label: 'Cal. consommées', type: 'total', value: '—', unit: 'kcal', delta: 'saisie manuelle', trend: 'ok' },
    { key: 'exercise', label: 'Exercice', type: 'total', value: '18/30', unit: 'j', delta: '+3j', trend: 'up' },
    { key: 'score', label: 'Récupération', type: 'moy', value: '72', unit: '', delta: '+1', trend: 'up' },
    { key: 'vfc', label: 'VFC', type: 'moy', value: '80', unit: 'ms', delta: '+2', trend: 'up' },
    { key: 'fc', label: 'FC repos', type: 'moy', value: '50', unit: 'bpm', delta: '-1', trend: 'up' },
    { key: 'deep', label: 'Profond', type: 'moy', value: '82', unit: 'min', delta: '+3', trend: 'up' },
    { key: 'rem', label: 'REM', type: 'moy', value: '75', unit: 'min', delta: '-2', trend: 'down' },
    { key: 'reveils', label: 'Micro-réveils', type: 'moy', value: '16', unit: '', delta: '-2', trend: 'up', invertedLogic: true },
    { key: 'eveils', label: 'Éveils longs', type: 'moy', value: '28', unit: 'min', delta: '-4', trend: 'up', invertedLogic: true },
  ],
  '3M': [
    { key: 'steps', label: 'Pas totaux', type: 'total', value: '594 000', unit: '', delta: 'N/A', trend: 'ok' },
    { key: 'km', label: 'Distance', type: 'total', value: '6.8', unit: 'km', delta: 'N/A', trend: 'ok' },
    { key: 'sleep', label: 'Sommeil', type: 'moy', value: '7h05', unit: '/nuit', delta: 'N/A', trend: 'ok' },
    { key: 'cal', label: 'Cal. brûlées', type: 'total', value: '156 300', unit: 'kcal', delta: 'N/A', trend: 'ok' },
    { key: 'cal_in', label: 'Cal. consommées', type: 'total', value: '—', unit: 'kcal', delta: 'saisie manuelle', trend: 'ok' },
    { key: 'exercise', label: 'Exercice', type: 'total', value: '54/90', unit: 'j', delta: 'N/A', trend: 'ok' },
    { key: 'score', label: 'Récupération', type: 'moy', value: '70', unit: '', delta: 'N/A', trend: 'ok' },
    { key: 'vfc', label: 'VFC', type: 'moy', value: '78', unit: 'ms', delta: 'N/A', trend: 'ok' },
    { key: 'fc', label: 'FC repos', type: 'moy', value: '51', unit: 'bpm', delta: 'N/A', trend: 'ok' },
    { key: 'deep', label: 'Profond', type: 'moy', value: '80', unit: 'min', delta: 'N/A', trend: 'ok' },
    { key: 'rem', label: 'REM', type: 'moy', value: '72', unit: 'min', delta: 'N/A', trend: 'ok' },
    { key: 'reveils', label: 'Micro-réveils', type: 'moy', value: '—', unit: '', delta: 'N/A', trend: 'ok' },
    { key: 'eveils', label: 'Éveils longs', type: 'moy', value: '—', unit: 'min', delta: 'N/A', trend: 'ok' },
  ],
  'An': [
    { key: 'steps', label: 'Pas totaux', type: 'total', value: '—', unit: '', delta: 'N/A', trend: 'ok' },
    { key: 'km', label: 'Distance', type: 'total', value: '—', unit: 'km', delta: 'N/A', trend: 'ok' },
    { key: 'sleep', label: 'Sommeil', type: 'moy', value: '—', unit: '/nuit', delta: 'N/A', trend: 'ok' },
    { key: 'cal', label: 'Cal. brûlées', type: 'total', value: '—', unit: 'kcal', delta: 'N/A', trend: 'ok' },
    { key: 'score', label: 'Récupération', type: 'moy', value: '—', unit: '', delta: 'N/A', trend: 'ok' },
    { key: 'vfc', label: 'VFC', type: 'moy', value: '—', unit: 'ms', delta: 'N/A', trend: 'ok' },
  ],
  'Tout': [
    { key: 'steps', label: 'Pas totaux', type: 'total', value: '—', unit: '', delta: 'N/A', trend: 'ok' },
    { key: 'km', label: 'Distance', type: 'total', value: '—', unit: 'km', delta: 'N/A', trend: 'ok' },
    { key: 'sleep', label: 'Sommeil', type: 'moy', value: '—', unit: '/nuit', delta: 'N/A', trend: 'ok' },
    { key: 'cal', label: 'Cal. brûlées', type: 'total', value: '—', unit: 'kcal', delta: 'N/A', trend: 'ok' },
    { key: 'score', label: 'Récupération', type: 'moy', value: '—', unit: '', delta: 'N/A', trend: 'ok' },
    { key: 'vfc', label: 'VFC', type: 'moy', value: '—', unit: 'ms', delta: 'N/A', trend: 'ok' },
  ],
}

const SESSIONS = [
  { type: 'course', emoji: '🏃', name: 'Course', detail: '3.4 km · 12:32/km', date: '10 août' },
  { type: 'muscu', emoji: '🏋', name: 'Renforcement haut du corps', detail: '26 min · 6/10', date: 'Hier' },
  { type: 'kine', emoji: '🦶', name: 'Protocole kiné', detail: 'Fait ✓', date: 'Hier' },
  { type: 'marche', emoji: '🚶', name: 'Marche', detail: '3.4 km · 42 min', date: '10 août' },
]

const SESSION_BG: Record<string, string> = {
  course: '#091a09', muscu: '#0d0d1f', kine: '#13082a', marche: '#1a1300',
}

export default function StatsScreen() {
  const [period, setPeriod] = useState('7J')
  const [chartView, setChartView] = useState<'steps' | 'km'>('steps')
  const [selectedBar, setSelectedBar] = useState<number | null>(null)

  const currentData = chartView === 'steps' ? STEPS_DATA[period] ?? [] : KM_DATA[period] ?? []
  const maxVal = Math.max(...currentData.map(d => d.value), 1)
  const metrics = METRICS_BY_PERIOD[period] ?? []

  const getDeltaColor = (trend: string, invertedLogic?: boolean) => {
    if (trend === 'ok') return 'var(--text-muted)'
    if (invertedLogic) return trend === 'up' ? 'var(--bad)' : 'var(--good)'
    return trend === 'up' ? 'var(--good)' : 'var(--bad)'
  }

  const getDeltaArrow = (trend: string) => {
    if (trend === 'ok') return '→'
    return trend === 'up' ? '↑' : '↓'
  }

  return (
    <div style={{ padding: '16px 20px 20px', overflowY: 'auto', height: 'calc(100dvh - 130px)' }}>

      {/* Période */}
      <div style={{ display: 'flex', gap: 5, marginBottom: 20 }}>
        {PERIODS.map(p => (
          <button key={p} onClick={() => { setPeriod(p); setSelectedBar(null) }} style={{
            flex: 1, padding: '6px 0',
            background: p === period ? 'var(--accent-dim)' : 'var(--surface)',
            border: `0.5px solid ${p === period ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 8, fontSize: 10,
            color: p === period ? 'var(--accent)' : 'var(--text-muted)',
          }}>{p}</button>
        ))}
      </div>

      {/* Graphique */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {chartView === 'steps' ? 'Pas quotidiens' : 'Distance courus (km)'}
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {(['steps', 'km'] as const).map(v => (
              <button key={v} onClick={() => { setChartView(v); setSelectedBar(null) }} style={{
                padding: '3px 10px',
                background: chartView === v ? 'var(--accent-dim)' : 'transparent',
                border: `0.5px solid ${chartView === v ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 20, fontSize: 9,
                color: chartView === v ? 'var(--accent)' : 'var(--text-muted)',
              }}>{v === 'steps' ? 'Pas' : 'Km'}</button>
            ))}
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 3,
          height: 70,
          marginBottom: 4,
          justifyContent: currentData.length === 1 ? 'center' : 'stretch',
        }}>
          {currentData.map((d, i) => (
            <div key={i} onClick={() => setSelectedBar(selectedBar === i ? null : i)} style={{
              flex: currentData.length === 1 ? 'none' : 1,
              width: currentData.length === 1 ? 40 : 'auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              height: '100%',
              justifyContent: 'flex-end',
              position: 'relative',
              cursor: 'pointer',
            }}>
              {selectedBar === i && d.value > 0 && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'var(--accent)',
                  color: '#fff',
                  fontSize: 8,
                  padding: '2px 6px',
                  borderRadius: 6,
                  whiteSpace: 'nowrap',
                  zIndex: 10,
                }}>
                  {chartView === 'steps' ? d.value.toLocaleString('fr-FR') : `${d.value} km`}
                </div>
              )}
              <div style={{
                width: '100%',
                borderRadius: '3px 3px 0 0',
                height: `${Math.max((d.value / maxVal) * 60, d.value > 0 ? 3 : 0)}px`,
                background: selectedBar === i ? 'var(--accent)' : d.active ? 'var(--accent)' : d.value === 0 ? 'var(--border)' : 'var(--surface)',
                border: `0.5px solid ${selectedBar === i || d.active ? 'var(--accent)' : 'var(--border)'}`,
                transition: 'background 0.15s',
              }} />
              <div style={{ fontSize: 8, color: selectedBar === i || d.active ? 'var(--accent)' : 'var(--text-muted)' }}>{d.day}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Métriques */}
      <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
        Métriques · {period}
      </div>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 20 }}>
        {metrics.map(m => (
          <div key={m.key} style={{
            minWidth: 95, background: 'var(--surface)',
            border: '0.5px solid var(--border)', borderRadius: 12,
            padding: '12px 10px', flexShrink: 0,
          }}>
            <div style={{ fontSize: 8, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{m.label}</div>
            <div style={{ fontSize: 8, color: '#333', marginBottom: 6 }}>{m.type === 'moy' ? 'moyenne' : 'total'}</div>
            <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4 }}>
              {m.value}<span style={{ fontSize: 9, color: 'var(--text-muted)', marginLeft: 2 }}>{m.unit}</span>
            </div>
            {m.delta && m.delta !== '' && (
              <div style={{ fontSize: 9, color: getDeltaColor(m.trend, m.invertedLogic) }}>
                {getDeltaArrow(m.trend)} {m.delta}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Sessions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Sessions</div>
        <div style={{ fontSize: 10, color: 'var(--accent)' }}>{SESSIONS.length} sur {period}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {SESSIONS.map((s, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--surface)', border: '0.5px solid var(--border)',
            borderRadius: 10, padding: '10px 12px',
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: SESSION_BG[s.type],
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, flexShrink: 0,
            }}>{s.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2 }}>{s.name}</div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{s.detail}</div>
            </div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{s.date}</div>
          </div>
        ))}
      </div>
    </div>
  )
}