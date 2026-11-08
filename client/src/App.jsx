import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import ChatWindow from './components/ChatWindow'
import SituationDetail from './components/SituationDetail'
import SourceView from './components/SourceView'
import Landing from './components/Landing'
import ConversationList from './components/ConversationList'
import { useConversations } from './lib/conversations'
import './App.css'

const CHAT_HASH = '#chat'

export default function App() {
  // The landing page shows until the URL is #chat, so Back returns to it
  const [entered, setEntered] = useState(() => window.location.hash === CHAT_HASH)
  useEffect(() => {
    // Switching pages runs as a view transition, so the Elisa logo glides between
    // its spot above the name and the chat page's corner (both share a transition name)
    const onHash = () => {
      const next = window.location.hash === CHAT_HASH
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (!document.startViewTransition || reduced) {
        setEntered(next)
        return
      }
      document.startViewTransition(() => flushSync(() => setEntered(next)))
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  // Search queries live on each chat message, so earlier results stay visible
  const chats = useConversations()
  const [selectedId, setSelectedId] = useState(null)
  const [sourceKey, setSourceKey] = useState(null)
  const [sort, setSort] = useState('score')
  const panelRef = useRef(null)

  // Start each panel view at the top
  useLayoutEffect(() => {
    panelRef.current?.scrollTo({ top: 0 })
  }, [selectedId, sourceKey])

  // On narrow screens the panel sits below the chat, so scroll down to it
  useEffect(() => {
    if (selectedId && window.matchMedia('(max-width: 900px)').matches) {
      panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [selectedId, sourceKey])

  function selectSituation(id) {
    setSelectedId(id)
    setSourceKey(null)
  }

  function closePanel() {
    setSelectedId(null)
    setSourceKey(null)
  }

  // A detail panel belongs to the conversation it was opened from
  function switchConversation(id) {
    if (id !== chats.active.id) closePanel()
    chats.select(id)
  }

  function createConversation() {
    closePanel()
    chats.create()
  }

  if (!entered) {
    return <Landing onEnter={() => (window.location.hash = CHAT_HASH)} />
  }

  return (
    <>
      <header className="topbar">
        {/* Clearing the #chat hash brings back the landing page */}
        <a href="#" className="topbar-home" aria-label="Back to the Solmu start page">
          <img src="/elisa-logo.svg" alt="" className="topbar-logo elisa-logo-shared" />
        </a>
      </header>
      <main className="page">
        <ConversationList
          conversations={chats.conversations}
          activeId={chats.active.id}
          onSelect={switchConversation}
          onCreate={createConversation}
        />
        <ChatWindow
          key={chats.active.id}
          messages={chats.active.messages}
          onSend={chats.send}
          sort={sort}
          onSortChange={setSort}
          selectedId={selectedId}
          onSelect={selectSituation}
        />
        {selectedId && (
          <aside
            ref={panelRef}
            className="panel"
            aria-label={sourceKey ? 'Original source' : 'Situation detail'}
          >
            {sourceKey ? (
              <SourceView key={sourceKey} sourceKey={sourceKey} onBack={() => setSourceKey(null)} />
            ) : (
              <SituationDetail
                key={selectedId}
                id={selectedId}
                onOpenSource={setSourceKey}
                onClose={closePanel}
              />
            )}
          </aside>
        )}
      </main>
      <footer className="footer">Team A-stars · Elisa Company Challenge · Since AI Hackathon 2026</footer>
    </>
  )
}
