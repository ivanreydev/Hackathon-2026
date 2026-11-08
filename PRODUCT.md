# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Primary viewers right now: Elisa staff judging the Since AI Hackathon 2026, and the other hackathon teams who vote. They see the product in a short demo and decide in seconds whether the idea lands. Eventual users: Elisa field engineers and NOC staff facing a network problem on site.

## Product Purpose
Solmu finds past field know-how for a new network problem. Engineers describe what they see; it returns similar past situations, captured from Teams chats and emails, and what fixed them. Success: a fix that only lived in someone's head or an old thread is found again when it is needed.

## Positioning
It captures human-generated context (chats, emails, who said it, when) and links it to network entities, instead of relying on written manuals. Elisa Company Challenge: "Capturing and Linking Human-Generated Contextual Metadata for Autonomous Network Operations".

## Operating Context
Run locally for the demo. React (Vite) client in `client/`, FastAPI backend in `server/` owned by a teammate, data and pipeline in `Hackathon/` owned by teammates. Until the backend is ready the client runs on mock data.

## Capabilities and Constraints
- Search past situations from a free-text description; view details, solutions, and the original source messages.
- Results show relevancy and recency; the backend sends raw distance and timestamp.
- Frontend is the focus of this workstream.

## Brand Commitments
- Product name: Solmu (Finnish for both "node" and "knot"; written "Solmu" on the landing): network nodes, and the knots that tie people's know-how to them. Renamed from SinceRecall on 2026-11-08 (briefly Hush, then Mnemo, the same day). Team A-stars. Since AI Hackathon 2026, Elisa Company Challenge.
- Elisa visual identity: Elisa script logo (`client/public/elisa-logo.svg`), Elisa blues (`#0012b4`, `#0019ff`, navy `#0a1050`), Jost display and Open Sans text, as already used in `client/src/index.css`.

## Evidence on Hand
Synthetic demo data only: one Teams thread and eight emails about node TRN-042 and similar cases (`Hackathon/data/example_raw/`), plus the mock situations in `client/src/api/mocks/data.js`. No real customers, metrics, or benchmarks exist; none may be invented.

## Product Principles
- Field truth over polish: show what people actually said and where it came from.
- Seconds matter: the right past fix should be reachable from one description.
- Honest data: label synthetic material as such.
