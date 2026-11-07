// Fake backend used when VITE_USE_MOCKS=true.
import { categories, situations, sources } from "./data";
const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));
export async function mockSearch(req) {
    await delay();
    const words = req.description.toLowerCase().split(/\W+/).filter(Boolean);
    const results = situations
        .filter((s) => !req.entity || s.entities.includes(req.entity))
        .map((s) => {
        // crude keyword boost so the demo reacts to what you type
        const text = (s.summary + " " + s.categories.join(" ") + " " + s.entities.join(" ")).toLowerCase();
        const hits = words.filter((w) => text.includes(w)).length;
        const boost = words.length ? hits / words.length : 0;
        // matching words pull the situation closer (smaller distance)
        return { ...s, distance: Math.round(s.distance * (1 - 0.5 * boost)) };
    })
        .sort((a, b) => a.distance - b.distance)
        .slice(0, req.limit ?? 10)
        .map(({ problems, solutions, ...hit }) => hit);
    return results; // plain list, best match first, like the backend
}
export async function mockGetSituation(id) {
    await delay();
    const s = situations.find((x) => x.id === id);
    if (!s)
        throw new Error(`Situation ${id} not found`);
    return s;
}
/** Pointer keys look like "teams:thread-trn042:seq-8": document key + highlighted message. */
export async function mockGetSource(key) {
    await delay(600); // sources are slower in the real backend too
    const m = key.match(/^(.*?)(?::seq-(\d+))?$/);
    const docKey = m?.[1] ?? key;
    const seq = m?.[2] ? Number(m[2]) : null;
    const doc = sources[docKey];
    if (!doc)
        throw new Error(`Source ${key} not found in mocks`);
    return {
        ...doc,
        messages: doc.messages.map((msg) => ({
            ...msg,
            highlighted: seq === null ? msg.highlighted : msg.seq === seq,
        })),
    };
}
export async function mockGetCategories() {
    await delay(150);
    return categories;
}
export async function mockIngest(req) {
    await delay(1200); // pretend the extraction model is running
    return {
        sourceKey: `${req.sourceType}:ingested-${Date.now()}`,
        situations: [situations[0]],
        newCategories: [],
    };
}
