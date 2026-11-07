import { useState } from 'react'
import ChatHeader from './ChatHeader'
import MessageList from './MessageList'
import Composer from './Composer'

const WELCOME = {
  id: 'welcome',
  role: 'bot',
  kind: 'welcome',
  text: "Describe what you're seeing on site. I'll find similar past situations and what fixed them.",
}

export default function ChatWindow({ sort, onSortChange, selectedId, onSelect }) {
  const [messages, setMessages] = useState([WELCOME])
  const [draft, setDraft] = useState('')

  // Each search adds the user's text plus a bot message that shows its ranked results
  function submit(raw) {
    const text = raw.trim()
    if (!text) return
    const id = Date.now()
    setMessages((prev) => [
      ...prev,
      { id, role: 'user', text },
      { id: id + 1, role: 'bot', kind: 'results', query: { description: text } },
    ])
    setDraft('')
  }

  return (
    <section className="chat" aria-label="Chat">
      <ChatHeader title="SinceRecall" />
      <MessageList
        messages={messages}
        resultsProps={{ sort, onSortChange, selectedId, onSelect }}
        onExample={submit}
      />
      <Composer value={draft} onChange={setDraft} onSend={() => submit(draft)} />
    </section>
  )
}
