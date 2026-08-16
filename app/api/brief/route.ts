import { NextResponse } from 'next/server'

const GOOGLE_HEALTH_BASE = 'https://health.googleapis.com/v4/users/me'

async function getGoogleHealthToken() {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  })
  const data = await response.json()
  return data.access_token
}

async function getSleepData(token: string) {
  const res = await fetch(`${GOOGLE_HEALTH_BASE}/dataTypes/sleep/dataPoints`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}

async function getHRV(token: string) {
  const res = await fetch(`${GOOGLE_HEALTH_BASE}/dataTypes/heart-rate-variability/dataPoints`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}

async function getRestingHR(token: string) {
  const res = await fetch(`${GOOGLE_HEALTH_BASE}/dataTypes/daily-resting-heart-rate/dataPoints`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}

async function getWeather(lat: number, lon: number) {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weathercode,windspeed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Europe/Paris&forecast_days=1`
  )
  return res.json()
}

function parseSleep(sleepData: any) {
  const points = sleepData?.dataPoints ?? []
  const mainSleep = points.find((p: any) =>
    p.sleep?.metadata?.mainSleep && !p.sleep?.metadata?.nap
  )
  if (!mainSleep) return null

  const summary = mainSleep.sleep.summary ?? {}
  const stages = Object.fromEntries(
    (summary.stagesSummary ?? []).map((s: any) => [s.type, parseInt(s.minutes)])
  )
  const microReveils = mainSleep.sleep.shortAwakenings?.length ?? 0

  return {
    duree_totale_min: parseInt(summary.minutesAsleep ?? 0),
    profond_min: stages['DEEP'] ?? 0,
    rem_min: stages['REM'] ?? 0,
    leger_min: stages['LIGHT'] ?? 0,
    micro_reveils: microReveils,
  }
}

function parseHRV(hrvData: any) {
  const points = hrvData?.dataPoints ?? []
  const values = points
    .filter((p: any) => p.heartRateVariability)
    .map((p: any) => p.heartRateVariability.rootMeanSquareOfSuccessiveDifferencesMilliseconds)
  return values.length ? Math.round(values.reduce((a: number, b: number) => a + b, 0) / values.length * 10) / 10 : null
}

function parseRestingHR(hrData: any) {
  const points = hrData?.dataPoints ?? []
  return points[0]?.dailyRestingHeartRate?.beatsPerMinute ?? null
}

function buildPrompt(sleep: any, hrv: number | null, fc: any, weather: any) {
  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
  return `
PROFIL UTILISATEUR :
- Prénom : Dorian, 29 ans, ancien footballeur intensif
- Arrêt forcé 5 ans pour problèmes aux pieds, reprise très récente
- Objectifs : améliorer le sommeil, reprendre la course (5km), recomposition 72→68kg
- Contexte médical : ténosynovite cheville gauche, kyste cheville droite, pieds valgus, Achille droit à surveiller. Fentes bulgares interdites.
- Équipement : haltères et poids de corps uniquement
- Travaille en semaine 8h30-17h30

DONNÉES NUIT DU ${today} :
- Durée : ${sleep?.duree_totale_min} min (${Math.round((sleep?.duree_totale_min ?? 0) / 60 * 10) / 10}h)
- Profond : ${sleep?.profond_min} min | REM : ${sleep?.rem_min} min
- Micro-réveils : ${sleep?.micro_reveils}
- VFC : ${hrv} ms | FC repos : ${fc} bpm

MÉTÉO :
- Température : ${weather?.current?.temperature_2m}°C (max ${weather?.daily?.temperature_2m_max?.[0]}°C)
- Humidité : ${weather?.current?.relative_humidity_2m}%

INSTRUCTIONS :
Tu es Pulse, l'agent personnel de Dorian. Génère un brief du matin en français, 10 lignes max.
Ton de pote qui s'y connaît. Pas de bullets, pas d'emojis. Prose directe.
Honnête sur le sommeil, jamais complaisant. Recommandation sport réaliste selon météo et équipement.
Créneaux sport semaine : avant 8h ou après 18h uniquement.
`
}

export async function GET() {
  try {
    const token = await getGoogleHealthToken()

    const [sleepData, hrvData, hrData] = await Promise.all([
      getSleepData(token),
      getHRV(token),
      getRestingHR(token),
    ])

    const sleep = parseSleep(sleepData)
    const hrv = parseHRV(hrvData)
    const fc = parseRestingHR(hrData)

    const lat = 43.6047
    const lon = 1.4442
    
    const weather = await getWeather(lat, lon)

    const prompt = buildPrompt(sleep, hrv, fc, weather)

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const anthropicData = await anthropicRes.json()
    const brief = anthropicData.content?.[0]?.text ?? 'Brief indisponible'

    return NextResponse.json({
      brief,
      sleep,
      hrv,
      fc,
      weather: {
        temperature: weather?.current?.temperature_2m,
        temp_max: weather?.daily?.temperature_2m_max?.[0],
        humidite: weather?.current?.relative_humidity_2m,
      },
      date: new Date().toISOString().split('T')[0],
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}