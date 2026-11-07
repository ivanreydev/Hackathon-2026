import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import ChatWindow from './components/ChatWindow'
import SituationDetail from './components/SituationDetail'
import SourceView from './components/SourceView'
import Landing from './components/Landing'
import './App.css'

const CHAT_HASH = '#chat'

export default function App() {
  // The landing page shows until the URL is #chat, so Back returns to it
  const [entered, setEntered] = useState(() => window.location.hash === CHAT_HASH)
  useEffect(() => {
    const onHash = () => setEntered(window.location.hash === CHAT_HASH)
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  // Search queries live on each chat message, so earlier results stay visible
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

  if (!entered) {
    return <Landing onEnter={() => (window.location.hash = CHAT_HASH)} />
  }

  return (
    <>
      <header className="topbar">
        {/* Clearing the #chat hash brings back the landing page */}
        <a href="#" className="topbar-home" aria-label="Back to the SinceRecall start page">
          <img src="/elisa-logo.svg" alt="" className="topbar-logo" />
        </a>
      </header>
      <main className="page">
        <ChatWindow
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
