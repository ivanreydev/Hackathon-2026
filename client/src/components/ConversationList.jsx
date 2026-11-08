import { useState } from 'react'
import { isEmpty, titleOf } from '../lib/conversations'
import { formatDate } from '../lib/format'

const timeFmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' })

function when(iso) {
  const d = new Date(iso)
  return d.toDateString() === new Date().toDateString() ? timeFmt.format(d) : formatDate(iso)
}

// Bubbles that break off the row's top and bottom edges when it is deleted:
// where they start along the edge (%), where they fly (px), when, and how big
const BUBBLES = [
  { edge: 'top', at: 18, x: -6, y: -22, delay: 0, size: 1 },
  { edge: 'top', at: 52, x: 2, y: -28, delay: 50, size: 0.8 },
  { edge: 'top', at: 82, x: 6, y: -18, delay: 90, size: 0.65 },
  { edge: 'bottom', at: 30, x: -4, y: 20, delay: 30, size: 0.85 },
  { edge: 'bottom', at: 70, x: 5, y: 26, delay: 70, size: 1 },
]
// Pop (body 420ms, last bubble 90 + 460ms) overlapping the 200ms collapse that starts at 360ms
const POP_MS = 580
const FADE_MS = 180

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function searchCount(conversation) {
  const n = conversation.messages.filter((m) => m.role === 'user').length
  return n === 0 ? 'No searches yet' : `${n} search${n === 1 ? '' : 'es'}`
}

export default function ConversationList({ conversations, activeId, onSelect, onCreate, onDelete }) {
  const active = conversations.find((c) => c.id === activeId)

  // Row waiting for a delete confirmation, if any, and the row currently popping away
  const [confirmingId, setConfirmingId] = useState(null)
  const [poppingId, setPoppingId] = useState(null)

  // The row pops, then is removed once the animation in App.css has finished
  function confirmDelete(id) {
    if (poppingId) return
    setPoppingId(id)
    setTimeout(() => {
      setPoppingId(null)
      setConfirmingId(null)
      onDelete(id)
    }, prefersReducedMotion() ? FADE_MS : POP_MS)
  }

  return (
    <nav className="conversations" aria-label="Conversations">
      <div className="conversations-head">
        <h2>Conversations</h2>
        <button
          type="button"
          className="conversations-new"
          onClick={onCreate}
          disabled={active && isEmpty(active)}
          title={active && isEmpty(active) ? 'This conversation is still empty' : undefined}
        >
          <svg viewBox="0 0 16 16" style={{ width: '0.875rem', height: '0.875rem' }} aria-hidden="true">
            <path d="M8 3v10M3 8h10" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
          New
        </button>
      </div>

      <ul className="conversation-list">
        {conversations.map((c) =>
          c.id === confirmingId ? (
            <li key={c.id} className={`conversation-item${c.id === poppingId ? ' is-popping' : ''}`}>
              <div className="conversation-pop">
                <div
                  className="conversation-confirm"
                  role="group"
                  aria-label={`Delete conversation: ${titleOf(c)}`}
                  onKeyDown={(e) => e.key === 'Escape' && !poppingId && setConfirmingId(null)}
                >
                  <span className="conversation-confirm-text">Delete this conversation?</span>
                  <div className="conversation-confirm-actions">
                    <button type="button" className="confirm-delete" autoFocus onClick={() => confirmDelete(c.id)}>
                      Delete
                    </button>
                    <button type="button" className="confirm-cancel" onClick={() => setConfirmingId(null)}>
                      Cancel
                    </button>
                  </div>
                </div>
                {/* The row's shape and its bubbles, melted together by the goo filter below */}
                {c.id === poppingId && (
                  <span className="pop-goo" aria-hidden="true">
                    <span className="pop-goo-body" />
                    {BUBBLES.map((b, i) => (
                      <span
                        key={i}
                        className={`pop-bubble pop-bubble-${b.edge}`}
                        style={{
                          '--at': `${b.at}%`,
                          // rem, so the bubbles fly as far relative to the UI on any screen
                          '--x': `${b.x / 16}rem`,
                          '--y': `${b.y / 16}rem`,
                          '--d': `${b.delay}ms`,
                          '--s': b.size,
                        }}
                      />
                    ))}
                  </span>
                )}
              </div>
            </li>
          ) : (
          <li key={c.id} className="conversation-item">
            <button
              type="button"
              className="conversation"
              aria-current={c.id === activeId ? 'true' : undefined}
              onClick={() => onSelect(c.id)}
            >
              <span className="conversation-title">{titleOf(c)}</span>
              <span className="conversation-meta">
                {searchCount(c)} · {when(c.updatedAt)}
              </span>
            </button>
            {/* An empty conversation has nothing to delete */}
            {!isEmpty(c) && (
            <button
              type="button"
              className="conversation-delete"
              onClick={() => setConfirmingId(c.id)}
              aria-label={`Delete conversation: ${titleOf(c)}`}
              title="Delete conversation"
            >
              <svg viewBox="0 0 16 16" style={{ width: '0.875rem', height: '0.875rem' }} aria-hidden="true">
                <path
                  d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.5h5.8l.6-8.5M7 7v4M9 7v4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            )}
          </li>
          ),
        )}
      </ul>

      {/* Same goo recipe as the landing button, tuned for the smaller bubbles */}
      <svg className="pop-goo-filter" aria-hidden="true" focusable="false">
        <filter id="pop-goo">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
          <feBlend in="SourceGraphic" in2="goo" />
        </filter>
      </svg>
    </nav>
  )
}
