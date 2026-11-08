import { useEffect, useRef } from 'react'
import { ELISA_THREAD } from '../lib/elisaThread'

// The Elisa logo travels between pages as one physical thread. Its end (the "a",
// on the right) is drawn in while its start (the "e" tail, on the left) leads out
// across the screen and writes the logo again at the other spot.
//
// It works on one long path in screen pixels: the source logo traced backwards
// (end to start), a curve from the source logo's start to the target logo's start,
// then the target logo traced forwards. A visible window the length of one logo
// slides along it, shrinking from the source logo's length to the target's.
//
// `from`: the source logo's rect. `target`: a promise for the target logo element,
// resolved once the destination page has mounted. `onDone`: reveal the real logo.

// Everything about the curve is a proportion of the travel distance, the viewport or
// the logo, so the thread keeps one shape from a phone to a 4K or ultrawide screen.

const SAMPLES = 360
// Slow start (the thread takes up slack), fast middle, gentle landing
const EASING = 'cubic-bezier(0.6, 0, 0.2, 1)'
// Duration grows with the distance travelled: ~1150ms across a laptop, 1.5s at most
const DURATION = { base: 900, perPx: 0.45, min: 1000, max: 1500 }
// Handle lengths leaving the source and entering the target, as shares of the distance
const HANDLE_OUT = 0.4
const HANDLE_IN = 0.3
// How far the thread droops, as a share of the distance and at most of the viewport height
const SAG = 0.38
const SAG_VIEWPORT = 0.3
// How far below the lower logo's start the thread may hang, as a share of that logo's height
const HANG_BELOW = 0.33
// Control points stay this far inside the viewport, which keeps the whole curve on screen
const EDGE = 8

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi)

// public/elisa-logo.svg: path transform, then viewBox 95 125 380 160 and stroke width 50
const LOGO = { a: 0.377755, e: 59.1618, f: 121.482, vx: 95, vy: 125, vw: 380, vh: 160, stroke: 50 }

function toScreen(points, rect) {
  const sx = rect.width / LOGO.vw
  const sy = rect.height / LOGO.vh
  return points.map((p) => ({
    x: rect.left + (LOGO.a * p.x + LOGO.e - LOGO.vx) * sx,
    y: rect.top + (LOGO.a * p.y + LOGO.f - LOGO.vy) * sy,
  }))
}

function strokeFor(rect) {
  return LOGO.stroke * LOGO.a * (rect.width / LOGO.vw)
}

function polylineLength(pts) {
  let len = 0
  for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y)
  return len
}

const fmt = (p) => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`
const line = (pts) => pts.map(fmt).join('L')

function unit(a, b) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const d = Math.hypot(dx, dy) || 1
  return { x: dx / d, y: dy / d }
}

export default function LogoThread({ from, target, onDone }) {
  const probeRef = useRef(null)
  const pathRef = useRef(null)

  useEffect(() => {
    const probe = probeRef.current
    const path = pathRef.current
    let cancelled = false
    let anim = null

    // Sample the logo's own thread once, in its own coordinates
    const total = probe.getTotalLength()
    const samples = Array.from({ length: SAMPLES + 1 }, (_, i) => {
      const p = probe.getPointAtLength((total * i) / SAMPLES)
      return { x: p.x, y: p.y }
    })

    // Until the destination is known, draw the source logo whole, exactly over it
    const src = toScreen(samples, from)
    path.setAttribute('d', `M${line(src)}`)
    path.style.strokeWidth = `${strokeFor(from)}px`

    target
      // Measure a frame after the destination mounts, once its effects (scrolling,
      // layout shifts) have run, so the thread lands where the logo really is
      .then((el) => new Promise((resolve) => requestAnimationFrame(() => resolve(el))))
      .then((el) => {
      if (cancelled || !el.isConnected) return
      const to = el.getBoundingClientRect()
      const dst = toScreen(samples, to)
      const back = [...src].reverse() // source traced end to start

      // Leave the source start continuing its backward direction, and arrive at
      // the target start already heading the way the logo is written
      const p = src[0]
      const q = dst[0]
      const dist = Math.hypot(q.x - p.x, q.y - p.y)
      const outDir = unit(src[1], src[0])
      const inDir = unit(dst[0], dst[1])
      const k1 = dist * HANDLE_OUT
      const k2 = dist * HANDLE_IN
      // Gravity: both handles drop by the same amount, so the thread hangs below the
      // line between the two logos like a slack string. Its lowest point sits about
      // three quarters of the drop below that line's middle; it may hang only a
      // little below the lower logo, so it never drapes across the name.
      const lowerLogo = p.y > q.y ? from : to
      const dropRoom = (Math.abs(p.y - q.y) / 2 + lowerLogo.height * HANG_BELOW) / 0.75
      const sag = Math.min(dist * SAG, window.innerHeight * SAG_VIEWPORT, dropRoom)
      // A cubic never leaves the shape spanned by its points, so keeping the handles
      // inside the viewport keeps the whole thread visible
      const onScreen = (c) => ({
        x: clamp(c.x, EDGE, window.innerWidth - EDGE),
        y: clamp(c.y, EDGE, window.innerHeight - EDGE),
      })
      const c1 = onScreen({ x: p.x + outDir.x * k1, y: p.y + outDir.y * k1 + sag })
      // Behind the target start, so the thread arrives already heading the way the logo is written
      const c2 = onScreen({ x: q.x - inDir.x * k2, y: q.y - inDir.y * k2 + sag })
      const duration = clamp(DURATION.base + dist * DURATION.perPx, DURATION.min, DURATION.max)

      path.setAttribute('d', `M${line(back)}C${fmt(c1)} ${fmt(c2)} ${fmt(q)}L${line(dst.slice(1))}`)

      const lenSrc = polylineLength(src)
      const lenDst = polylineLength(dst)
      const whole = path.getTotalLength()
      const gap = whole * 2 // longer than the path, so the dash never repeats

      anim = path.animate(
        [
          {
            strokeDasharray: `${lenSrc}px ${gap}px`,
            strokeDashoffset: '0px',
            strokeWidth: `${strokeFor(from)}px`,
          },
          {
            strokeDasharray: `${lenDst}px ${gap}px`,
            strokeDashoffset: `${-(whole - lenDst)}px`,
            strokeWidth: `${strokeFor(to)}px`,
          },
        ],
        { duration, easing: EASING, fill: 'forwards' },
      )
      return anim.finished.then(() => {
        if (!cancelled) onDone()
      })
    }).catch(() => {
      // Cancelled mid-flight (e.g. navigated again); the next flight takes over
    })

    return () => {
      cancelled = true
      anim?.cancel()
    }
    // Runs once per flight; App mounts a fresh LogoThread for each one
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <svg className="logo-flight" aria-hidden="true" focusable="false">
      {/* Never painted: only read for the logo's geometry */}
      <path ref={probeRef} d={ELISA_THREAD} className="logo-flight-probe" />
      <path ref={pathRef} className="logo-flight-thread" />
    </svg>
  )
}
