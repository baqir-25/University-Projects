import { apiRequest } from "./client.js";

/**
 * @param {{ location?: string }} [query]
 */
export async function fetchPublicEvents(query = {}) {
  const q = new URLSearchParams();
  if (query.location != null && String(query.location).trim()) q.set("location", String(query.location).trim());
  const qs = q.toString();
  const path = `/api/events${qs ? `?${qs}` : ""}`;
  const data = await apiRequest("GET", path);
  return Array.isArray(data) ? data : [];
}

/**
 * @param {string | undefined} iso
 * @param {string | undefined} dateLabel
 */
function formatEventDateLine(iso, dateLabel) {
  if (dateLabel != null && String(dateLabel).trim()) return String(dateLabel).trim();
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

/**
 * @param {Record<string, unknown>} raw
 */
export function mapPublicEventRow(raw) {
  if (!raw || typeof raw !== "object") return null;
  const id = raw._id != null ? String(raw._id) : raw.id != null ? String(raw.id) : "";
  if (!id) return null;

  const arena = raw.arena && typeof raw.arena === "object" ? /** @type {Record<string, unknown>} */ (raw.arena) : null;
  const arenaName = arena?.name != null ? String(arena.name) : "";
  const arenaLoc = arena?.location != null ? String(arena.location) : "";

  const date = formatEventDateLine(
    raw.startsAt != null ? String(raw.startsAt) : undefined,
    raw.dateLabel != null ? String(raw.dateLabel) : undefined
  );

  const spots = typeof raw.spots === "number" && raw.spots >= 0 ? raw.spots : undefined;
  const total = typeof raw.total === "number" && raw.total >= 0 ? raw.total : undefined;

  return {
    id,
    title: String(raw.title ?? ""),
    date: date || (raw.startsAt != null ? String(raw.startsAt) : ""),
    arena: arenaName || (raw.location != null ? String(raw.location) : arenaLoc || ""),
    sport: raw.sportEmoji != null ? String(raw.sportEmoji) : "📅",
    spots: spots ?? 0,
    total,
    ownerEventId: id,
    description: raw.description != null ? String(raw.description) : undefined,
    location: raw.location != null ? String(raw.location) : undefined,
    startsAt: raw.startsAt != null ? String(raw.startsAt) : undefined,
    endsAt: raw.endsAt != null ? String(raw.endsAt) : undefined,
    arenaRef: arena
      ? {
          id: arena._id != null ? String(arena._id) : arena.id != null ? String(arena.id) : "",
          name: String(arena.name ?? ""),
          location: String(arena.location ?? ""),
        }
      : null,
    fromApi: true,
  };
}
