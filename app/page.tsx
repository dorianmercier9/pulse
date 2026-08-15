'use client'

import { useState } from 'react'
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
  const [activeTab, setActiveTab] = useState('accueil')
  const [activeSheet, setActiveSheet] = useState<string | null>(null)

  const openSheet = (name: string) => setActiveSheet(name)
  const closeSheet = () => setActiveSheet(null)

  return (
    <main style={{ paddingBottom: 80 }}>
      <Header />

      {activeTab === 'accueil' && (
        <>
          {/* Bouton générer brief */}
          <div style={{ padding: '16px 20px 0' }}>
            <button
              onClick={() => openSheet('brief')}
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
              Générer mon brief
            </button>
          </div>

          <ScoreRing 
            score={76} 
            label="Récupération" 
            tag="Bon · entraîne-toi normalement"
            date="14 août"
          />

          <SleepStrip stages={SLEEP_STAGES} />

          {/* Sections */}
          <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SectionCard
              icon="🌙"
              iconBg="#13082a"
              title="Sommeil · 7h20"
              subtitle="20 micro-réveils · VFC 82ms · FC 49"
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
              icon="☀️"
              iconBg="#1a1300"
              title="Météo · 39°C"
              subtitle="Pas de sortie · chaleur extrême"
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
              subtitle="2 repas enregistrés · midi manquant"
              onClick={() => openSheet('food')}
            />
          </div>
        </>
      )}

      {activeTab === 'chat' && <ChatScreen />}

      {activeTab === 'stats' && <StatsScreen />}

      {/* OVERLAY */}
      {activeSheet && (
        <div
          onClick={closeSheet}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            zIndex: 100,
          }}
        />
      )}

      {/* SHEET BRIEF */}
      {activeSheet === 'brief' && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: 430,
          background: 'var(--surface)',
          borderRadius: '20px 20px 0 0',
          padding: '14px 20px 40px',
          zIndex: 101,
          maxHeight: '85vh',
          overflowY: 'auto',
        }}>
          <div style={{ width: 32, height: 4, background: '#2a2a2a', borderRadius: 2, margin: '0 auto 16px' }} />
          <button onClick={closeSheet} style={{ position: 'absolute', top: 14, right: 20, color: 'var(--text-muted)', fontSize: 18 }}>✕</button>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 14 }}>Brief du matin</div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: 20 }}>
            Nuit <strong style={{ color: 'var(--text-secondary)' }}>correcte sans être top</strong> — 7h20 avec 20 micro-réveils, tu as dormi en surface une bonne partie. Ta VFC est excellente à 82ms, système nerveux bien récupéré malgré tout.<br /><br />
            Avec <strong style={{ color: 'var(--text-secondary)' }}>39°C à Blagnac</strong> aujourd'hui, la sortie course est hors de question. Ce soir après 18h, session haltères à l'intérieur — upper body et gainage, zéro charge cheville.<br /><br />
            Rendu mémoire dans <strong style={{ color: 'var(--text-secondary)' }}>7 jours</strong> — si les séances commencent à bouffer du temps de cerveau, priorise.
          </p>
          <button style={{
            width: '100%',
            padding: 12,
            background: 'transparent',
            border: '0.5px solid var(--accent)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--accent)',
            fontSize: 12,
            fontWeight: 500,
          }}>
            Régénérer le brief
          </button>
        </div>
      )}

      {/* SHEET SOMMEIL */}
      {activeSheet === 'sleep' && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: 430,
          background: 'var(--surface)',
          borderRadius: '20px 20px 0 0',
          padding: '14px 20px 40px',
          zIndex: 101,
        }}>
          <div style={{ width: 32, height: 4, background: '#2a2a2a', borderRadius: 2, margin: '0 auto 16px' }} />
          <button onClick={closeSheet} style={{ position: 'absolute', top: 14, right: 20, color: 'var(--text-muted)', fontSize: 18 }}>✕</button>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 16 }}>Détail sommeil</div>
          {[
            { label: 'Durée', value: '7h20', tag: 'Correct', color: 'var(--good)' },
            { label: 'Profond', value: '92 min', tag: 'Bon', color: 'var(--good)' },
            { label: 'REM', value: '54 min', tag: 'Juste', color: 'var(--warn)' },
            { label: 'Micro-réveils', value: '20', tag: 'Agité', color: 'var(--warn)' },
            { label: 'Éveils longs', value: '49 min', tag: 'Élevé', color: 'var(--bad)' },
            { label: 'VFC', value: '82 ms', tag: 'Excellent', color: 'var(--good)' },
            { label: 'FC repos', value: '49 bpm', tag: 'Top', color: 'var(--good)' },
          ].map((row, i, arr) => (
            <div key={row.label} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 0',
              borderBottom: i < arr.length - 1 ? '0.5px solid var(--border)' : 'none',
            }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{row.label}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-primary)' }}>{row.value}</span>
                <span style={{
                  fontSize: 9,
                  padding: '2px 8px',
                  borderRadius: 20,
                  background: row.color + '22',
                  color: row.color,
                }}>{row.tag}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SHEET SPORT */}
{activeSheet === 'sport' && (
  <div style={{
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: 430,
    background: 'var(--surface)',
    borderRadius: '20px 20px 0 0',
    padding: '14px 20px 40px',
    zIndex: 101,
    maxHeight: '85vh',
    overflowY: 'auto',
  }}>
    <div style={{ width: 32, height: 4, background: '#2a2a2a', borderRadius: 2, margin: '0 auto 16px' }} />
    <button onClick={closeSheet} style={{ position: 'absolute', top: 14, right: 20, color: 'var(--text-muted)', fontSize: 18 }}>✕</button>
    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4 }}>Renforcement haut du corps</div>
    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 20 }}>Ce soir · 19h03 · 26 min 33s · Fitbit Air</div>

    {/* Stats grid */}
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

    {/* Zones cardiaques */}
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

    {/* Muscles */}
    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '16px 0 8px' }}>Zones musculaires</div>
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
      {['Épaules', 'Dos', 'Biceps'].map(m => (
        <span key={m} style={{ padding: '4px 10px', borderRadius: 20, background: '#0d1f0d', color: 'var(--good)', fontSize: 10 }}>{m}</span>
      ))}
      {['Core', 'Triceps'].map(m => (
        <span key={m} style={{ padding: '4px 10px', borderRadius: 20, background: 'var(--surface-2)', color: 'var(--text-muted)', fontSize: 10 }}>{m}</span>
      ))}
    </div>

    {/* Analyse agent */}
    <div style={{ background: 'var(--surface-2)', borderLeft: '2px solid var(--accent)', borderRadius: '0 10px 10px 0', padding: '10px 12px', marginBottom: 16 }}>
      <div style={{ fontSize: 9, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>Pulse · analyse</div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
        Bonne séance — FC restée en zone modérée sur la majorité. <strong style={{ color: 'var(--text-secondary)' }}>Pic à 114 bpm sur les curls</strong> uniquement. C'est ta 3ème session de la semaine. <strong style={{ color: 'var(--text-secondary)' }}>Aucune tension Achille</strong> pendant la séance.
      </div>
    </div>

    {/* Ressenti */}
    <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
  {[4, 5, 6, 7, 8].map(n => (
    <button key={n} onClick={() => setEffortScore(n)} style={{
      flex: 1,
      padding: '8px 0',
      background: n === effortScore ? 'var(--accent-dim)' : 'var(--surface-2)',
      border: `0.5px solid ${n === effortScore ? 'var(--accent)' : 'var(--border)'}`,
      borderRadius: 10,
      fontSize: 14,
      fontWeight: 500,
      color: n === effortScore ? 'var(--accent)' : 'var(--text-primary)',
    }}>{n}</button>
  ))}
</div>

    <button 
  onClick={closeSheet}
  style={{
    width: '100%',
    padding: 12,
    background: 'var(--accent)',
    border: 'none',
    borderRadius: 10,
    color: '#fff',
    fontSize: 12,
    fontWeight: 500,
  }}>
  Enregistrer
</button>
  </div>
)}

{/* SHEET MÉTÉO */}
{activeSheet === 'meteo' && (
  <div style={{
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: 430,
    background: 'var(--surface)',
    borderRadius: '20px 20px 0 0',
    padding: '14px 20px 40px',
    zIndex: 101,
  }}>
    <div style={{ width: 32, height: 4, background: '#2a2a2a', borderRadius: 2, margin: '0 auto 16px' }} />
    <button onClick={closeSheet} style={{ position: 'absolute', top: 14, right: 20, color: 'var(--text-muted)', fontSize: 18 }}>✕</button>
    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 16 }}>Météo · Blagnac</div>
    {[
      { label: 'Température', value: '37°C', tag: 'Extrême', color: 'var(--bad)' },
      { label: 'Max aujourd\'hui', value: '39.5°C', tag: null, color: null },
      { label: 'Min ce soir', value: '21°C', tag: 'Sortie ok', color: 'var(--good)' },
      { label: 'Humidité', value: '23%', tag: null, color: null },
      { label: 'Impact sport', value: 'Pas de sortie avant 20h', tag: null, color: 'var(--bad)' },
    ].map((row, i, arr) => (
      <div key={row.label} style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 0',
        borderBottom: i < arr.length - 1 ? '0.5px solid var(--border)' : 'none',
      }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{row.label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 500, color: row.color || 'var(--text-primary)' }}>{row.value}</span>
          {row.tag && (
            <span style={{
              fontSize: 9,
              padding: '2px 8px',
              borderRadius: 20,
              background: (row.color || 'var(--good)') + '22',
              color: row.color || 'var(--good)',
            }}>{row.tag}</span>
          )}
        </div>
      </div>
    ))}
  </div>
)}

{/* SHEET AGENDA */}
{activeSheet === 'agenda' && (
  <div style={{
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: 430,
    background: 'var(--surface)',
    borderRadius: '20px 20px 0 0',
    padding: '14px 20px 40px',
    zIndex: 101,
  }}>
    <div style={{ width: 32, height: 4, background: '#2a2a2a', borderRadius: 2, margin: '0 auto 16px' }} />
    <button onClick={closeSheet} style={{ position: 'absolute', top: 14, right: 20, color: 'var(--text-muted)', fontSize: 18 }}>✕</button>
    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 16 }}>Agenda · 14 jours</div>
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 0',
      borderBottom: '0.5px solid var(--border)',
    }}>
      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>21 août</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-primary)' }}>Rendu mémoire</span>
        <span style={{
          fontSize: 9,
          padding: '2px 8px',
          borderRadius: 20,
          background: 'var(--warn)22',
          color: 'var(--warn)',
        }}>7 jours</span>
      </div>
    </div>
    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 14 }}>
      Aucun autre événement prévu
    </div>
  </div>
)}


{/* SHEET ALIMENTATION */}
{activeSheet === 'food' && (
  <div style={{
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: 430,
    background: 'var(--surface)',
    borderRadius: '20px 20px 0 0',
    padding: '14px 20px 40px',
    zIndex: 101,
    maxHeight: '85vh',
    overflowY: 'auto',
  }}>
    <div style={{ width: 32, height: 4, background: '#2a2a2a', borderRadius: 2, margin: '0 auto 16px' }} />
    <button onClick={() => { closeSheet(); setFoodCategory(null) }} style={{ position: 'absolute', top: 14, right: 20, color: 'var(--text-muted)', fontSize: 18 }}>✕</button>

    {!foodCategory ? (
      <>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4 }}>Alimentation</div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 20 }}>Qu'est-ce que tu as mangé ?</div>

        {/* Repas tabs */}
<div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
  {['Matin', 'Midi', 'Soir', 'Snack'].map(m => (
    <button key={m} onClick={() => setActiveMeal(m)} style={{
      flex: 1,
      padding: '7px 0',
      background: m === activeMeal ? 'var(--accent-dim)' : 'var(--surface-2)',
      border: `0.5px solid ${m === activeMeal ? 'var(--accent)' : 'var(--border)'}`,
      borderRadius: 8,
      fontSize: 10,
      color: m === activeMeal ? 'var(--accent)' : 'var(--text-muted)',
    }}>{m}</button>
  ))}
</div>

        {/* Catégories */}
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
              background: 'var(--surface-2)',
              border: '0.5px solid var(--border)',
              borderRadius: 12,
              padding: '14px 10px',
              textAlign: 'center',
              cursor: 'pointer',
            }}>
              <div style={{ fontSize: 26, marginBottom: 6 }}>{cat.emoji}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{cat.label}</div>
            </button>
          ))}
        </div>

        <button style={{
          width: '100%',
          padding: '9px 0',
          background: 'transparent',
          border: '0.5px solid var(--border)',
          borderRadius: 10,
          fontSize: 11,
          color: 'var(--text-muted)',
          marginBottom: 14,
        }}>
          Pas mangé ce repas
        </button>

        {/* Mini chat */}
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 6 }}>Resto ou recette ? Dis-le moi</div>
        <div style={{
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          background: 'var(--surface-2)',
          borderRadius: 20,
          padding: '8px 14px',
          border: '0.5px solid var(--border)',
        }}>
          <span style={{ flex: 1, fontSize: 11, color: '#333' }}>Ex : pad thaï au resto ce soir...</span>
          <div style={{
            width: 22,
            height: 22,
            background: 'var(--accent)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            color: '#fff',
          }}>↑</div>
        </div>
      </>
    ) : (
      <>
        <button onClick={() => setFoodCategory(null)} style={{
          fontSize: 10,
          color: 'var(--text-muted)',
          marginBottom: 14,
          display: 'block',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}>← Catégories</button>

        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 16 }}>
          {{ proteins: 'Protéines', carbs: 'Féculents', veggies: 'Légumes', fruits: 'Fruits', dairy: 'Laitier', extras: 'Extras' }[foodCategory]}
        </div>

        {/* Aliments */}
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
          } as Record<string, {emoji: string, name: string}[]>)[foodCategory]?.map(food => (
            <button key={food.name} style={{
              background: 'var(--surface-2)',
              border: '0.5px solid var(--border)',
              borderRadius: 10,
              padding: '10px 6px',
              textAlign: 'center',
              cursor: 'pointer',
            }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>{food.emoji}</div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{food.name}</div>
            </button>
          ))}
        </div>

        {/* Quantité */}
        <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Quantité</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {['Petit', 'Normal', 'Grand'].map((q, i) => (
            <button key={q} style={{
              flex: 1,
              padding: '9px 0',
              background: i === 1 ? 'var(--accent-dim)' : 'var(--surface-2)',
              border: `0.5px solid ${i === 1 ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 10,
              fontSize: 11,
              color: i === 1 ? 'var(--accent)' : 'var(--text-muted)',
            }}>{q}</button>
          ))}
        </div>

        <button onClick={() => setFoodCategory(null)} style={{
          width: '100%',
          padding: 12,
          background: 'var(--accent)',
          border: 'none',
          borderRadius: 10,
          color: '#fff',
          fontSize: 12,
          fontWeight: 500,
        }}>
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
