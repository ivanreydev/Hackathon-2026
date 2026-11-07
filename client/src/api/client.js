// One function per backend endpoint. Relative paths: the Vite proxy forwards /api to localhost:8000.
/** @typedef {import("./types").SearchRequest} SearchRequest */
import * as mocks from "./mocks/handlers";
// Set VITE_USE_MOCKS=true in client/.env.development to work without the backend.
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS?.toLowerCase() === "true";
async function http(path, init) {
    const res = await fetch(path, {
        ...init,
        headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    });
    if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`${res.status} ${res.statusText}${body ? `: ${body}` : ""}`);
    }
    return res.json();
}
// The backend sends raw values (distance, timestamp). The UI turns them into 0..1 here.
// Tune these once you see real distances from the vector index.
const DISTANCE_SCALE = 1000; // distance at which relevancy drops to ~37%
const RECENCY_HALF_LIFE_DAYS = 180; // a situation this old has recency 0.5
const RELEVANCY_WEIGHT = 0.7; // score = 0.7 * relevancy + 0.3 * recency
const DAY_MS = 86_400_000;
function toHit(raw, at) {
    const now = at ? Date.parse(at) : Date.now();
    const ageDays = Math.max(0, (now - Date.parse(raw.timestamp)) / DAY_MS);
    const relevancy = Math.exp(-Math.max(0, raw.distance) / DISTANCE_SCALE);
    const recency = Number.isFinite(ageDays) ? 0.5 ** (ageDays / RECENCY_HALF_LIFE_DAYS) : 0;
    const score = RELEVANCY_WEIGHT * relevancy + (1 - RELEVANCY_WEIGHT) * recency;
    return { ...raw, relevancy, recency, score };
}
// Mocks return the same raw shape as the backend, so both go through toHit().
export async function searchSituations(req) {
    const list = USE_MOCKS
        ? await mocks.mockSearch(req)
        : await http("/api/situations/search", { method: "POST", body: JSON.stringify(req) });
    return { results: list.map((raw) => toHit(raw, req.at)) };
}
export async function getSituation(id) {
    const raw = USE_MOCKS
        ? await mocks.mockGetSituation(id)
        : await http(`/api/situations/${encodeURIComponent(id)}`);
    return toHit(raw);
}
export function getSource(key) {
    if (USE_MOCKS)
        return mocks.mockGetSource(key);
    return http(`/api/sources/${encodeURIComponent(key)}`);
}
export function getCategories() {
    if (USE_MOCKS)
        return mocks.mockGetCategories();
    return http("/api/categories");
}
export async function ingest(req) {
    const res = USE_MOCKS
        ? await mocks.mockIngest(req)
        : await http("/api/ingest", { method: "POST", body: JSON.stringify(req) });
    return { ...res, situations: res.situations.map((raw) => toHit(raw)) };
}
