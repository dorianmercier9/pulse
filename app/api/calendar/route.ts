import { NextResponse } from 'next/server'

async function getGoogleToken() {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: process.env.GOOGLE_CALENDAR_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  })
  const data = await response.json()
  return data.access_token
}

export async function GET() {
  try {
    const token = await getGoogleToken()

    const now = new Date()
    const in14days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${now.toISOString()}&timeMax=${in14days.toISOString()}&singleEvents=true&orderBy=startTime&maxResults=10`,
      { headers: { Authorization: `Bearer ${token}` } }
    )

    const data = await res.json()
    const events = (data.items ?? []).map((item: any) => ({
      titre: item.summary ?? 'Sans titre',
      date: item.start?.dateTime ?? item.start?.date ?? '',
    }))

    return NextResponse.json(events)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}