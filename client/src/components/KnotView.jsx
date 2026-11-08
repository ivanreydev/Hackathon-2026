import { useLayoutEffect, useRef, useState } from 'react'
import { pointerLabel } from '../lib/format'

// The knot: how this situation is tied together. The network node sits at the top;
// a thread leaves it through a small loop (the knot) and runs down to each fix,
// then to the person who gave it, then to the messages where they said it.
//
// The pills are ordinary HTML laid out by CSS; the threads are one SVG behind them,
// measured from the pills, so they follow the layout at any width. They draw
// themselves in level by level on open, in the round-capped line of the Elisa logo.
// A thread's colour is the fix's state: brand blue current, grey superseded, red
// conflicting, and two conflicting fixes are tied to each other with a tangle.

const STATE = {
  valid: { label: 'Current', tone: 'valid' },
  superseded: { label: 'Superseded', tone: 'superseded' },
  conflicting: { label: 'Conflicts', tone: 'conflicting' },
}

function fixState(sol) {
  if (sol.supersededBy) return 'superseded'
  if (sol.conflictsWith.length > 0) return 'conflicting'
  return 'valid'
}

const initials = (name) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

// The node is the first plain entity (e.g. "TRN-042"); typed ones like
// "unit-class:legacy-2019" describe it
function nodeOf(situation) {
  const plain = situation.entities?.find((e) => !e.includes(':'))
  const unit = situation.entities?.find((e) => e.startsWith('unit-class:'))
  return { id: plain ?? situation.id, unit: unit?.split(':')[1] }
}

// A soft vertical S from the bottom of one pill to the top of the next
function drop(a, b) {
  const dy = (b.y - a.y) * 0.55
  return `M${a.x} ${a.y}C${a.x} ${a.y + dy} ${b.x} ${b.y - dy} ${b.x} ${b.y}`
}

// The knot under the node: an overhand loop, centred on the thread, that crosses
// itself and runs on down to where the threads part
const KNOT_DROP = 22
function knot(x, y) {
  return [
    `M${x} ${y}`,
    `C${x} ${y + 6} ${x + 7} ${y + 8} ${x + 7} ${y + 12}`,
    `C${x + 7} ${y + 16} ${x - 7} ${y + 16} ${x - 7} ${y + 12}`,
    `C${x - 7} ${y + 8} ${x} ${y + 9} ${x} ${y + KNOT_DROP}`,
  ].join('')
}

// Two conflicting fixes, tied to each other with a loop in the middle
function tangle(a, b) {
  const mx = (a.x + b.x) / 2
  return `M${a.x} ${a.y}C${mx - 10} ${a.y} ${mx - 6} ${a.y - 9} ${mx} ${a.y - 9}C${mx + 7} ${a.y - 9} ${mx + 5} ${a.y + 4} ${mx} ${a.y + 4}C${mx - 5} ${a.y + 4} ${mx - 3} ${b.y} ${b.x} ${b.y}`
}

export default function KnotView({ situation, onOpenSource }) {
  const node = nodeOf(situation)
  const fixes = situation.solutions.map((sol) => ({ ...sol, state: fixState(sol) }))

  const boxRef = useRef(null)
  const els = useRef(new Map())
  const reg = (key) => (el) => (el ? els.current.set(key, el) : els.current.delete(key))
  const [threads, setThreads] = useState([])
  const [active, setActive] = useState(null)

  // Measure the pills and lay the threads between them; again whenever the panel resizes
  useLayoutEffect(() => {
    const box = boxRef.current
    if (!box) return
    const measure = () => {
      const o = box.getBoundingClientRect()
      const at = (key, side) => {
        const r = els.current.get(key)?.getBoundingClientRect()
        if (!r) return null
        const x = r.left - o.left
        const y = r.top - o.top
        if (side === 'top') return { x: x + r.width / 2, y }
        if (side === 'bottom') return { x: x + r.width / 2, y: y + r.height }
        if (side === 'left') return { x, y: y + r.height / 2 }
        return { x: x + r.width, y: y + r.height / 2 }
      }
      const out = []
      const top = at('node', 'bottom')
      if (!top) return
      out.push({ key: 'knot', d: knot(top.x, top.y + 4), level: 0, tone: 'valid' })
      const split = { x: top.x, y: top.y + 4 + KNOT_DROP }
      fixes.forEach((f) => {
        const tone = STATE[f.state].tone
        const fixTop = at(`fix:${f.id}`, 'top')
        const fixBottom = at(`fix:${f.id}`, 'bottom')
        const personTop = at(`person:${f.id}`, 'top')
        const personBottom = at(`person:${f.id}`, 'bottom')
        if (fixTop) out.push({ key: `n-${f.id}`, d: drop(split, fixTop), level: 1, fix: f.id, tone })
        if (fixBottom && personTop)
          out.push({ key: `p-${f.id}`, d: drop(fixBottom, personTop), level: 2, fix: f.id, tone })
        f.pointers.forEach((p) => {
          const srcTop = at(`src:${f.id}:${p.key}`, 'top')
          if (personBottom && srcTop)
            out.push({ key: `s-${f.id}-${p.key}`, d: drop(personBottom, srcTop), level: 3, fix: f.id, tone })
        })
      })
      // Conflicting neighbours get tied to each other
      fixes.forEach((f, i) => {
        const g = fixes[i + 1]
        if (!g || !f.conflictsWith.includes(g.id)) return
        const a = at(`fix:${f.id}`, 'right')
        const b = at(`fix:${g.id}`, 'left')
        if (a && b)
          out.push({ key: `x-${f.id}-${g.id}`, d: tangle(a, b), level: 1, tone: 'conflicting', fix: 'conflict' })
      })
      setThreads(out)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(box)
    document.fonts?.ready.then(measure)
    return () => ro.disconnect()
    // The situation is fixed for this view's lifetime (the panel remounts per situation)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function goToFix(id) {
    const card = document.getElementById(`solution-${id}`)
    if (!card) return
    card.scrollIntoView({ behavior: 'smooth', block: 'start' })
    card.focus({ preventScroll: true })
  }

  return (
    <div className="knot" ref={boxRef}>
      <svg className="knot-threads" aria-hidden="true" focusable="false">
        {threads.map((t) => (
          <path
            key={t.key}
            d={t.d}
            pathLength="1"
            className={[
              'knot-thread',
              `knot-thread-${t.tone}`,
              // Pointing at a fix lights its threads (and a tangle it belongs to); the rest recede
              active && (t.fix === active || (t.fix === 'conflict' && t.key.includes(active)) ? 'is-lit' : t.fix && 'is-dim'),
            ]
              .filter(Boolean)
              .join(' ')}
            style={{ '--level': t.level }}
          />
        ))}
      </svg>

      <div className="knot-node">
        <span className="knot-node-pill" ref={reg('node')}>
          {node.id}
          {node.unit && <span className="knot-node-meta">{node.unit}</span>}
        </span>
      </div>

      <ol
        className="knot-fixes"
        style={{ '--cols': fixes.length }}
        aria-label={`Fixes tied to ${node.id}, who gave them, and where they said it`}
      >
        {fixes.map((f) => {
          const s = STATE[f.state]
          return (
            <li
              key={f.id}
              className="knot-branch"
              onMouseEnter={() => setActive(f.id)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(f.id)}
              onBlur={() => setActive(null)}
            >
              <button
                type="button"
                ref={reg(`fix:${f.id}`)}
                className={`knot-fix knot-fix-${s.tone}`}
                onClick={() => goToFix(f.id)}
                aria-label={`${f.id}, ${s.label.toLowerCase()}. Show this fix`}
              >
                <span className="knot-fix-id">{f.id}</span>
                <span className="knot-fix-state">{s.label}</span>
              </button>
              <p className="knot-person" ref={reg(`person:${f.id}`)}>
                <span className="knot-avatar" aria-hidden="true">
                  {initials(f.author)}
                </span>
                {f.author}
              </p>
              <ul className="knot-sources">
                {f.pointers.map((p) => (
                  <li key={p.key}>
                    <button
                      type="button"
                      ref={reg(`src:${f.id}:${p.key}`)}
                      className="pointer"
                      onClick={() => onOpenSource(p.key)}
                    >
                      {pointerLabel(p)}
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
