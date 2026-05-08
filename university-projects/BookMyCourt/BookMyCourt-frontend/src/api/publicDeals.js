import { apiRequest } from "./client.js";

/**
 * Active public promotions for Discover (no auth).
 * GET /api/deals — server returns deals active now; `arena` populated (name, location, sport, imageUrl);
 * sorted by endsAt ascending. Uses Bearer only if present (optional for this route).
 */
export async function fetchPublicDeals() {
  const data = await apiRequest("GET", "/api/deals");
  return Array.isArray(data) ? data : [];
}

/**
 * @param {string | undefined} startIso
 * @param {string | undefined} endIso
 */
function shortDealWindow(startIso, endIso) {
  if (!startIso || !endIso) return "";
  try {
    const s = new Date(startIso);
    const e = new Date(endIso);
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return "";
    return `${s.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${e.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  } catch {
    return "";
  }
}

/**
 * @param {Record<string, unknown>} raw
 */
export function mapPublicDealRow(raw) {
  if (!raw || typeof raw !== "object") return null;
  const id = raw._id != null ? String(raw._id) : raw.id != null ? String(raw.id) : "";
  const arena = raw.arena && typeof raw.arena === "object" ? /** @type {Record<string, unknown>} */ (raw.arena) : null;
  if (!arena || !id) return null;

  const discountPercent = typeof raw.discountPercent === "number" ? raw.discountPercent : Number(raw.discountPercent) || 0;
  const aid = arena._id != null ? String(arena._id) : arena.id != null ? String(arena.id) : "";

  return {
    id,
    fromApi: true,
    dealId: id,
    discount: `${discountPercent}% OFF`,
    title: String(raw.title ?? ""),
    description: raw.description != null ? String(raw.description) : undefined,
    discountPercent,
    arena: String(arena.name ?? ""),
    arenaId: aid,
    sport: arena.sport != null ? String(arena.sport) : "",
    time: shortDealWindow(
      raw.startsAt != null ? String(raw.startsAt) : undefined,
      raw.endsAt != null ? String(raw.endsAt) : undefined
    ),
    startsAt: raw.startsAt != null ? String(raw.startsAt) : undefined,
    endsAt: raw.endsAt != null ? String(raw.endsAt) : undefined,
    imageUrl: arena.imageUrl != null && String(arena.imageUrl).trim() ? String(arena.imageUrl) : null,
    arenaRef: {
      _id: arena._id,
      id: aid,
      name: String(arena.name ?? ""),
      location: String(arena.location ?? ""),
      sport: arena.sport != null ? String(arena.sport) : "",
      imageUrl: arena.imageUrl,
    },
    price: null,
    original: null,
    sections: null,
    slots: null,
  };
}
