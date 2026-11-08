---
name: Solmu
description: Past field know-how from chats and emails, found again; Elisa blue ink on white.
colors:
  brand: "#0012b4"
  electric: "#0019ff"
  navy: "#0a1050"
  ink-soft: "#545884"
  link: "#1a73e8"
  link-wash: "#eef4fe"
  surface: "#ffffff"
  page-bg: "#f6f7fa"
  bot-bg: "#f1f3f8"
  border: "#e0e3e8"
  muted: "#6b7280"
  ok: "#1f8a4c"
  ok-bg: "#e7f5ec"
  warn: "#9a5b00"
  warn-bg: "#fff3dc"
  danger: "#b42318"
  danger-bg: "#fdecea"
  hl-bg: "#fff8d6"
  hl-edge: "#e0a800"
  hl-text: "#6e5200"
typography:
  display:
    fontFamily: "Jost, Futura, Century Gothic, sans-serif"
    fontSize: "clamp(56px, 12vw, 176px)"
    fontWeight: 300
    lineHeight: 0.95
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Jost, Futura, Century Gothic, sans-serif"
    fontSize: "20px"
    fontWeight: 500
    lineHeight: 1.3
  title:
    fontFamily: "Jost, Futura, Century Gothic, sans-serif"
    fontSize: "17px"
    fontWeight: 500
    lineHeight: 1.2
  body-lead:
    fontFamily: "Open Sans, Noto Sans, system-ui, Segoe UI, sans-serif"
    fontSize: "clamp(16px, 1.4vw, 18px)"
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "Open Sans, Noto Sans, system-ui, Segoe UI, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  caption:
    fontFamily: "Open Sans, Noto Sans, system-ui, Segoe UI, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Open Sans, Noto Sans, system-ui, Segoe UI, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "0.04em"
rounded:
  sm: "6px"
  md: "12px"
  pill: "999px"
spacing:
  xs: "6px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  2xl: "32px"
  3xl: "48px"
components:
  button-pill:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    padding: "15px 28px"
  button-pill-hover:
    backgroundColor: "{colors.electric}"
    textColor: "{colors.surface}"
  button-send:
    backgroundColor: "{colors.electric}"
    textColor: "{colors.surface}"
    rounded: "{rounded.sm}"
    width: "44px"
  button-send-hover:
    backgroundColor: "{colors.brand}"
  chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.link}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "5px 12px"
  chip-hover:
    backgroundColor: "{colors.link-wash}"
  chip-primary:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    padding: "5px 12px"
  chip-primary-hover:
    backgroundColor: "{colors.brand}"
  input-composer:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.navy}"
    rounded: "{rounded.sm}"
    padding: "10px 12px"
    height: "44px"
  message-user:
    backgroundColor: "{colors.electric}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "12px 14px"
  message-bot:
    backgroundColor: "{colors.bot-bg}"
    textColor: "{colors.navy}"
    rounded: "{rounded.md}"
    padding: "12px 14px"
  card-panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.navy}"
    rounded: "{rounded.md}"
  card-hit:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.sm}"
    padding: "12px"
  badge-valid:
    backgroundColor: "{colors.ok-bg}"
    textColor: "{colors.ok}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
  badge-outdated:
    backgroundColor: "{colors.warn-bg}"
    textColor: "{colors.warn}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
  badge-conflicting:
    backgroundColor: "{colors.danger-bg}"
    textColor: "{colors.danger}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
---

# Design System: Solmu

## Overview

**Creative North Star: "Elisa Ink on White"**

Solmu is written in Elisa's own blue ink on white paper. The identity is borrowed, not invented: the Elisa script logo, the three Elisa blues, Jost for display and Open Sans for text. Inside that identity the system has two registers that share one set of tokens. The landing is a single centred typographic stage where the product name is the whole page and Jost's variable weight is the only expressive material. The chat app is a calm, dense working tool: white panels with hairline borders on a cool off-white page, compact Open Sans text, and blue reserved for what the user does or has to act on.

Depth is mostly tonal: hairline borders and pale tinted fills separate things, and the one lifted object is the landing's pill button, carried by a blue-tinted shadow. Motion is exponential and short. One entrance, one exit, state changes in about 160ms, and nothing moves under reduced motion beyond a slowed spinner.

**Key Characteristics:**
- White surfaces, navy body ink, Elisa blue as the action colour.
- Jost carries names and titles; Open Sans carries everything you read.
- Variable weight is the landing's signature: letters rise from a hairline (100) to rest weight and thicken toward the cursor.
- Pills for actions and tags, gentle 6px/12px corners for fields and containers.
- Flat panels with 1px borders; one tinted shadow on the primary pill.

## Colors

A cool, single-hue palette: three Elisa blues over white and blue-grey neutrals, with small, pale status pairs for situation validity.

### Primary
- **Elisa Royal Blue** (`brand`): the brand ink. The primary pill at rest, the chat header title, the word "Solmu" in the landing name, the hover target for navy and electric controls. The Elisa logo is drawn in this same blue.
- **Elisa Electric Blue** (`electric`): the live, active blue. User message bubbles, the send button, meter fills, the spinner arc, the selected result's edge, the pill's hover state and its focus ring, and the landing text selection.

### Secondary
- **Interface Link Blue** (`link`): interactive text and outlines in the chat app: chip and pointer outlines, link buttons, back buttons, example prompts, the global focus ring. Its pale wash (`link-wash`) is the shared hover fill for those outline controls.

### Neutral
- **Elisa Night Navy** (`navy`): the default ink for all body text, the filled first chip, and the pressed segment of a segmented control.
- **Navy Mist Ink** (`ink-soft`): secondary text on the landing (support line, footer credit). Defined in the build as `color-mix(in srgb, var(--navy) 70%, white)`, about 6.7:1 on white; a navy tint, not a grey.
- **Slate Muted** (`muted`): secondary text in the chat app: hints, metadata, timestamps, placeholders, labels, the chat footer.
- **Paper White** (`surface`): panels, cards, fields, the landing ground.
- **Cool Page** (`page-bg`): the app page behind the panels, and the fill of superseded solutions.
- **Reply Tint** (`bot-bg`): assistant bubbles, meter tracks, "why" chips, icon-button hover.
- **Hairline** (`border`): every 1px border and divider.

### Status and highlight
- **Valid / Outdated / Conflicting** (`ok`/`ok-bg`, `warn`/`warn-bg`, `danger`/`danger-bg`): always used as a pair, dark text on its own pale fill, in badges; `danger` alone marks errors and conflict warnings.
- **Source Highlight** (`hl-bg`, `hl-edge`, `hl-text`): marks the original message a situation was drawn from.

### Named Rules
**The Three Blues Rule.** Brand blue is the ink at rest, electric blue is the ink in motion or in use, navy is the ink you read. A new surface picks its blue by that role, not by taste.

**The Tinted Secondary Rule.** On the landing, secondary text is a navy tint (`ink-soft`), never a neutral grey; the stage stays entirely inside the blue family.

## Typography

**Display Font:** Jost (with Futura, Century Gothic), variable weight 100 to 900
**Body Font:** Open Sans (with Noto Sans, system-ui, Segoe UI), weights 400/600/700

**Character:** A geometric display face paired with a plain, open humanist text face, the same pairing Elisa uses. Jost is for names; Open Sans does the work.

### Hierarchy
- **Display** (Jost 700, clamp(56px, 12vw, 176px), line-height 0.95, -0.03em): the product name on the landing only. "Solmu" rests at 700 and peaks at 900 under the cursor. Under 600px it becomes clamp(48px, 21vw, 128px), line-height 0.92, and stays on one line.
- **Headline** (Jost 500, 20px, 1.3): the situation title in the detail panel.
- **Title** (Jost 500, 17px, 1.2): the chat header.
- **Tagline** (Open Sans 400, clamp(20px, 2.2vw, 28px), navy): the landing's "Every fix, tied to its ___." line; the rotating word is 700 in brand blue.
- **Body Lead** (Open Sans 400, 15 to 17px): the landing's support line under the tagline, max 56ch, balanced wrap.
- **Body** (Open Sans 400, 15px/1.5): the root text style for messages, results and detail copy; 600 for emphasis such as result summaries and solution actions.
- **Caption** (Open Sans, 13px): footers, source metadata, validity rows, segmented controls.
- **Label** (Open Sans 600, 12px, 0.04em, uppercase): chip text and detail section headings (13px there). IDs, timestamps, tags and meter labels use 12px without the uppercase.

### Named Rules
**The Weight Is the Material Rule.** On the landing, expression comes from Jost's weight axis, nothing else: no extra colour, image or ornament around the name.

**The Display Is for Names Rule.** Jost appears only on names and titles (product name, chat header, situation title). Running text, controls and labels stay in Open Sans.

## Layout

The app is a centred 1172px column with 16px side gutters, shared by the top bar, the page and the footer. The chat page sets the chat panel (flexible) beside a 440px detail panel with a 16px gap; both are capped at min(1315px, 100svh - 128px) and at least 480px tall. Under 900px the panel stacks below the chat; under 640px the chat fills the viewport height minus 32px; under 480px the paired meters drop to one column.

The landing is a full-height two-row grid (stage, footer); it has no top bar. The stage centres everything on both axes with 48px top, 64px bottom and 16px side padding. Vertical rhythm on the stage: the Elisa logo (56px tall) sits 28px above the name, 28px from name to tagline, 12px from tagline to support line, 40px to the button. The logo is 56px on the landing and 30px in the app.

**Scaling to any screen.** Every size in the build is in rem (pixel values in this document are at the base size). The root size is fluid: `clamp(100%, min(1.1111vw, 1.7778vh), 200%)`. That is 16px at 1440x900 and below, where the breakpoints above handle the layout, and above that it grows with whichever of width or height is tighter, up to 2x on 4K. So a large monitor shows the same composition as a laptop, only larger. Media-query breakpoints and 1px hairline borders stay in px. Icons are sized in rem, not with SVG width and height attributes.

Spacing is a small, tight scale: 6/8px between related items, 10 to 14px inside controls and bubbles, 16px for gutters and panel gaps, 24/32px for page padding.

## Elevation & Depth

The system is flat and tonal. Panels and cards sit on the cool page with a 1px hairline border and no shadow; layers are told apart by fill (white, reply tint, page grey). The single lifted object is the landing's pill button, which carries a soft, blue-tinted drop shadow that deepens on hover.

### Shadow Vocabulary
- **Pill rest** (`box-shadow: 0 6px 18px -8px rgb(0 18 180 / 0.55)`): the primary pill at rest, tinted with brand blue.
- **Pill hover** (`box-shadow: 0 10px 24px -10px rgb(0 25 255 / 0.6)`): the same pill on hover, tinted with electric blue.

### Named Rules
**The Flat Panel Rule.** Containers are separated by a 1px hairline and tone, never by drop shadows. A shadow belongs only to the one primary action on a stage, and it is always tinted blue, never grey or black.

## Shapes

Three radii. Pills (999px) for actions and small tags: the primary button, chips, pointers, badges, "why" chips, meter tracks. Gentle 12px corners for large containers and message bubbles. Tighter 6px corners for fields, the send button, result cards, solutions and source messages. Borders are always 1px, solid hairline grey, or link blue on outline controls (dashed only on the example prompt). Status dots are full circles.

## Components

### Buttons
- **Primary pill (landing):** confident and singular. Brand blue fill, white Open Sans 600 at 16px, 15px by 28px padding, pill shape, tinted shadow, a 16px stroked arrow 10px after the label.
- **Hover / Focus / Active:** fill shifts to electric blue and the shadow deepens over 160ms ease-out; the arrow slides 3px right over 200ms on the expo ease. Focus is a 3px electric outline offset 4px. Pressed nudges down 1px.
- **Send:** a 44px square in electric blue with 6px corners and a white icon; hover goes to brand blue; disabled drops to 45% opacity.
- **Text buttons:** link-blue Open Sans 600, underlined with a 2px offset (link button) or bare (back button).
- **Icon button:** 32px, transparent, muted icon; hover fills with reply tint and darkens to navy.

### Chips
- **Style:** pill, 1px link-blue outline on white, link-blue uppercase label at 12px/600/0.04em, 5px by 12px.
- **State:** the first suggestion is filled navy with white text and hovers to brand blue; outline chips hover to the pale link wash. Pointers follow the same outline style without uppercase.

### Cards / Containers
- **Corner Style:** 12px for the chat and detail panels; 6px for result cards and solutions.
- **Background:** white on the cool page; superseded solutions drop to page grey with struck-through muted text.
- **Shadow Strategy:** none (see Elevation & Depth).
- **Border:** 1px hairline; a result card's border turns link blue on hover and electric blue when current; a conflicting solution's border turns danger red.
- **Internal Padding:** 12px for result cards, 12 by 14px for solutions, 20px sides for the detail panel body.

### Inputs / Fields
- **Style:** the composer textarea, 1px hairline on white, 6px corners, 10px by 12px padding, at least 44px tall, muted placeholder.
- **Focus:** the global focus ring, 2px link blue offset 2px.

### Navigation
- **Top bar (chat app):** only the Elisa script logo, 30px, top-left in the 1172px column, 16px from the top. It links back to the landing.
- **Logo hand-off (the thread):** the Elisa logo is one continuous stroke, so between pages it travels as one physical thread (`LogoThread.jsx`). It is one path in screen pixels: the source logo traced backwards, a curve from its start to the target logo's start, then the target logo traced forwards. The curve hangs like slack string: it leaves the source continuing the logo's own direction, droops under gravity, and swings up into the target already heading the way the logo is written. It scales to any screen because every measure is proportional: handles are 40% and 30% of the travel distance; the droop is 38% of the distance, at most 30% of the viewport height, and never more than a third of the lower logo's height below that logo, so it never drapes across the name; its control points stay 8px inside the viewport, so the whole thread stays visible; the duration is 900ms + 0.45ms per px travelled, between 1000 and 1500ms. A visible window one logo long slides along it on cubic-bezier(0.6, 0, 0.2, 1), so the source logo is drawn in from its end (the "a") while its start (the "e" tail) leads out across the screen and writes the logo again at the destination; the stroke thins from the landing's weight to the header's on the way. Forward, the landing keeps playing its exit on top while the chat fades in beneath (380ms); Back, the landing rises in around the arriving thread and its logo skips its own rise. The real logo stays hidden until the thread lands on it. Under reduced motion the pages switch with no thread.
- **Segmented control:** a 2px-padded hairline frame with 6px corners; segments are muted 13px text that darkens to navy on hover, and the pressed segment fills navy with white text.

### Status Badge
A pill with a 6px dot in its own text colour, 12px/600, on the matching pale status fill: valid green, outdated amber, conflicting red.

### The Knot (situation detail)
"How it's tied", the first section of the detail panel (`KnotView.jsx`). It shows the situation as a small tree.
- **Node:** the network node sits at the top in the filled navy chip, with its unit class in muted 11px beside it.
- **Knot:** one overhand loop leaves the node.
- **Fixes:** below the knot the thread parts into one column per fix. Each fix is a pill with its id (700) and its state word in the badge colours: Current green, Superseded grey on page grey, Conflicts red. Clicking a fix scrolls to its card and focuses it.
- **Person:** under the fix is the person who gave it, with initials on reply tint in brand blue.
- **Sources:** under the person are the panel's own source pills for where they said it, which open the source.

**Threads.** A single SVG behind the pills draws the threads. They are 2px, round-capped like the Elisa logo line, and laid between the pills' measured edges, so they follow any width.
- **Colour:** each thread takes its fix's state: brand blue current, pale grey superseded, red conflicting.
- **Conflicts:** two conflicting fixes are also tied to each other with a small red tangle.
- **Draw-in:** on open, the threads draw themselves in level by level (knot, fixes, people, sources), 560ms each on the expo ease, 170ms apart.
- **Hover:** pointing at or focusing a fix lights its threads (current ones turn electric) and dims the rest to 22%.
- **Narrow panels:** below a 24rem diagram width, the fix pills tighten so ids never break.
- **Reduced motion:** the threads are simply there.

### Messages
User messages are electric-blue bubbles with white text, aligned right; assistant replies are reply-tint bubbles with navy text, aligned left. Both use 12px corners and 12 by 14px padding, max min(560px, 85%), or up to 640px when they hold results.

### The Assembling Name (signature)
The landing name is split into letters, each its own weight. On entrance every letter rises 0.22em from weight 100, 15% opacity and a 6px blur to its rest weight over 900ms on cubic-bezier(0.16, 1, 0.3, 1), staggered 45ms per letter after 120ms; the support line and button follow at 700ms and 820ms with a 10px, 700ms rise. After the entrance, on fine pointers only, each letter's weight eases toward its peak as the cursor nears (reach 1.6 times the letter height, quadratic falloff), with a 260ms weight transition. On click the letters thin back to 100 and drop 0.18em over 280ms (6ms stagger) on cubic-bezier(0.7, 0, 0.84, 0) while the line and button fade in 240ms, then the chat takes over at 350ms. Under reduced motion there is no entrance, no exit and no cursor response.

### The Rotating Tagline
"Every fix, tied to its ___." The slot cycles node, site, fault, engineer, knot: each word holds 2.5s, "knot" (the other meaning of Solmu) holds 4s, and the first swap waits until the stage has settled. The outgoing word lifts 0.6em and blurs out in 280ms on the exit ease; the incoming word rises from 0.6em below and unblurs over 520ms on the expo ease. The slot's width eases to the current word over 480ms, so the centred line glides instead of jumping. Screen readers get the static sentence ending in "node"; under reduced motion the word stays on "node".

**The knot moment.** The Elisa logo is one continuous stroked thread, so when the slot lands on "knot" a short pale-electric highlight (14% of the path) runs along the logo's own path from first stroke to last over 1.3s, overlaid with the same viewBox and path so the mark itself is never altered. It is off under reduced motion.

## Do's and Don'ts

### Do:
- **Do** use brand blue (#0012b4) for the resting primary action and electric blue (#0019ff) for its hover, focus ring and anything in use.
- **Do** set body text in navy (#0a1050) and landing secondary text in the navy tint, not grey.
- **Do** keep Jost to names and titles, and carry expression on the landing through its weight axis (100 to 900).
- **Do** separate containers with a 1px hairline (#e0e3e8) and tonal fills.
- **Do** use the exponential ease cubic-bezier(0.16, 1, 0.3, 1) for entrances and 160ms ease-out for state changes, and switch all of it off under prefers-reduced-motion.
- **Do** pair every status colour with its own pale fill.

### Don't:
- **Don't** put a drop shadow on panels or cards; the tinted shadow belongs only to the primary pill.
- **Don't** use grey or black shadows; shadows are tinted with the blue of the object that casts them.
- **Don't** introduce hues outside the Elisa blues, the blue-grey neutrals, the status pairs and the source highlight.
- **Don't** set running text, controls or labels in Jost.
- **Don't** add more than one primary pill to a stage.
