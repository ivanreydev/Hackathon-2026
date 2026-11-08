import { useSituation } from '../api/hooks'
import { formatDate, pointerLabel } from '../lib/format'
import StatusBadge from './StatusBadge'
import { Loading, LoadError } from './LoadState'

export default function SituationDetail({ id, onOpenSource, onClose }) {
  const detail = useSituation(id)

  return (
    <div className="panel-body">
      <div className="panel-bar">
        <p className="panel-kicker">{id}</p>
        <button type="button" className="icon-button" aria-label="Close detail" onClick={onClose}>
          <svg style={{ width: '1.125rem', height: '1.125rem' }} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {detail.isLoading && <Loading>Loading situation…</Loading>}
      {detail.error && (
        <LoadError what="this situation" error={detail.error} onRetry={() => detail.refetch()} />
      )}
      {detail.data && <DetailContent situation={detail.data} onOpenSource={onOpenSource} />}
    </div>
  )
}

function DetailContent({ situation, onOpenSource }) {
  const { status, summary, categories, problems, solutions } = situation
  return (
    <>
      <header className="detail-head">
        <StatusBadge status={status} />
        <h2>{summary}</h2>
        <p className="tags">
          {categories.map((c) => (
            <span key={c} className="tag">
              {c}
            </span>
          ))}
        </p>
      </header>

      <section className="detail-section">
        <h3>Symptoms</h3>
        {problems.map((p) => (
          <div key={p.id} className="problem">
            <ul className="symptoms">
              {p.symptoms.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <Pointers pointers={p.pointers} onOpen={onOpenSource} />
          </div>
        ))}
      </section>

      <section className="detail-section">
        <h3>{solutions.length > 1 ? 'Solutions' : 'Solution'}</h3>
        {solutions.map((sol) => (
          <SolutionCard key={sol.id} solution={sol} onOpenSource={onOpenSource} />
        ))}
      </section>
    </>
  )
}

function SolutionCard({ solution, onOpenSource }) {
  const { id, action, author, validFrom, validTo, supersededBy, conflictsWith, pointers } = solution
  const superseded = Boolean(supersededBy)
  const conflicting = conflictsWith.length > 0

  let className = 'solution'
  if (superseded) className += ' solution-superseded'
  if (conflicting) className += ' solution-conflict'

  return (
    <article className={className} aria-label={id}>
      {superseded && <p className="note note-muted">Superseded by {supersededBy}</p>}
      {conflicting && (
        <p className="note note-warn">
          <svg style={{ width: '0.875rem', height: '0.875rem' }} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 3 2 21h20L12 3Zm0 7v5m0 3v.01"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Conflicts with {conflictsWith.join(', ')}
        </p>
      )}
      <p className="solution-action">{action}</p>
      <dl className="validity">
        <div>
          <dt>Author</dt>
          <dd>{author}</dd>
        </div>
        <div>
          <dt>Valid from</dt>
          <dd>{formatDate(validFrom)}</dd>
        </div>
        <div>
          <dt>Valid until</dt>
          <dd>{validTo ? formatDate(validTo) : 'Still valid'}</dd>
        </div>
      </dl>
      <Pointers pointers={pointers} onOpen={onOpenSource} />
    </article>
  )
}

function Pointers({ pointers, onOpen }) {
  if (!pointers?.length) return null
  return (
    <div className="pointers">
      <span className="pointers-label">Source</span>
      {pointers.map((p) => (
        <button key={p.key} type="button" className="pointer" onClick={() => onOpen(p.key)}>
          {pointerLabel(p)}
        </button>
      ))}
    </div>
  )
}
