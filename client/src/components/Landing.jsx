import { useEffect, useRef, useState } from 'react'
import './Landing.css'

// "Since" rests light, "Recall" rests heavy: the past brought back into focus.
const WORDS = [
  { text: 'Since', rest: 300, peak: 800 },
  { text: 'Recall', rest: 700, peak: 900 },
]
const LETTERS = WORDS.flatMap((w, wi) =>
  [...w.text].map((ch) => ({ ch, word: wi, rest: w.rest, peak: w.peak })),
)
// Last letter: delay (n-1)*45 + 120, plus the 900ms rise (see Landing.css)
const ENTRANCE_MS = (LETTERS.length - 1) * 45 + 120 + 900 + 30
const EXIT_MS = 350

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export default function Landing({ onEnter }) {
  const letterRefs = useRef([])
  const [leaving, setLeaving] = useState(false)

  // Letters thicken as the cursor gets close. Fine pointers only, after the entrance settles.
  useEffect(() => {
    if (prefersReducedMotion() || !window.matchMedia('(pointer: fine)').matches) return
    let frame = 0
    let pointer = null

    // Letters widen as they thicken and shift the centred line, so read positions every frame
    const paint = () => {
      frame = 0
      const centers = letterRefs.current.map((el) => {
        const r = el.getBoundingClientRect()
        return { x: r.left + r.width / 2, y: r.top + r.height / 2, h: r.height }
      })
      letterRefs.current.forEach((el, i) => {
        const { rest, peak } = LETTERS[i]
        const c = centers[i]
        let w = rest
        if (pointer) {
          const reach = c.h * 1.6
          const d = Math.hypot(pointer.x - c.x, pointer.y - c.y)
          const t = Math.max(0, 1 - d / reach)
          w = rest + (peak - rest) * t * t
        }
        el.style.setProperty('--w', Math.round(w))
      })
    }
    const onMove = (e) => {
      pointer = { x: e.clientX, y: e.clientY }
      if (!frame) frame = requestAnimationFrame(paint)
    }
    const onLeave = () => {
      pointer = null
      if (!frame) frame = requestAnimationFrame(paint)
    }

    const start = setTimeout(() => {
      window.addEventListener('pointermove', onMove)
      document.addEventListener('pointerleave', onLeave)
    }, ENTRANCE_MS)

    return () => {
      clearTimeout(start)
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  function enter() {
    if (leaving) return
    if (prefersReducedMotion()) {
      onEnter()
      return
    }
    setLeaving(true)
    setTimeout(onEnter, EXIT_MS)
  }

  let index = 0
  return (
    <div className={`landing${leaving ? ' is-leaving' : ''}`}>
      <header className="topbar">
        <img src="/elisa-logo.svg" alt="Elisa" className="topbar-logo" />
      </header>

      <main className="landing-stage">
        <h1 className="landing-name" aria-label="SinceRecall">
          {WORDS.map((word, wi) => (
            <span key={word.text} className={`landing-word landing-word-${wi}`} aria-hidden="true">
              {[...word.text].map((ch) => {
                const i = index++
                return (
                  <span
                    key={i}
                    ref={(el) => (letterRefs.current[i] = el)}
                    className="landing-letter"
                    style={{ '--i': i, '--rest': word.rest, '--w': word.rest }}
                  >
                    {ch}
                  </span>
                )
              })}
            </span>
          ))}
        </h1>

        <p className="landing-line">Field know-how from past chats and emails, found again.</p>

        <button type="button" className="landing-cta" onClick={enter}>
          Open the assistant
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
            <path
              d="M3 8h9M8.5 4.5 12 8l-3.5 3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </main>

      <footer className="footer">Team A-stars · Elisa Company Challenge · Since AI Hackathon 2026</footer>
    </div>
  )
}
