import { isEmpty, titleOf } from '../lib/conversations'
import { formatDate } from '../lib/format'

const timeFmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' })

function when(iso) {
  const d = new Date(iso)
  return d.toDateString() === new Date().toDateString() ? timeFmt.format(d) : formatDate(iso)
}

function searchCount(conversation) {
  const n = conversation.messages.filter((m) => m.role === 'user').length
  return n === 0 ? 'No searches yet' : `${n} search${n === 1 ? '' : 'es'}`
}

export default function ConversationList({ conversations, activeId, onSelect, onCreate }) {
  const active = conversations.find((c) => c.id === activeId)

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
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <path d="M8 3v10M3 8h10" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
          New
        </button>
      </div>

      <ul className="conversation-list">
        {conversations.map((c) => (
          <li key={c.id}>
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
          </li>
        ))}
      </ul>
    </nav>
  )
}
