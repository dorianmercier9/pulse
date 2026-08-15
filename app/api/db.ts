import { neon } from '@neondatabase/serverless'

export const sql = neon(process.env.DATABASE_URL!)

export async function initDB() {
  await sql`
    CREATE TABLE IF NOT EXISTS daily_health (
      date TEXT PRIMARY KEY,
      sleep_duration_min INTEGER,
      sleep_deep_min INTEGER,
      sleep_rem_min INTEGER,
      sleep_light_min INTEGER,
      micro_reveils INTEGER,
      eveil_min INTEGER,
      hrv_avg REAL,
      resting_hr INTEGER,
      phase TEXT DEFAULT 'reconstruction',
      created_at TEXT
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS daily_weather (
      date TEXT PRIMARY KEY,
      ville TEXT,
      temp_max REAL,
      temp_min REAL,
      temperature REAL,
      humidite INTEGER,
      precipitation_mm REAL,
      created_at TEXT
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS sport_sessions (
      id SERIAL PRIMARY KEY,
      date TEXT,
      type TEXT,
      distance_km REAL,
      duree_min REAL,
      allure TEXT,
      douleur_pendant INTEGER,
      douleur_apres INTEGER,
      ressenti INTEGER,
      created_at TEXT
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS memory (
      key TEXT PRIMARY KEY,
      value TEXT,
      context TEXT,
      created_at TEXT,
      updated_at TEXT
    )
  `
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