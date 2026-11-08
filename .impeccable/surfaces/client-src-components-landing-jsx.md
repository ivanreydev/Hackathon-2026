---
version: 1
slug: "client-src-components-landing-jsx"
primary_target: "client/src/components/Landing.jsx"
related_targets: []
---

# Landing page (Solmu)

Scope: the entry page of the client, shown before the chat. Mode: Persuade.
Audience: Elisa judges and voting hackathon teams in a live demo; job: grasp the product name and enter the assistant.
Action: one button, "Open the assistant", into the chat (#chat).
Proof/content: the name only; no claims, no stats. Constraints: Elisa identity, minimal, kinetic type.
Memorable moment: the name assembling and thickening under the cursor.
Note (2026-11-08): a bubble-logo background was tried and undone at the user's request.
Note (2026-11-08): added the user-requested tagline "Every fix, tied to its ___." under the name; the slot rotates node, site, fault, engineer, knot (knot holds longest as the Solmu pun), and the support line stays below it.
Note (2026-11-08): renamed from SinceRecall (briefly Hush, then Mnemo) to Solmu, Finnish for "node" and "knot", written "Solmu" in plain brand blue.

## Direction contract
THESIS: The name is the whole page. Refuses the hero + feature grid + product screenshot template; nothing competes with Solmu and its one button.
OWN-WORLD: White ground, Elisa blue ink (#0012b4, electric #0019ff, navy #0a1050), the Elisa script logo top-left, Jost variable weight as the only expressive material, one solid blue pill button, Open Sans for the single support line.
STORY: The visitor watches the letters settle from hairline to weight, "Solmu" heavy in brand blue, understands this is about network nodes and the knots of know-how tied to them, and clicks in.
FIRST VIEWPORT: The Elisa logo centred above the name at 56px. "Solmu" centred below it, about 12vw up to 176px, one line at every width. One support line below at 16-18px. The bubble pill button centred under that. Footer credit centred at the bottom.
FORM: Single centred typographic stage; seed:27fcb822605c1ef1. The roll ran after the build; the user-pinned brief (name only, Elisa identity, minimal + kinetic type) governs the direction over what the roll dealt. Signature interaction: letter weight follows cursor proximity on fine pointers. Signature hand-off: the Elisa logo travels between pages as one thread. On "Open the assistant" it is drawn in from its end while its start leads out to the chat's top-left corner and writes the logo there at 30px; Back plays the same from the corner to the middle (LogoThread.jsx). Motion grammar: one entrance (weight 100 to rest, rise, stagger 45ms, exponential ease-out), one exit on click (thin and drop, 350ms), none under reduced motion.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
