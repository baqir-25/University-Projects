import { apiRequest } from "./client.js";

/** @returns {Promise<unknown[]>} */
export async function fetchOwnerArenas() {
  const data = await apiRequest("GET", "/api/owner/arenas");
  return Array.isArray(data) ? data : [];
}

/** @param {string} arenaId */
export async function fetchOwnerArena(arenaId) {
  return apiRequest("GET", `/api/owner/arenas/${encodeURIComponent(arenaId)}`);
}

/**
 * @param {string} arenaId
 * @param {{ date?: string, status?: string }} [query] — status: confirmed | cancelled | completed
 */
export async function fetchOwnerArenaBookings(arenaId, query = {}) {
  const q = new URLSearchParams();
  if (query.date != null && String(query.date).trim()) q.set("date", String(query.date).trim());
  if (query.status != null && String(query.status).trim()) q.set("status", String(query.status).trim());
  const qs = q.toString();
  const data = await apiRequest("GET", `/api/owner/arenas/${encodeURIComponent(arenaId)}/bookings${qs ? `?${qs}` : ""}`);
  return Array.isArray(data) ? data : [];
}

/**
 * Update an arena booking status from the Owner console.
 * Tries arena-scoped route first, then falls back to legacy booking route.
 * @param {string} arenaId
 * @param {string} bookingId
 * @param {"confirmed"|"cancelled"|"completed"} status
 */
export async function patchOwnerArenaBookingStatus(arenaId, bookingId, status) {
  try {
    return await apiRequest(
      "PATCH",
      `/api/owner/arenas/${encodeURIComponent(arenaId)}/bookings/${encodeURIComponent(bookingId)}`,
      { body: { status } },
    );
  } catch (e) {
    if (!(e && typeof e === "object" && "status" in e && (e.status === 404 || e.status === 405))) throw e;
    return apiRequest("PATCH", `/api/owner/bookings/${encodeURIComponent(bookingId)}`, { body: { status } });
  }
}

/**
 * @param {string} arenaId
 * @param {Record<string, unknown>} body — partial Arena fields (e.g. name, sport, location, description, pricePerSlot, isAvailable)
 */
export async function patchOwnerArena(arenaId, body) {
  return apiRequest("PATCH", `/api/owner/arenas/${encodeURIComponent(arenaId)}`, { body });
}

/**
 * @param {string} courtId
 * @param {Record<string, unknown>} body
 */
export async function patchOwnerCourt(courtId, body) {
  return apiRequest("PATCH", `/api/owner/courts/${encodeURIComponent(courtId)}`, { body });
}

/**
 * @param {string} arenaId
 * @param {Record<string, unknown>} body
 */
export async function createOwnerArenaEvent(arenaId, body) {
  return apiRequest("POST", `/api/owner/arenas/${encodeURIComponent(arenaId)}/events`, { body });
}

/**
 * @param {string} arenaId
 * @param {string} eventId
 */
export async function deleteOwnerArenaEvent(arenaId, eventId) {
  return apiRequest("DELETE", `/api/owner/arenas/${encodeURIComponent(arenaId)}/events/${encodeURIComponent(eventId)}`);
}

/**
 * POST /api/arenas/:arenaId/deals — owner; arena must belong to the user.
 * @param {string} arenaId
 * @param {{ title: string, discountPercent: number, startsAt: string, endsAt: string, description?: string, isActive?: boolean }} body
 */
export async function createArenaDeal(arenaId, body) {
  return apiRequest("POST", `/api/arenas/${encodeURIComponent(arenaId)}/deals`, { body });
}
