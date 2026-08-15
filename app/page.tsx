'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import ScoreRing from '@/components/ScoreRing'
import SleepStrip from '@/components/SleepStrip'
import SectionCard from '@/components/SectionCard'
import BottomNav from '@/components/BottomNav'
import ChatScreen from '@/components/ChatScreen'
import StatsScreen from '@/components/StatsScreen'

const SLEEP_STAGES = [
  { type: 'deep' as const, flex: 2 },
  { type: 'light' as const, flex: 5 },
  { type: 'rem' as const, flex: 2 },
  { type: 'light' as const, flex: 4 },
  { type: 'deep' as const, flex: 1 },
  { type: 'awake' as const, flex: 1 },
  { type: 'light' as const, flex: 3 },
]

export default function Home() {
  const [activeMeal, setActiveMeal] = useState('Matin')
  const [foodCategory, setFoodCategory] = useState<string | null>(null)
  const [effortScore, setEffortScore] = useState(6)
  const [mealNotEaten, setMealNotEaten] = useState(false)
  const [mealTime, setMealTime] = useState('07:00')
  const [activeTab, setActiveTab] = useState('accueil')
  const [activeSheet, setActiveSheet] = useState<string | null>(null)
  const [brief, setBrief] = useState<string | null>(null)
  const [briefLoading, setBriefLoading] = useState(false)
  const [sleepData, setSleepData] = useState<any>(null)
  const [weatherData, setWeatherData] = useState<any>(null)
  const [dataLoading, setDataLoading] = useState(true)

  const openSheet = (name: string) => setActiveSheet(name)
  const closeSheet = () => setActiveSheet(null)

  useEffect(() => {
    async function loadData() {
      try {
        const [sleepRes, weatherRes] = await Promise.all([
          fetch('/api/sleep'),
          fetch('/api/weather'),
        ])
        const [sleep, weather] = await Promise.all([
          sleepRes.json(),
          weatherRes.json(),
        ])
        setSleepData(sleep)
        setWeatherData(weather)
      } catch (e) {
        console.error('Erreur chargement données', e)
      }
      setDataLoading(false)
    }
    loadData()
  }, [])

  const sleepHours = sleepData?.sleep
    ? `${Math.floor(sleepData.sleep.duree_totale_min / 60)}h${sleepData.sleep.duree_totale_min % 60 > 0 ? (sleepData.sleep.duree_totale_min % 60) : ''}`
    : '—'

  const tempMax = weatherData?.temp_max ? `${Math.round(weatherData.temp_max)}°C` : '—'
  const weatherSubtitle = weatherData
    ? weatherData.temp_max > 35
      ? `Pas de sortie · chaleur extrême`
      : weatherData.temp_max > 28
      ? `Sortie possible le soir`
      : `Conditions favorables`
    : '—'

  const weatherIcon = weatherData
    ? weatherData.temp_max > 30 ? '☀️' : weatherData.precipitation_mm > 0 ? '🌧️' : '⛅'
    : '🌤️'

  return (
    <main style={{ paddingBottom: 80 }}>
      <Header />

      {activeTab === 'accueil' && (
        <>
          <div style={{ padding: '16px 20px 0' }}>
            <button
              onClick={async () => {
                setBriefLoading(true)
                openSheet('brief')
                try {
                  const res = await fetch('/api/brief')
                  const data = await res.json()
                  setBrief(data.brief)
                } catch (e) {
                  setBrief('Erreur lors de la génération du brief.')
                }
                setBriefLoading(false)
              }}
              style={{
                width: '100%',
                padding: '12px',
                background: 'var(--accent)',
                borderRadius: '10px',
                color: '#fff',
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: '0.02em',
              }}
            >
              {briefLoading ? 'Génération...' : 'Générer mon brief'}
            </button>
          </div>

          <ScoreRing
            score={76}
            label="Récupération"
            tag="Bon · entraîne-toi normalement"
            date={sleepData?.date
              ? new Date(sleepData.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
              : '14 août'}
          />

          <SleepStrip stages={SLEEP_STAGES} />

          <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SectionCard
              icon="🌙"
              iconBg="#13082a"
              title={`Sommeil · ${sleepHours}`}
              subtitle={sleepData?.sleep
                ? `${sleepData.sleep.micro_reveils} micro-réveils · VFC ${sleepData.hrv}ms · FC ${sleepData.fc}`
                : dataLoading ? 'Chargement...' : 'Données indisponibles'}
              onClick={() => openSheet('sleep')}
            />
            <SectionCard
              icon="💪"
              iconBg="#091a09"
              title="Sport du jour"
              subtitle="Haltères · soir après 18h"
              badge="Résumé disponible"
              hasNotif
              onClick={() => openSheet('sport')}
            />
            <SectionCard
              icon={weatherIcon}
              iconBg="#1a1300"
              title={`Météo · ${tempMax}`}
              subtitle={weatherSubtitle}
              onClick={() => openSheet('meteo')}
            />
            <SectionCard
              icon="📅"
              iconBg="#080f1a"
              title="Agenda"
              subtitle="Rendu mémoire dans 7 jours"
              onClick={() => openSheet('agenda')}
            />
            <SectionCard
              icon="🍽️"
              iconBg="#1a0d00"
              title="Alimentation"
              subtitle="Ajoute ton premier repas"
              onClick={() => openSheet('food')}
            />
          </div>
        </>
      )}

      {activeTab === 'chat' && <ChatScreen />}
      {activeTab === 'stats' && <StatsScreen />}

      {activeSheet && (
        <div
          onClick={closeSheet}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 100 }}
        />
      )}

      {/* SHEET BRIEF */}
      {activeSheet === 'brief' && (
        <div style={{
          position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: 430, background: 'var(--surface)',
          borderRadius: '20px 20px 0 0', padding: '14px 20px 40px', zIndex: 101,
          maxHeight: '85vh', overflowY: 'auto',
        }}>
          <div style={{ width: 32, height: 4, background: '#2a2a2a', borderRadius: 2, margin: '0 auto 16px' }} />
          <button onClick={closeSheet} style={{ position: 'absolute', top: 14, right: 20, color: 'var(--text-muted)', fontSize: 18 }}>✕</button>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 14 }}>Brief du matin</div>
          {briefLoading ? (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: 20 }}>
              Récupération de tes données...
            </p>
          ) : brief ? (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: 20 }}>
              {brief}
            </p>
          ) : (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: 20 }}>
              Appuie sur "Générer mon brief" pour commencer.
            </p>
          )}
          <button
            onClick={async () => {
              setBriefLoading(true)
              try {
                const res = await fetch('/api/brief')
                const data = await res.json()
                setBrief(data.brief)
              } catch (e) {
                setBrief('Erreur lors de la génération du brief.')
              }
              setBriefLoading(false)
            }}
            style={{
              width: '100%', padding: 12, background: 'transparent',
              border: '0.5px solid var(--accent)', borderRadius: '10px',
              color: 'var(--accent)', fontSize: 12, fontWeight: 500,
            }}>
            {briefLoading ? 'Génération...' : 'Régénérer le brief'}
          </button>
        </div>
      )}

      {/* SHEET SOMMEIL */}
      {activeSheet === 'sleep' && (
        <div style={{
          position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: 430, background: 'var(--surface)',
          borderRadius: '20px 20px 0 0', padding: '14px 20px 40px', zIndex: 101,
        }}>
          <div style={{ width: 32, height: 4, background: '#2a2a2a', borderRadius: 2, margin: '0 auto 16px' }} />
          <button onClick={closeSheet} style={{ position: 'absolute', top: 14, right: 20, color: 'var(--text-muted)', fontSize: 18 }}>✕</button>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 16 }}>Détail sommeil</div>
          {[
            { label: 'Durée', value: sleepHours, tag: sleepData?.sleep?.duree_totale_min >= 420 ? 'Bon' : 'Court', color: sleepData?.sleep?.duree_totale_min >= 420 ? 'var(--good)' : 'var(--warn)' },
            { label: 'Profond', value: `${sleepData?.sleep?.profond_min ?? '—'} min`, tag: (sleepData?.sleep?.profond_min ?? 0) >= 80 ? 'Bon' : 'Juste', color: (sleepData?.sleep?.profond_min ?? 0) >= 80 ? 'var(--good)' : 'var(--warn)' },
            { label: 'REM', value: `${sleepData?.sleep?.rem_min ?? '—'} min`, tag: (sleepData?.sleep?.rem_min ?? 0) >= 80 ? 'Bon' : 'Juste', color: (sleepData?.sleep?.rem_min ?? 0) >= 80 ? 'var(--good)' : 'var(--warn)' },
            { label: 'Micro-réveils', value: `${sleepData?.sleep?.micro_reveils ?? '—'}`, tag: (sleepData?.sleep?.micro_reveils ?? 0) <= 10 ? 'Normal' : 'Agité', color: (sleepData?.sleep?.micro_reveils ?? 0) <= 10 ? 'var(--good)' : 'var(--warn)' },
            { label: 'VFC', value: `${sleepData?.hrv ?? '—'} ms`, tag: (sleepData?.hrv ?? 0) >= 80 ? 'Excellent' : 'Bon', color: (sleepData?.hrv ?? 0) >= 80 ? 'var(--good)' : 'var(--warn)' },
            { label: 'FC repos', value: `${sleepData?.fc ?? '—'} bpm`, tag: (parseInt(sleepData?.fc) ?? 60) <= 55 ? 'Top' : 'Bon', color: 'var(--good)' },
          ].map((row, i, arr) => (
            <div key={row.label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0', borderBottom: i < arr.length - 1 ? '0.5px solid var(--border)' : 'none',
            }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{row.label}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-primary)' }}>{row.value}</span>
                <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 20, background: row.color + '22', color: row.color }}>{row.tag}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SHEET SPORT */}
      {activeSheet === 'sport' && (
        <div style={{
          position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: 430, background: 'var(--surface)',
          borderRadius: '20px 20px 0 0', padding: '14px 20px 40px', zIndex: 101,
          maxHeight: '85vh', overflowY: 'auto',
        }}>
          <div style={{ width: 32, height: 4, background: '#2a2a2a', borderRadius: 2, margin: '0 auto 16px' }} />
          <button onClick={closeSheet} style={{ position: 'absolute', top: 14, right: 20, color: 'var(--text-muted)', fontSize: 18 }}>✕</button>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4 }}>Renforcement haut du corps</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 20 }}>Ce soir · 19h03 · 26 min 33s · Fitbit Air</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
            {[
              { label: 'FC moyenne', value: '91', unit: 'bpm' },
              { label: 'FC pic', value: '114', unit: 'bpm' },
              { label: 'Calories', value: '120', unit: 'cal' },
              { label: 'Durée', value: '26', unit: 'min' },
            ].map(stat => (
              <div key={stat.label} style={{ background: 'var(--surface-2)', borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{stat.label}</div>
                <div style={{ fontSize: 20, fontWeight: 500, color: 'var(--text-primary)' }}>
                  {stat.value}<span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 2 }}>{stat.unit}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Zones cardiaques</div>
          {[
            { name: 'Récupération active', pct: 45, color: 'var(--good)' },
            { name: 'Cardio modéré', pct: 40, color: 'var(--warn)' },
            { name: 'Intensité haute', pct: 15, color: 'var(--bad)' },
          ].map(zone => (
            <div key={zone.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: zone.color, flexShrink: 0 }} />
              <div style={{ fontSize: 10, color: 'var(--text-muted)', flex: 1 }}>{zone.name}</div>
              <div style={{ flex: 2, height: 4, background: 'var(--surface-2)', borderRadius: 2 }}>
                <div style={{ width: `${zone.pct}%`, height: 4, background: zone.color, borderRadius: 2 }} />
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', minWidth: 28, textAlign: 'right' }}>{zone.pct}%</div>
            </div>
          ))}
          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '16px 0 8px' }}>Zones musculaires</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {['Épaules', 'Dos', 'Biceps'].map(m => (
              <span key={m} style={{ padding: '4px 10px', borderRadius: 20, background: '#0d1f0d', color: 'var(--good)', fontSize: 10 }}>{m}</span>
            ))}
            {['Core', 'Triceps'].map(m => (
              <span key={m} style={{ padding: '4px 10px', borderRadius: 20, background: 'var(--surface-2)', color: 'var(--text-muted)', fontSize: 10 }}>{m}</span>
            ))}
          </div>
          <div style={{ background: 'var(--surface-2)', borderLeft: '2px solid var(--accent)', borderRadius: '0 10px 10px 0', padding: '10px 12px', marginBottom: 16 }}>
            <div style={{ fontSize: 9, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>Pulse · analyse</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Bonne séance — FC restée en zone modérée sur la majorité. <strong style={{ color: 'var(--text-secondary)' }}>Pic à 114 bpm sur les curls</strong> uniquement. C'est ta 3ème session de la semaine. <strong style={{ color: 'var(--text-secondary)' }}>Aucune tension Achille</strong> pendant la séance.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
            {[4, 5, 6, 7, 8].map(n => (
              <button key={n} onClick={() => setEffortScore(n)} style={{
                flex: 1, padding: '8px 0',
                background: n === effortScore ? 'var(--accent-dim)' : 'var(--surface-2)',
                border: `0.5px solid ${n === effortScore ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 10, fontSize: 14, fontWeight: 500,
                color: n === effortScore ? 'var(--accent)' : 'var(--text-primary)',
              }}>{n}</button>
            ))}
          </div>
          <button onClick={closeSheet} style={{
            width: '100%', padding: 12, background: 'var(--accent)',
            border: 'none', borderRadius: 10, color: '#fff', fontSize: 12, fontWeight: 500,
          }}>Enregistrer</button>
        </div>
      )}

      {/* SHEET MÉTÉO */}
      {activeSheet === 'meteo' && (
        <div style={{
          position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: 430, background: 'var(--surface)',
          borderRadius: '20px 20px 0 0', padding: '14px 20px 40px', zIndex: 101,
        }}>
          <div style={{ width: 32, height: 4, background: '#2a2a2a', borderRadius: 2, margin: '0 auto 16px' }} />
          <button onClick={closeSheet} style={{ position: 'absolute', top: 14, right: 20, color: 'var(--text-muted)', fontSize: 18 }}>✕</button>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 16 }}>Météo · {weatherData?.ville ?? 'Bordeaux'}</div>
          {[
            { label: 'Température', value: `${weatherData?.temperature ?? '—'}°C`, tag: (weatherData?.temperature ?? 0) > 35 ? 'Extrême' : 'Ok', color: (weatherData?.temperature ?? 0) > 35 ? 'var(--bad)' : 'var(--good)' },
            { label: "Max aujourd'hui", value: `${weatherData?.temp_max ?? '—'}°C`, tag: null, color: null },
            { label: 'Min ce soir', value: `${weatherData?.temp_min ?? '—'}°C`, tag: 'Sortie ok', color: 'var(--good)' },
            { label: 'Humidité', value: `${weatherData?.humidite ?? '—'}%`, tag: null, color: null },
            { label: 'Vent', value: `${weatherData?.vent_kmh ?? '—'} km/h`, tag: null, color: null },
          ].map((row, i, arr) => (
            <div key={row.label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0', borderBottom: i < arr.length - 1 ? '0.5px solid var(--border)' : 'none',
            }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{row.label}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 500, color: row.color || 'var(--text-primary)' }}>{row.value}</span>
                {row.tag && (
                  <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 20, background: (row.color || 'var(--good)') + '22', color: row.color || 'var(--good)' }}>{row.tag}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SHEET AGENDA */}
      {activeSheet === 'agenda' && (
        <div style={{
          position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: 430, background: 'var(--surface)',
          borderRadius: '20px 20px 0 0', padding: '14px 20px 40px', zIndex: 101,
        }}>
          <div style={{ width: 32, height: 4, background: '#2a2a2a', borderRadius: 2, margin: '0 auto 16px' }} />
          <button onClick={closeSheet} style={{ position: 'absolute', top: 14, right: 20, color: 'var(--text-muted)', fontSize: 18 }}>✕</button>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 16 }}>Agenda · 14 jours</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '0.5px solid var(--border)' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>21 août</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-primary)' }}>Rendu mémoire</span>
              <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 20, background: 'var(--warn)22', color: 'var(--warn)' }}>7 jours</span>
            </div>
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 14 }}>Aucun autre événement prévu</div>
        </div>
      )}

      {/* SHEET ALIMENTATION */}
      {activeSheet === 'food' && (
        <div style={{
          position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: 430, background: 'var(--surface)',
          borderRadius: '20px 20px 0 0', padding: '14px 20px 40px', zIndex: 101,
          maxHeight: '85vh', overflowY: 'auto',
        }}>
          <div style={{ width: 32, height: 4, background: '#2a2a2a', borderRadius: 2, margin: '0 auto 16px' }} />
          <button onClick={() => { closeSheet(); setFoodCategory(null) }} style={{ position: 'absolute', top: 14, right: 20, color: 'var(--text-muted)', fontSize: 18 }}>✕</button>

          {!foodCategory ? (
            <>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4 }}>Alimentation</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 20 }}>Qu'est-ce que tu as mangé ?</div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                {['Matin', 'Midi', 'Soir', 'Snack'].map(m => (
                  <button key={m} onClick={() => {
                    setActiveMeal(m)
                    setMealNotEaten(false)
                    const defaultTimes: Record<string, string> = { 'Matin': '07:00', 'Midi': '12:00', 'Soir': '19:00', 'Snack': '16:00' }
                    setMealTime(defaultTimes[m])
                  }} style={{
                    flex: 1, padding: '7px 0',
                    background: m === activeMeal ? 'var(--accent-dim)' : 'var(--surface-2)',
                    border: `0.5px solid ${m === activeMeal ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 8, fontSize: 10,
                    color: m === activeMeal ? 'var(--accent)' : 'var(--text-muted)',
                  }}>{m}</button>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Heure</span>
                <input type="time" value={mealTime} onChange={e => setMealTime(e.target.value)} style={{
                  background: 'var(--surface-2)', border: '0.5px solid var(--border)',
                  borderRadius: 8, padding: '6px 10px', fontSize: 12,
                  color: 'var(--text-primary)', outline: 'none',
                }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
                {[
                  { key: 'proteins', emoji: '🥩', label: 'Protéines' },
                  { key: 'carbs', emoji: '🌾', label: 'Féculents' },
                  { key: 'veggies', emoji: '🥦', label: 'Légumes' },
                  { key: 'fruits', emoji: '🍎', label: 'Fruits' },
                  { key: 'dairy', emoji: '🧀', label: 'Laitier' },
                  { key: 'extras', emoji: '🍫', label: 'Extras' },
                ].map(cat => (
                  <button key={cat.key} onClick={() => setFoodCategory(cat.key)} style={{
                    background: 'var(--surface-2)', border: '0.5px solid var(--border)',
                    borderRadius: 12, padding: '14px 10px', textAlign: 'center', cursor: 'pointer',
                  }}>
                    <div style={{ fontSize: 26, marginBottom: 6 }}>{cat.emoji}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{cat.label}</div>
                  </button>
                ))}
              </div>
              <button onClick={() => setMealNotEaten(!mealNotEaten)} style={{
                width: '100%', padding: '9px 0',
                background: mealNotEaten ? '#1a0a00' : 'transparent',
                border: `0.5px solid ${mealNotEaten ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 10, fontSize: 11,
                color: mealNotEaten ? 'var(--accent)' : 'var(--text-muted)', marginBottom: 14,
              }}>
                {mealNotEaten ? '✓ Pas mangé ce repas' : 'Pas mangé ce repas'}
              </button>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 6 }}>Resto ou recette ? Dis-le moi</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'var(--surface-2)', borderRadius: 20, padding: '8px 14px', border: '0.5px solid var(--border)' }}>
                <span style={{ flex: 1, fontSize: 11, color: '#333' }}>Ex : pad thaï au resto ce soir...</span>
                <div style={{ width: 22, height: 22, background: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff' }}>↑</div>
              </div>
            </>
          ) : (
            <>
              <button onClick={() => setFoodCategory(null)} style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 14, display: 'block', background: 'none', border: 'none', cursor: 'pointer' }}>← Catégories</button>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 16 }}>
                {{ proteins: 'Protéines', carbs: 'Féculents', veggies: 'Légumes', fruits: 'Fruits', dairy: 'Laitier', extras: 'Extras' }[foodCategory]}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 20 }}>
                {({
                  proteins: [
                    { emoji: '🍗', name: 'Poulet' }, { emoji: '🥚', name: 'Oeuf' },
                    { emoji: '🐟', name: 'Thon' }, { emoji: '🥩', name: 'Boeuf' },
                    { emoji: '🍣', name: 'Saumon' }, { emoji: '🐷', name: 'Porc' },
                    { emoji: '🫘', name: 'Légumineuses' }, { emoji: '🦐', name: 'Crevettes' },
                  ],
                  carbs: [
                    { emoji: '🍚', name: 'Riz' }, { emoji: '🍝', name: 'Pâtes' },
                    { emoji: '🥔', name: 'Pomme de terre' }, { emoji: '🍞', name: 'Pain' },
                    { emoji: '🌽', name: 'Maïs' }, { emoji: '🥣', name: 'Flocons avoine' },
                    { emoji: '🫓', name: 'Tortilla' }, { emoji: '🍠', name: 'Patate douce' },
                  ],
                  veggies: [
                    { emoji: '🥦', name: 'Brocoli' }, { emoji: '🥕', name: 'Carotte' },
                    { emoji: '🥗', name: 'Salade' }, { emoji: '🍅', name: 'Tomate' },
                    { emoji: '🫑', name: 'Poivron' }, { emoji: '🧅', name: 'Oignon' },
                    { emoji: '🥒', name: 'Concombre' }, { emoji: '🍆', name: 'Aubergine' },
                  ],
                  fruits: [
                    { emoji: '🍌', name: 'Banane' }, { emoji: '🍎', name: 'Pomme' },
                    { emoji: '🍊', name: 'Orange' }, { emoji: '🍇', name: 'Raisin' },
                    { emoji: '🥝', name: 'Kiwi' }, { emoji: '🍓', name: 'Fraise' },
                    { emoji: '🍍', name: 'Ananas' }, { emoji: '🍉', name: 'Pastèque' },
                  ],
                  dairy: [
                    { emoji: '🧀', name: 'Fromage' }, { emoji: '🥛', name: 'Lait' },
                    { emoji: '🍦', name: 'Yaourt' }, { emoji: '🧈', name: 'Beurre' },
                  ],
                  extras: [
                    { emoji: '🍫', name: 'Chocolat' }, { emoji: '🥜', name: 'Noix' },
                    { emoji: '🍕', name: 'Pizza' }, { emoji: '🍔', name: 'Burger' },
                    { emoji: '🍷', name: 'Vin' }, { emoji: '🍺', name: 'Bière' },
                  ],
                } as Record<string, { emoji: string; name: string }[]>)[foodCategory]?.map(food => (
                  <button key={food.name} style={{ background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: 10, padding: '10px 6px', textAlign: 'center', cursor: 'pointer' }}>
                    <div style={{ fontSize: 24, marginBottom: 4 }}>{food.emoji}</div>
                    <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{food.name}</div>
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Quantité</div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {['Petit', 'Normal', 'Grand'].map((q, i) => (
                  <button key={q} style={{
                    flex: 1, padding: '9px 0',
                    background: i === 1 ? 'var(--accent-dim)' : 'var(--surface-2)',
                    border: `0.5px solid ${i === 1 ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 10, fontSize: 11,
                    color: i === 1 ? 'var(--accent)' : 'var(--text-muted)',
                  }}>{q}</button>
                ))}
              </div>
              <button onClick={() => setFoodCategory(null)} style={{ width: '100%', padding: 12, background: 'var(--accent)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 12, fontWeight: 500 }}>
                Ajouter
              </button>
            </>
          )}
        </div>
      )}

      <BottomNav active={activeTab} onChange={setActiveTab} />
    </main>
  )
}