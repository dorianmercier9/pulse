import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

async function initTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS nutrition (
      id SERIAL PRIMARY KEY,
      date TEXT,
      meal_type TEXT,
      aliments TEXT,
      quantite TEXT,
      heure TEXT,
      notes TEXT,
      created_at TEXT
    )
  `
}

export async function POST(request: Request) {
  try {
    await initTable()
    const { meal_type, aliments, quantite, heure, notes } = await request.json()
    const date = new Date().toISOString().split('T')[0]
    const created_at = new Date().toISOString()

    const existing = await sql`
      SELECT id FROM nutrition WHERE date = ${date} AND meal_type = ${meal_type}
    `

    if (existing.length > 0) {
      await sql`
        UPDATE nutrition 
        SET aliments = ${aliments}, quantite = ${quantite}, heure = ${heure}, notes = ${notes}
        WHERE date = ${date} AND meal_type = ${meal_type}
      `
    } else {
      await sql`
        INSERT INTO nutrition (date, meal_type, aliments, quantite, heure, notes, created_at)
        VALUES (${date}, ${meal_type}, ${aliments}, ${quantite}, ${heure}, ${notes}, ${created_at})
      `
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    await initTable()
    const { searchParams } = new URL(request.url)
    const brief = searchParams.get('brief')
    const date = new Date().toISOString().split('T')[0]

    const rows = await sql`
      SELECT * FROM nutrition WHERE date = ${date} ORDER BY heure ASC
    `

    if (brief === 'true' && rows.length > 0) {
      const repas = rows.map((r: any) =>
        r.aliments === 'PAS_MANGE' ? `${r.meal_type} : pas mangé` : `${r.meal_type} (${r.heure}) : ${r.aliments}`
      ).join('\n')

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
            content: `Dorian, 29 ans, objectif recomposition corporelle (72→68kg), reprend le sport progressivement.

Repas du jour :
${repas}

Fais une observation courte (2-3 phrases max) sur son alimentation du jour. Ton de pote, pas de médecin. Dis ce qui manque ou ce qui est bien, et une suggestion simple pour le reste de la journée si pertinent. Pas de bullet points.`
          }],
        }),
      })

      const data = await res.json()
      const observation = data.content?.[0]?.text ?? ''
      return NextResponse.json({ meals: rows, observation })
    }

    return NextResponse.json(rows)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}