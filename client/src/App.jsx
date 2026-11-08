import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import ChatWindow from './components/ChatWindow'
import SituationDetail from './components/SituationDetail'
import SourceView from './components/SourceView'
import Landing, { LANDING_EXIT_MS } from './components/Landing'
import LogoThread from './components/LogoThread'
import ConversationList from './components/ConversationList'
import { useConversations } from './lib/conversations'
import './App.css'

const CHAT_HASH = '#chat'

export default function App() {
  // The landing page shows until the URL is #chat, so Back returns to it
  const [entered, setEntered] = useState(() => window.location.hash === CHAT_HASH)

  // Between pages the Elisa logo travels as a thread (LogoThread): in to the chat's
  // corner, and back out to the middle. `flight` holds the source logo's rect and a
  // promise for the destination logo's rect, resolved once that page has mounted.
  const [flight, setFlight] = useState(null)
  const flying = useRef(false)
  const resolveTarget = useRef(null)
  // Going forward, the landing stays on top while it plays its exit, so the chat
  // (and its corner logo) is already laid out underneath when the thread sets off
  const [landingExiting, setLandingExiting] = useState(false)

  // toChat: which page the thread is heading for, so the target is only read once
  // that page is on screen (a forward flight starts at the click, before the swap)
  function launchLogo(from, toChat = true) {
    const target = new Promise((resolve) => (resolveTarget.current = resolve))
    flying.current = true
    setFlight({ id: Date.now(), from, target, toChat })
  }

  function landLogo() {
    flying.current = false
    setFlight(null)
  }

  // Hand the destination logo to the thread as soon as it is in the DOM; the thread
  // measures it a frame later, once the new page has settled (see LogoThread)
  useLayoutEffect(() => {
    if (!resolveTarget.current || !flight || flight.toChat !== entered) return
    const logo = document.querySelector(entered ? '.topbar-logo' : '.landing-logo')
    if (logo) {
      resolveTarget.current(logo)
      resolveTarget.current = null
    }
  }, [entered, flight])

  useEffect(() => {
    let exitTimer = 0
    const onHash = () => {
      const next = window.location.hash === CHAT_HASH
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      if (next) {
        // The landing launched the thread at the click; the chat fades in beneath
        if (flying.current) {
          setLandingExiting(true)
          clearTimeout(exitTimer)
          exitTimer = setTimeout(() => setLandingExiting(false), LANDING_EXIT_MS)
        }
        setEntered(true)
        return
      }

      // Back to the landing: the thread leaves the corner logo for the middle
      const headerLogo = document.querySelector('.topbar-logo')
      if (reduced || !headerLogo) {
        landLogo()
        setEntered(false)
        return
      }
      launchLogo(headerLogo.getBoundingClientRect(), false)
      setEntered(false)
    }
    window.addEventListener('hashchange', onHash)
    return () => {
      clearTimeout(exitTimer)
      window.removeEventListener('hashchange', onHash)
    }
  }, [])

  // Search queries live on each chat message, so earlier results stay visible
  const chats = useConversations()
  const [selectedId, setSelectedId] = useState(null)
  const [sourceKey, setSourceKey] = useState(null)
  const [sort, setSort] = useState('score')
  const panelRef = useRef(null)

  // Keyboard shortcuts on the chat page:
  //   /    jump to the message box (unless already typing somewhere)
  //   Esc  step out of the side panel: source → detail → closed, then hand focus
  //        back to the result that opened it
  useEffect(() => {
    if (!entered) return
    const onKey = (e) => {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return
      const t = e.target
      const typing = t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))

      if (e.key === '/' && !typing) {
        e.preventDefault()
        document.querySelector('.composer textarea')?.focus()
        return
      }

      // The delete confirmation handles its own Escape
      if (e.key === 'Escape' && selectedId && !t.closest?.('.conversation-confirm')) {
        e.preventDefault()
        if (sourceKey) {
          setSourceKey(null)
          return
        }
        const opener = document.querySelector('.hit[aria-current="true"]')
        closePanel()
        requestAnimationFrame(() => opener?.focus())
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [entered, selectedId, sourceKey])

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

  function deleteConversation(id) {
    if (id === chats.active.id) closePanel()
    chats.remove(id)
  }

  // The thread and the landing sit first on both pages, keyed, so React keeps the
  // same instances (the running flight, the landing's exit) as the pages swap.
  // A new flight gets a new key, so it replaces one still running.
  const logoFlight = flight && (
    <LogoThread key={flight.id} from={flight.from} target={flight.target} onDone={landLogo} />
  )
  const landing = (overlay) => (
    <Landing
      key="landing"
      overlay={overlay}
      logoAwaiting={!!flight}
      onEnter={() => (window.location.hash = CHAT_HASH)}
      onLaunch={launchLogo}
    />
  )

  if (!entered) {
    return (
      <>
        {logoFlight}
        {landing(false)}
      </>
    )
  }

  // While the thread is in flight the chat fades in under it and the header logo
  // waits, hidden, for the thread to land on its spot
  const arriving = flight ? ' is-arriving' : ''

  return (
    <>
      {logoFlight}
      {landingExiting && landing(true)}
      <header className={`topbar${arriving}`}>
        {/* Clearing the #chat hash brings back the landing page */}
        <a href="#" className="topbar-home" aria-label="Back to the Solmu start page">
          <img
            src="/elisa-logo.svg"
            alt=""
            className={`topbar-logo${flight ? ' is-awaiting-thread' : ''}`}
          />
        </a>
      </header>
      <main className={`page${arriving}`}>
        <ConversationList
          conversations={chats.conversations}
          activeId={chats.active.id}
          onSelect={switchConversation}
          onCreate={createConversation}
          onDelete={deleteConversation}
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
      <footer className={`footer${arriving}`}>Team A-stars · Elisa Company Challenge · Since AI Hackathon 2026</footer>
    </>
  )
}
