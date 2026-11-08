const MAX = 400

export default function Composer({ value, onChange, onSend }) {
  const canSend = value.trim().length > 0

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (canSend) onSend()
    }
  }

  return (
    <div className="composer">
      <div className="composer-row">
        <textarea
          aria-label="Message"
          placeholder="Describe the situation, e.g. unit ID and symptoms…"
          rows={1}
          maxLength={MAX}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          type="button"
          className="send"
          aria-label="Send message"
          disabled={!canSend}
          onClick={onSend}
        >
          <svg style={{ width: '1.125rem', height: '1.125rem' }} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M5 12h14m-6-6 6 6-6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <p className="composer-hint">
        {value.length}/{MAX} · Enter to send, Shift+Enter for a new line
      </p>
    </div>
  )
}
