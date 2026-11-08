import { useState } from 'react'
import ChatHeader from './ChatHeader'
import MessageList from './MessageList'
import Composer from './Composer'

// Messages belong to the active conversation (see lib/conversations.js); only the draft lives here.
export default function ChatWindow({ messages, onSend, sort, onSortChange, selectedId, onSelect }) {
  const [draft, setDraft] = useState('')

  function submit(raw) {
    const text = raw.trim()
    if (!text) return
    onSend(text)
    setDraft('')
  }

  return (
    <section className="chat" aria-label="Chat">
      <ChatHeader title="Solmu" />
      <MessageList
        messages={messages}
        resultsProps={{ sort, onSortChange, selectedId, onSelect }}
        onExample={submit}
      />
      <Composer value={draft} onChange={setDraft} onSend={() => submit(draft)} />
    </section>
  )
}
