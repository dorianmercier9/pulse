import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request) {
  try {
    const { text } = await request.json()
    const date = new Date().toISOString().split('T')[0]

    // Claude parse le texte libre
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 200,
        messages: [{
          role: 'user',
          content: `Analyse ce repas et réponds UNIQUEMENT en JSON valide, sans aucun texte avant ou après :
{"meal_type": "Matin|Midi|Soir|Snack", "aliments": "liste des aliments", "heure": "HH:MM", "quantite": "Petit|Normal|Grand"}

Texte : "${text}"

Règles :
- meal_type selon le contexte ou l'heure mentionnée
- aliments : liste simple séparée par virgules
- heure : déduis selon le repas si non mentionnée (Matin=07:30, Midi=12:30, Soir=19:30, Snack=16:00)
- quantite : Normal par défaut`
        }],
      }),
    })

    const data = await res.json()
    const rawText = data.content?.[0]?.text ?? '{}'
    const parsed = JSON.parse(rawText.replace(/```json|```/g, '').trim())

    // Upsert en base
    await sql`CREATE TABLE IF NOT EXISTS nutrition (
      id SERIAL PRIMARY KEY, date TEXT, meal_type TEXT, aliments TEXT,
      quantite TEXT, heure TEXT, notes TEXT, created_at TEXT
    )`

    const existing = await sql`
      SELECT id FROM nutrition WHERE date = ${date} AND meal_type = ${parsed.meal_type}
    `

    if (existing.length > 0) {
      await sql`
        UPDATE nutrition SET aliments = ${parsed.aliments}, quantite = ${parsed.quantite}, heure = ${parsed.heure}
        WHERE date = ${date} AND meal_type = ${parsed.meal_type}
      `
    } else {
      await sql`
        INSERT INTO nutrition (date, meal_type, aliments, quantite, heure, notes, created_at)
        VALUES (${date}, ${parsed.meal_type}, ${parsed.aliments}, ${parsed.quantite}, ${parsed.heure}, null, ${new Date().toISOString()})
      `
    }

    return NextResponse.json({ success: true, parsed })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}