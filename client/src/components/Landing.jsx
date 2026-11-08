import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ELISA_THREAD, ELISA_TRANSFORM, ELISA_VIEWBOX } from '../lib/elisaThread'
import './Landing.css'

// The name rests heavy in brand blue and thickens under the cursor.
const WORDS = [
  { text: 'Solmu', rest: 700, peak: 900 },
]
const LETTERS = WORDS.flatMap((w, wi) =>
  [...w.text].map((ch) => ({ ch, word: wi, rest: w.rest, peak: w.peak })),
)
// Last letter: delay (n-1)*45 + 120, plus the 900ms rise (see Landing.css)
const ENTRANCE_MS = (LETTERS.length - 1) * 45 + 120 + 900 + 30
// The exit (letters thin and drop, the page fades) runs over the chat; App keeps
// this page on top for that long
export const LANDING_EXIT_MS = 350

// Bubbles that pop off the button's corners on hover: where they fly (px), when, and how big
const BUBBLES = [
  { corner: 'tl', x: -34, y: -26, delay: 0, size: 1 },
  { corner: 'tl', x: -8, y: -40, delay: 60, size: 0.8 },
  { corner: 'tl', x: -46, y: -4, delay: 110, size: 0.7 },
  { corner: 'br', x: 34, y: 26, delay: 30, size: 1 },
  { corner: 'br', x: 8, y: 40, delay: 90, size: 0.8 },
  { corner: 'br', x: 46, y: 4, delay: 140, size: 0.7 },
]

// Tagline slot: "Every fix, tied to its ___." Ends on "knot", the other meaning of Solmu,
// which holds a little longer as the punchline before the cycle starts again.
const TAGLINE_WORDS = ['node', 'site', 'fault', 'engineer', 'knot']
const TAGLINE_HOLD_MS = 2500
const TAGLINE_PUNCH_MS = 4000
// First swap waits until the support line and button have risen in
const TAGLINE_START_MS = 1800

// On "knot" a highlight runs along the Elisa logo's thread, then the same thread
// ties a loop under the word.
// Underline with one loop in it, like a thread tied off under the word
const KNOT_THREAD = 'M3 20C20 20 33 20 43 16C57 10 60 3 52 3C43 3 44 17 59 20C71 22 82 20 89 18'

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// onLaunch(rect): called at the click with the logo's rect, so App can send the
// logo to the chat's corner as a thread (see LogoThread.jsx) while this page exits.
// overlay: this page is exiting on top of the chat.
// logoAwaiting: a thread is in flight, so the real logo stays hidden. If the page
// mounts that way (coming Back), the logo skips its rise, since the thread lands
// exactly on its resting spot.
export default function Landing({ onEnter, onLaunch, overlay = false, logoAwaiting = false }) {
  const letterRefs = useRef([])
  const logoRef = useRef(null)
  const [leaving, setLeaving] = useState(false)
  const [arrivedByThread] = useState(logoAwaiting)
  const [wordIndex, setWordIndex] = useState(0)
  const [prevIndex, setPrevIndex] = useState(null)

  // Rotate the tagline word. Reduced motion keeps the first word ("node") still.
  useEffect(() => {
    if (prefersReducedMotion()) return
    let timer = 0
    let current = 0
    const step = () => {
      const next = (current + 1) % TAGLINE_WORDS.length
      setPrevIndex(current)
      setWordIndex(next)
      current = next
      const isPunch = next === TAGLINE_WORDS.length - 1
      timer = setTimeout(step, isPunch ? TAGLINE_PUNCH_MS : TAGLINE_HOLD_MS)
    }
    timer = setTimeout(step, TAGLINE_START_MS + TAGLINE_HOLD_MS)
    return () => clearTimeout(timer)
  }, [])

  // The slot eases to the current word's width, so the sentence stays centred.
  // Re-measured once the web fonts land, since fallback widths differ.
  const slotRef = useRef(null)
  const taglineWordRefs = useRef([])
  useLayoutEffect(() => {
    const fit = () => {
      const el = taglineWordRefs.current[wordIndex]
      if (el && slotRef.current) slotRef.current.style.width = `${el.offsetWidth}px`
    }
    fit()
    document.fonts?.ready.then(fit)
  }, [wordIndex])

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
    // The flying thread takes over from the logo at once, drawn exactly on top of it,
    // and the chat mounts beneath straight away while this page plays its exit
    onLaunch?.(logoRef.current.getBoundingClientRect())
    setLeaving(true)
    onEnter()
  }

  const isKnot = wordIndex === TAGLINE_WORDS.length - 1

  let index = 0
  return (
    <div
      className={[
        'landing',
        leaving && 'is-leaving',
        isKnot && 'is-knot',
        overlay && 'is-overlay',
        logoAwaiting && 'is-logo-awaiting',
        arrivedByThread && 'is-thread-arrival',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <main className="landing-stage">
        <span className="landing-logo-wrap">
          {/* Between pages this logo travels as a thread (LogoThread.jsx) */}
          <img ref={logoRef} src="/elisa-logo.svg" alt="Elisa" className="landing-logo" />
          {/* Same viewBox and path as the logo, so the highlight runs exactly along its thread */}
          <svg className="logo-thread" viewBox={ELISA_VIEWBOX} aria-hidden="true" focusable="false">
            <path d={ELISA_THREAD} pathLength="1" transform={ELISA_TRANSFORM} />
          </svg>
        </span>
        <h1 className="landing-name" aria-label="Solmu">
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

        {/* Screen readers get one stable sentence; the rotating slot is visual only */}
        <p className="landing-tagline">
          <span className="sr-only">Every fix, tied to its node.</span>
          <span aria-hidden="true">
            Every fix, tied to its{' '}
            <span className="tagline-slot-wrap">
              <span className="tagline-slot" ref={slotRef}>
                {TAGLINE_WORDS.map((word, i) => (
                  <span
                    key={word}
                    ref={(el) => (taglineWordRefs.current[i] = el)}
                    className={`tagline-word${i === wordIndex ? ' is-current' : ''}${
                      i === prevIndex ? ' is-past' : ''
                    }`}
                  >
                    {word}.
                  </span>
                ))}
              </span>
              <svg className="knot-thread" viewBox="0 0 92 26" aria-hidden="true" focusable="false">
                <path d={KNOT_THREAD} pathLength="1" />
              </svg>
            </span>
          </span>
        </p>

        <p className="landing-line">Field know-how from past chats and emails, found again.</p>

        {/* Bubble button: the blue shape is drawn behind the label, and on hover small
            bubbles pop off its corners; the goo filter melts them into the pill. */}
        <span className="landing-cta-wrap">
          <button type="button" className="landing-cta" onClick={enter}>
            Open the assistant
            <svg viewBox="0 0 16 16" style={{ width: '1rem', height: '1rem' }} aria-hidden="true">
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
          <span className="cta-goo" aria-hidden="true">
            <span className="cta-goo-body" />
            {BUBBLES.map((b, i) => (
              <span
                key={i}
                className={`cta-bubble cta-bubble-${b.corner}`}
                style={{ '--x': `${b.x / 16}rem`, '--y': `${b.y / 16}rem`, '--d': `${b.delay}ms`, '--s': b.size }}
              />
            ))}
          </span>
        </span>
      </main>

      <svg className="cta-goo-filter" aria-hidden="true" focusable="false">
        <filter id="cta-goo">
          <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
          <feBlend in="SourceGraphic" in2="goo" />
        </filter>
      </svg>

      <footer className="footer">Team A-stars · Elisa Company Challenge · Since AI Hackathon 2026</footer>
    </div>
  )
}
