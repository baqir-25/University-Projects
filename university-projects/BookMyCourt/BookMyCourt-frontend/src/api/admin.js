import { apiRequest } from "./client.js";

function buildQuery(params = {}) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value == null) return;
    const s = String(value).trim();
    if (!s) return;
    q.set(key, s);
  });
  const qs = q.toString();
  return qs ? `?${qs}` : "";
}

/** @param {{ q?: string, status?: "active"|"disabled", page?: number, limit?: number }} query */
export async function fetchAdminUsers(query = {}) {
  const data = await apiRequest("GET", `/api/admin/users${buildQuery(query)}`);
  return Array.isArray(data) ? data : [];
}

/** @param {string} userId @param {{ disabled: boolean }} body */
export async function patchAdminUser(userId, body) {
  return apiRequest("PATCH", `/api/admin/users/${encodeURIComponent(userId)}`, { body });
}

/** @param {string} userId */
export async function deleteAdminUser(userId) {
  return apiRequest("DELETE", `/api/admin/users/${encodeURIComponent(userId)}`);
}

/** @param {{ q?: string, status?: "active"|"disabled", page?: number, limit?: number }} query */
export async function fetchAdminOwners(query = {}) {
  const data = await apiRequest("GET", `/api/admin/owners${buildQuery(query)}`);
  return Array.isArray(data) ? data : [];
}

/** @param {string} ownerId @param {{ disabled: boolean, cascade?: boolean, cascadeDisable?: boolean }} body */
export async function patchAdminOwner(ownerId, body) {
  return apiRequest("PATCH", `/api/admin/owners/${encodeURIComponent(ownerId)}`, { body });
}

/** @param {string} ownerId */
export async function deleteAdminOwner(ownerId) {
  return apiRequest("DELETE", `/api/admin/owners/${encodeURIComponent(ownerId)}`);
}

/**
 * @param {{ q?: string, status?: "active"|"disabled", ownerId?: string, page?: number, limit?: number }} query
 */
export async function fetchAdminArenas(query = {}) {
  const data = await apiRequest("GET", `/api/admin/arenas${buildQuery(query)}`);
  return Array.isArray(data) ? data : [];
}

/** @param {string} arenaId @param {{ disabled: boolean }} body */
export async function patchAdminArena(arenaId, body) {
  return apiRequest("PATCH", `/api/admin/arenas/${encodeURIComponent(arenaId)}`, { body });
}

/** @param {string} arenaId */
export async function deleteAdminArena(arenaId) {
  return apiRequest("DELETE", `/api/admin/arenas/${encodeURIComponent(arenaId)}`);
}

/**
 * @param {{ q?: string, status?: "active"|"disabled", arenaId?: string, page?: number, limit?: number }} query
 */
export async function fetchAdminCourts(query = {}) {
  const data = await apiRequest("GET", `/api/admin/courts${buildQuery(query)}`);
  return Array.isArray(data) ? data : [];
}

/** @param {string} courtId @param {{ disabled: boolean }} body */
export async function patchAdminCourt(courtId, body) {
  return apiRequest("PATCH", `/api/admin/courts/${encodeURIComponent(courtId)}`, { body });
}

/** @param {string} courtId */
export async function deleteAdminCourt(courtId) {
  return apiRequest("DELETE", `/api/admin/courts/${encodeURIComponent(courtId)}`);
}

/** @param {{ from: string, to: string }} query */
export async function fetchAdminAnalyticsOverview(query) {
  return apiRequest("GET", `/api/admin/analytics/overview${buildQuery(query)}`);
}
