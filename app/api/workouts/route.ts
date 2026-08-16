import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

async function initTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS workouts (
      id SERIAL PRIMARY KEY,
      date TEXT,
      type TEXT,
      titre TEXT,
      exercices TEXT,
      duree_min INTEGER,
      statut TEXT DEFAULT 'propose',
      ressenti INTEGER,
      created_at TEXT
    )
  `
}

export async function GET() {
  try {
    await initTable()
    const rows = await sql`
      SELECT * FROM workouts 
      WHERE date >= CURRENT_DATE - INTERVAL '7 days'
      ORDER BY date DESC, created_at DESC
    `
    return NextResponse.json(rows)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await initTable()
    const { type, titre, exercices, duree_min, date, statut } = await request.json()
    const created_at = new Date().toISOString()
    const workout_date = date ?? new Date().toISOString().split('T')[0]

    const result = await sql`
      INSERT INTO workouts (date, type, titre, exercices, duree_min, statut, created_at)
      VALUES (${workout_date}, ${type}, ${titre}, ${exercices}, ${duree_min}, ${statut ?? 'propose'}, ${created_at})
      RETURNING id
    `
    return NextResponse.json({ success: true, id: result[0].id })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    await initTable()
    const { id, statut, ressenti } = await request.json()
    await sql`
      UPDATE workouts SET statut = ${statut}, ressenti = ${ressenti ?? null}
      WHERE id = ${id}
    `
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}