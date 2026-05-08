import { apiRequest } from "./client.js";

/**
 * @param {string} eventId — Mongo _id from GET /api/events
 * @returns {Promise<Record<string, unknown>>}
 */
export async function registerForEvent(eventId) {
  return apiRequest("POST", `/api/events/${encodeURIComponent(eventId)}/register`, { body: {} });
}

/**
 * @param {string} eventId
 * @returns {Promise<Record<string, unknown>>}
 */
export async function cancelEventRegistration(eventId) {
  return apiRequest("DELETE", `/api/events/${encodeURIComponent(eventId)}/register`);
}
