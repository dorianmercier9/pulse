import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function POST() {
  try {
    // Récupère l'historique des 7 derniers jours
    const history = await sql`
      SELECT * FROM workouts 
      WHERE date >= CURRENT_DATE - INTERVAL '7 days'
      ORDER BY date DESC
    `

    const historyText = history.length > 0
      ? history.map((w: any) => `${w.date} — ${w.titre} (${w.statut})`).join('\n')
      : 'Aucune séance cette semaine'

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `Tu es le coach sportif de Dorian, 29 ans.

PROFIL :
- Ancien footballeur, arrêt 5 ans pour pieds, reprise récente
- Objectifs : recomposition 72→68kg, reprendre la course (5km), améliorer le sommeil
- Contexte médical : ténosynovite cheville gauche, kyste cheville droite, pieds valgus, Achille droit à surveiller. Fentes bulgares interdites.
- Équipement : haltères et poids de corps uniquement
- Protocole kiné cheville phase 1 en cours

HISTORIQUE SEMAINE :
${historyText}

Génère 3 à 5 séances pour les prochains jours. Réponds UNIQUEMENT en JSON valide :
[
  {
    "type": "kine|muscu|course|marche|cardio",
    "titre": "Nom court de la séance",
    "exercices": "Liste des exercices séparés par |",
    "duree_min": 30,
    "date": "YYYY-MM-DD"
  }
]

Règles :
- Inclure la routine kiné cheville quotidienne ou quasi-quotidienne
- Varier les groupes musculaires
- Pas de course si séance muscu intense la veille
- Dates à partir d'aujourd'hui (${new Date().toISOString().split('T')[0]})
- Maximum 1 séance par jour
- Jamais de fentes bulgares`
        }],
      }),
    })

    const data = await res.json()
    const rawText = data.content?.[0]?.text ?? '[]'
    const workouts = JSON.parse(rawText.replace(/```json|```/g, '').trim())

    // Sauvegarde en base
    for (const w of workouts) {
      await sql`
        INSERT INTO workouts (date, type, titre, exercices, duree_min, statut, created_at)
        VALUES (${w.date}, ${w.type}, ${w.titre}, ${w.exercices}, ${w.duree_min}, 'propose', ${new Date().toISOString()})
      `
    }

    return NextResponse.json({ success: true, workouts })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}