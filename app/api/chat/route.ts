import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { message, history } = await request.json()

    const systemPrompt = `Tu es Pulse, l'agent personnel de Dorian — coach sportif, kiné, nutritionniste et conseiller bien-être.
Tu connais parfaitement son profil médical : ténosynovite cheville gauche, kyste cheville droite, pieds valgus, tendon Achille droit à surveiller. Fentes bulgares interdites.
Équipement : haltères et poids de corps uniquement.
Objectifs : améliorer le sommeil, reprendre la course (5km), recomposition 72→68kg.
Travaille en semaine 8h30-17h30. Créneaux sport : avant 8h ou après 18h.
Réponds en français, ton de pote qui s'y connaît. Concis et actionnable. Jamais moralisateur.`

    const messages = [
      ...(history ?? []),
      { role: 'user', content: message },
    ]

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 500,
        system: systemPrompt,
        messages,
      }),
    })

    const data = await res.json()
    const response = data.content?.[0]?.text ?? 'Réponse indisponible'

    return NextResponse.json({ response })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}