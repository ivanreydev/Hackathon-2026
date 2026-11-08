import { useEffect, useRef } from 'react'
import { useSource } from '../api/hooks'
import { formatDate, sourceLabel } from '../lib/format'
import { Loading, LoadError } from './LoadState'

export default function SourceView({ sourceKey, onBack }) {
  const source = useSource(sourceKey)
  const highlightRef = useRef(null)

  // Jump to the message the situation was extracted from
  useEffect(() => {
    highlightRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [source.data])

  const doc = source.data

  return (
    <div className="panel-body">
      <div className="panel-bar">
        <button
          type="button"
          className="back-button"
          aria-keyshortcuts="Escape"
          title="Back (Esc)"
          onClick={onBack}
        >
          ← Back to situation
        </button>
      </div>

      {source.isLoading && <Loading>Opening original message…</Loading>}
      {source.error && (
        <LoadError what="the source" error={source.error} onRetry={() => source.refetch()} />
      )}

      {doc && (
        <>
          <header className="detail-head">
            <p className="panel-kicker">
              {sourceLabel(doc.sourceType)} · captured {formatDate(doc.capturedAt)}
            </p>
            <h2>{doc.title}</h2>
          </header>

          <ol className="source-messages">
            {doc.messages.map((m) => (
              <li
                key={m.seq}
                ref={m.highlighted ? highlightRef : undefined}
                className={m.highlighted ? 'src-msg src-msg-hl' : 'src-msg'}
              >
                <div className="src-meta">
                  <span className="src-author">{m.author}</span>
                  {m.role && <span className="src-role">{m.role}</span>}
                  <span className="src-time">{m.time}</span>
                </div>
                <p>{m.text}</p>
                {m.highlighted && <span className="src-flag">Knowledge extracted from this message</span>}
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  )
}
