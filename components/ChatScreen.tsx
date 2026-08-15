'use client'

import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'

interface Message {
  role: 'agent' | 'user'
  text: string
}

const INITIAL_MESSAGES: Message[] = [
  {
    role: 'agent',
    text: 'Bonjour Dorian. Récupération à 76 ce matin — bonne base. Séance haltères préparée pour ce soir. Quelque chose à me dire ?',
  },
]

const QUICK_REPLIES = [
  'Comment va mon Achille ?',
  'Propose-moi une séance abdos',
  'J\'ai mal dormi',
  'Ajoute une course samedi',
]

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim()) return
    const userMsg: Message = { role: 'user', text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'agent',
        text: 'Je traite ta demande... (connexion au backend bientôt disponible)',
      }])
      setLoading(false)
    }, 800)
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100dvh - 130px)',
      overflow: 'hidden',
    }}>
      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '82%',
              padding: '10px 13px',
              borderRadius: msg.role === 'user' ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
              background: msg.role === 'user' ? 'var(--accent)' : 'var(--surface)',
              border: msg.role === 'user' ? 'none' : '0.5px solid var(--border)',
              fontSize: 12,
              color: msg.role === 'user' ? '#fff' : 'var(--text-secondary)',
              lineHeight: 1.6,
            }}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              padding: '10px 14px',
              borderRadius: '4px 12px 12px 12px',
              background: 'var(--surface)',
              border: '0.5px solid var(--border)',
              fontSize: 16,
              color: 'var(--text-muted)',
            }}>
              ···
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick replies */}
      <div style={{
        padding: '0 20px 8px',
        display: 'flex',
        gap: 6,
        overflowX: 'auto',
        flexShrink: 0,
      }}>
        {QUICK_REPLIES.map(reply => (
          <button
            key={reply}
            onClick={() => sendMessage(reply)}
            style={{
              padding: '5px 12px',
              background: 'transparent',
              border: '0.5px solid var(--border)',
              borderRadius: 20,
              fontSize: 10,
              color: 'var(--text-muted)',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {reply}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{
        padding: '8px 20px 16px',
        display: 'flex',
        gap: 10,
        alignItems: 'center',
        flexShrink: 0,
        borderTop: '0.5px solid var(--border)',
        background: 'var(--bg)',
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
          placeholder="Écris quelque chose..."
          style={{
            flex: 1,
            background: 'var(--surface)',
            border: '0.5px solid var(--border)',
            borderRadius: 20,
            padding: '10px 16px',
            fontSize: 12,
            color: 'var(--text-primary)',
            outline: 'none',
          }}
        />
        <button
          onClick={() => sendMessage(input)}
          style={{
            width: 36,
            height: 36,
            background: 'var(--accent)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            border: 'none',
          }}
        >
          <Send size={14} color="#fff" />
        </button>
      </div>
    </div>
  )
}