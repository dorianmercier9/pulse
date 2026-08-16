'use client'

import { useState, useEffect } from 'react'

const TYPE_CONFIG: Record<string, { emoji: string; bg: string; color: string }> = {
  kine: { emoji: '🦶', bg: '#13082a', color: '#a78bfa' },
  muscu: { emoji: '💪', bg: '#0d0d1f', color: '#60a5fa' },
  course: { emoji: '🏃', bg: '#091a09', color: '#4ade80' },
  marche: { emoji: '🚶', bg: '#1a1300', color: '#facc15' },
  cardio: { emoji: '❤️', bg: '#1f0d0d', color: '#f87171' },
}

export default function SportScreen() {
  const [workouts, setWorkouts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [activeWorkout, setActiveWorkout] = useState<any | null>(null)
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [chatMessages, setChatMessages] = useState<{ role: string; text: string }[]>([])

  const loadWorkouts = async () => {
    try {
      const res = await fetch('/api/workouts')
      const data = await res.json()
      setWorkouts(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadWorkouts()
  }, [])

  const generateProgram = async () => {
    setGenerating(true)
    try {
      await fetch('/api/workouts/generate', { method: 'POST' })
      await loadWorkouts()
    } catch (e) {
      console.error(e)
    }
    setGenerating(false)
  }

  const updateStatus = async (id: number, statut: string, ressenti?: number) => {
    await fetch('/api/workouts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, statut, ressenti }),
    })
    await loadWorkouts()
  }

  const sendChat = async () => {
    if (!chatInput.trim()) return
    setChatLoading(true)
    const userMsg = { role: 'user', text: chatInput }
    const newMessages = [...chatMessages, userMsg]
    setChatMessages(newMessages)
    setChatInput('')

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: chatInput,
          history: newMessages.slice(0, -1).map(m => ({
            role: m.role === 'agent' ? 'assistant' : 'user',
            content: m.text,
          })),
        }),
      })
      const data = await res.json()
      setChatMessages(prev => [...prev, { role: 'agent', text: data.response }])
    } catch (e) {
      console.error(e)
    }
    setChatLoading(false)
  }

  const grouped = workouts.reduce((acc: any, w: any) => {
    if (!acc[w.date]) acc[w.date] = []
    acc[w.date].push(w)
    return acc
  }, {})

  const statusColor = (statut: string) => {
    if (statut === 'complete') return 'var(--good)'
    if (statut === 'valide') return 'var(--accent)'
    if (statut === 'annule') return 'var(--text-muted)'
    return 'var(--warn)'
  }

  const statusLabel = (statut: string) => {
    if (statut === 'complete') return 'Fait ✓'
    if (statut === 'valide') return 'Planifié'
    if (statut === 'annule') return 'Annulé'
    return 'Proposé'
  }

  return (
    <div style={{ height: 'calc(100dvh - 130px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Header actions */}
      <div style={{ padding: '16px 20px 0', display: 'flex', gap: 8, flexShrink: 0 }}>
        <button
          onClick={generateProgram}
          style={{
            flex: 1, padding: '10px 0',
            background: generating ? 'var(--surface)' : 'var(--accent)',
            border: 'none', borderRadius: 10,
            color: generating ? 'var(--text-muted)' : '#fff',
            fontSize: 12, fontWeight: 500,
          }}
        >
          {generating ? 'Génération...' : workouts.length > 0 ? 'Regénérer le programme' : 'Générer mon programme'}
        </button>
      </div>

      {/* Programme */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        {loading ? (
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 40 }}>Chargement...</div>
        ) : workouts.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: 60 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>💪</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>Aucune séance cette semaine</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Génère ton programme pour commencer</div>
          </div>
        ) : (
          Object.entries(grouped)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, dayWorkouts]: [string, any]) => (
              <div key={date} style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                  {new Date(date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' })}
                </div>
                {dayWorkouts.map((workout: any) => {
                  const config = TYPE_CONFIG[workout.type] ?? TYPE_CONFIG.muscu
                  return (
                    <div
                      key={workout.id}
                      style={{
                        background: 'var(--surface)',
                        border: `0.5px solid ${activeWorkout?.id === workout.id ? 'var(--accent)' : 'var(--border)'}`,
                        borderRadius: 12,
                        padding: '12px 14px',
                        marginBottom: 8,
                        cursor: 'pointer',
                      }}
                      onClick={() => setActiveWorkout(activeWorkout?.id === workout.id ? null : workout)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 30, height: 30, borderRadius: 8, background: config.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                          {config.emoji}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>{workout.titre}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{workout.duree_min} min</div>
                        </div>
                        <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 20, background: statusColor(workout.statut) + '22', color: statusColor(workout.statut) }}>
                          {statusLabel(workout.statut)}
                        </span>
                      </div>

                      {activeWorkout?.id === workout.id && (
                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '0.5px solid var(--border)' }}>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8 }}>
                            {workout.exercices?.split('|').map((ex: string, i: number) => (
                              <div key={i} style={{ padding: '3px 0' }}>· {ex.trim()}</div>
                            ))}
                          </div>
                          <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                            {workout.statut === 'propose' && (
                              <>
                                <button onClick={e => { e.stopPropagation(); updateStatus(workout.id, 'valide') }} style={{ flex: 1, padding: '7px 0', background: 'var(--accent-dim)', border: '0.5px solid var(--accent)', borderRadius: 8, fontSize: 10, color: 'var(--accent)' }}>
                                  Planifier
                                </button>
                                <button onClick={e => { e.stopPropagation(); updateStatus(workout.id, 'annule') }} style={{ flex: 1, padding: '7px 0', background: 'transparent', border: '0.5px solid var(--border)', borderRadius: 8, fontSize: 10, color: 'var(--text-muted)' }}>
                                  Ignorer
                                </button>
                              </>
                            )}
                            {workout.statut === 'valide' && (
                              <button onClick={e => { e.stopPropagation(); updateStatus(workout.id, 'complete', 6) }} style={{ flex: 1, padding: '7px 0', background: '#0d1f0d', border: '0.5px solid var(--good)', borderRadius: 8, fontSize: 10, color: 'var(--good)' }}>
                                Marquer comme fait ✓
                              </button>
                            )}
                            {workout.statut === 'complete' && (
                              <div style={{ fontSize: 10, color: 'var(--good)' }}>Séance complétée ✓</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))
        )}

        {/* Chat sport */}
        {workouts.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8 }}>Modifier ou demander une séance</div>
            {chatMessages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
                <div style={{
                  maxWidth: '85%', padding: '8px 12px', fontSize: 11, lineHeight: 1.6,
                  background: msg.role === 'user' ? 'var(--accent)' : 'var(--surface)',
                  border: msg.role === 'user' ? 'none' : '0.5px solid var(--border)',
                  borderRadius: msg.role === 'user' ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
                  color: msg.role === 'user' ? '#fff' : 'var(--text-secondary)',
                }}>{msg.text}</div>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'var(--surface)', borderRadius: 20, padding: '8px 14px', border: '0.5px solid var(--border)' }}>
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendChat()}
                placeholder="Change la séance de demain..."
                style={{ flex: 1, fontSize: 11, color: 'var(--text-primary)', background: 'transparent', border: 'none', outline: 'none' }}
              />
              <button onClick={sendChat} style={{ width: 22, height: 22, background: chatLoading ? 'var(--text-muted)' : 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff', border: 'none', cursor: 'pointer' }}>
                {chatLoading ? '...' : '↑'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}