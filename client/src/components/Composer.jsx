import { useState } from 'react'

const MAX = 400
// The counter only appears once a message gets close to the limit, then warns
const COUNT_FROM = 320
const WARN_FROM = 380

export default function Composer({ value, onChange, onSend }) {
  const [focused, setFocused] = useState(false)
  const canSend = value.trim().length > 0
  const nearLimit = value.length >= COUNT_FROM
  const countTone = value.length >= MAX ? ' is-full' : value.length >= WARN_FROM ? ' is-warn' : ''

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
          aria-keyshortcuts="/"
          aria-describedby="composer-hint"
          placeholder="Describe the situation, e.g. unit ID and symptoms…"
          rows={1}
          maxLength={MAX}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
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
      {/* One hint at a time, for what you can do right now. Keyed, so each swap
          fades in rather than snapping. */}
      <p className="composer-hint" id="composer-hint">
        {focused ? (
          <span key="typing" className="composer-hint-keys">
            <kbd>Enter</kbd> to send<span className="composer-hint-sep">·</span>
            <kbd>Shift</kbd>
            <span className="composer-hint-plus">+</span>
            <kbd>Enter</kbd> for a new line
          </span>
        ) : (
          <span key="idle" className="composer-hint-keys">
            Press <kbd>/</kbd> to type
          </span>
        )}
        {nearLimit && (
          <span className={`composer-count${countTone}`} aria-hidden="true">
            {value.length}/{MAX}
          </span>
        )}
      </p>
    </div>
  )
}
