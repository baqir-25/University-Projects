import { apiRequest } from "./client.js";

/**
 * Calendar day for discover `date` query (align with slot picker anchor).
 * @param {Date} d
 */
export function formatDiscoverDateLocal(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * @param {Record<string, unknown>} raw
 */
export function mapDiscoverArenaRow(raw) {
  if (!raw || typeof raw !== "object") return null;
  const sports = Array.isArray(raw.sports) ? raw.sports.map((s) => String(s)) : [];
  const courts = Array.isArray(raw.courts)
    ? raw.courts.map((c) => {
        const row = /** @type {Record<string, unknown>} */ (c && typeof c === "object" ? c : {});
        return {
          id: row.id,
          name: String(row.name ?? ""),
          sport: row.sport != null ? String(row.sport) : null,
          status: String(row.status ?? "available"),
          visible: row.visible !== false,
          bookedSlots: Array.isArray(row.bookedSlots) ? row.bookedSlots.map((x) => String(x)) : [],
        };
      })
    : [];

  const price = typeof raw.price === "number" ? raw.price : Number(raw.price) || 0;
  const rating = typeof raw.rating === "number" ? raw.rating : Number(raw.rating) || 0;
  const reviewCount = typeof raw.reviewCount === "number" ? raw.reviewCount : Number(raw.reviewCount) || 0;
  const imgRaw = raw.img;
  const img = imgRaw != null && String(imgRaw).trim() ? String(imgRaw) : null;

  return {
    id: raw.id,
    name: String(raw.name ?? ""),
    location: String(raw.location ?? ""),
    price,
    rating,
    reviewCount,
    sports,
    img,
    courts,
    description:
      typeof raw.description === "string" && raw.description.trim()
        ? raw.description
        : `${String(raw.name ?? "")} · ${sports.slice(0, 4).join(" · ")}. Book on BookMyCourt.`,
    amenities: Array.isArray(raw.amenities) ? raw.amenities : [],
    hours: typeof raw.hours === "string" && raw.hours.trim() ? raw.hours : "Open 24 Hours",
    /** UI label: API price is per slot (pricePerSlot). */
    priceSuffix: "slot",
    fromDiscover: true,
  };
}

/**
 * Public catalog for Home / Discover. No auth.
 * @param {{ city?: string, date?: string }} [query]
 */
export async function fetchDiscoverArenas(query = {}) {
  const q = new URLSearchParams();
  if (query.city != null && String(query.city).trim()) q.set("city", String(query.city).trim());
  if (query.date != null && String(query.date).trim()) q.set("date", String(query.date).trim());
  const qs = q.toString();
  const path = `/api/arenas/discover${qs ? `?${qs}` : ""}`;
  const data = await apiRequest("GET", path);
  return Array.isArray(data) ? data : [];
}
