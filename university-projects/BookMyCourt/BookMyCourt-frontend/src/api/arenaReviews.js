import { apiRequest } from "./client.js";

/**
 * @param {string} arenaId
 * @returns {Promise<{ reviews: unknown[]; aggregate?: { averageRating?: number; count?: number } }>}
 */
export async function fetchArenaReviews(arenaId) {
  const data = await apiRequest("GET", `/api/arenas/${encodeURIComponent(arenaId)}/reviews`);
  if (data && typeof data === "object" && "reviews" in data) {
    return /** @type {{ reviews: unknown[]; aggregate?: { averageRating?: number; count?: number } }} */ (data);
  }
  return { reviews: [], aggregate: undefined };
}

/**
 * @param {string} arenaId
 * @param {{ rating: number, comment?: string, booking?: string }} body
 */
export async function submitArenaReview(arenaId, body) {
  /** @type {Record<string, unknown>} */
  const payload = { rating: body.rating };
  if (body.comment != null && String(body.comment).trim()) {
    payload.comment = String(body.comment).trim().slice(0, 2000);
  }
  if (body.booking != null && String(body.booking).trim()) {
    payload.booking = String(body.booking).trim();
  }
  return apiRequest("POST", `/api/arenas/${encodeURIComponent(arenaId)}/reviews`, { body: payload });
}
