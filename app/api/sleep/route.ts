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

function computeScore(sleep: any, hrv: number | null, fc: any): number {
  let score = 0

  // Durée sommeil (25 pts)
  const duration = sleep?.duree_totale_min ?? 0
  if (duration >= 480) score += 25
  else if (duration >= 420) score += 20
  else if (duration >= 360) score += 12
  else score += 0

  // Qualité sommeil profond + REM (20 pts)
  const deep = sleep?.profond_min ?? 0
  const rem = sleep?.rem_min ?? 0
  score += Math.min(deep / 90, 1) * 10
  score += Math.min(rem / 100, 1) * 10

  // VFC (30 pts)
  if (hrv) {
    if (hrv >= 100) score += 30
    else if (hrv >= 80) score += 25
    else if (hrv >= 60) score += 18
    else if (hrv >= 40) score += 10
  }

  // FC repos (15 pts)
  const hr = parseInt(fc ?? '70')
  if (hr <= 50) score += 15
  else if (hr <= 60) score += 10
  else if (hr <= 70) score += 5

  // Fragmentation (10 pts)
  const micro = sleep?.micro_reveils ?? 0
  if (micro <= 10) score += 10
  else if (micro <= 20) score += 5
  else score += 0

  return Math.round(Math.min(100, Math.max(0, score)))
}

function scoreTag(score: number): string {
  if (score >= 80) return 'Excellent · pousse aujourd\'hui'
  if (score >= 65) return 'Bon · entraîne-toi normalement'
  if (score >= 50) return 'Moyen · sois raisonnable'
  if (score >= 35) return 'Bas · privilégie la récupération'
  return 'Très bas · repos aujourd\'hui'
}

export async function GET() {
  try {
    const token = await getGoogleHealthToken()

    const [sleepRes, hrvRes, hrRes] = await Promise.all([
      fetch(`${GOOGLE_HEALTH_BASE}/dataTypes/sleep/dataPoints`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${GOOGLE_HEALTH_BASE}/dataTypes/heart-rate-variability/dataPoints`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${GOOGLE_HEALTH_BASE}/dataTypes/daily-resting-heart-rate/dataPoints`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])

    const [sleepData, hrvData, hrData] = await Promise.all([
      sleepRes.json(),
      hrvRes.json(),
      hrRes.json(),
    ])

    const sleep = parseSleep(sleepData)

    const hrvPoints = hrvData?.dataPoints ?? []
    const hrvValues = hrvPoints
      .filter((p: any) => p.heartRateVariability)
      .map((p: any) => p.heartRateVariability.rootMeanSquareOfSuccessiveDifferencesMilliseconds)
    const hrv = hrvValues.length
      ? Math.round(hrvValues.reduce((a: number, b: number) => a + b, 0) / hrvValues.length * 10) / 10
      : null

    const fc = hrData?.dataPoints?.[0]?.dailyRestingHeartRate?.beatsPerMinute ?? null

    const score = computeScore(sleep, hrv, fc)

    return NextResponse.json({
      sleep,
      hrv,
      fc,
      score,
      scoreTag: scoreTag(score),
      date: new Date().toISOString().split('T')[0],
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}