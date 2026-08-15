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

    return NextResponse.json({ sleep, hrv, fc, date: new Date().toISOString().split('T')[0] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}