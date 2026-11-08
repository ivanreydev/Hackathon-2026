import { useEffect, useRef } from 'react'
import Message from './Message'

export default function MessageList({ messages, resultsProps, onExample }) {
  const listRef = useRef(null)

  // Scroll the list itself to the newest message. scrollIntoView would also scroll
  // the window on narrow screens, where the page is taller than the viewport, and
  // jump the page past the header (and away from the arriving logo thread).
  useEffect(() => {
    const list = listRef.current
    if (list) list.scrollTop = list.scrollHeight
  }, [messages])

  return (
    <div ref={listRef} className="message-list" aria-live="polite">
      {messages.map((m) => (
        <Message key={m.id} message={m} resultsProps={resultsProps} onExample={onExample} />
      ))}
    </div>
  )
}
