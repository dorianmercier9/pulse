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

    await sql`
      INSERT INTO nutrition (date, meal_type, aliments, quantite, heure, notes, created_at)
      VALUES (${date}, ${meal_type}, ${aliments}, ${quantite}, ${heure}, ${notes}, ${created_at})
    `

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET() {
  try {
    await initTable()
    const date = new Date().toISOString().split('T')[0]
    const rows = await sql`
      SELECT * FROM nutrition WHERE date = ${date} ORDER BY heure ASC
    `
    return NextResponse.json(rows)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}