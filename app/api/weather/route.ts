import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const lat = 44.8378
    const lon = -0.5792
    
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weathercode,windspeed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Europe/Paris&forecast_days=1`
    )
    const data = await res.json()

    return NextResponse.json({
      temperature: data?.current?.temperature_2m,
      temp_max: data?.daily?.temperature_2m_max?.[0],
      temp_min: data?.daily?.temperature_2m_min?.[0],
      humidite: data?.current?.relative_humidity_2m,
      vent_kmh: data?.current?.windspeed_10m,
      precipitation_mm: data?.daily?.precipitation_sum?.[0],
      ville: 'Bordeaux',
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}