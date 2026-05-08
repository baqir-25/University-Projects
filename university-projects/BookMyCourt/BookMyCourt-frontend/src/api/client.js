import { getAccessToken } from "../auth/session.js";
import { getApiBase } from "../config/api.js";

export class ApiEnvelopeError extends Error {
  /**
   * @param {string} message
   * @param {number} status
   */
  constructor(message, status = 0) {
    super(message);
    this.name = "ApiEnvelopeError";
    this.status = status;
  }
}

/**
 * @returns {Promise<Record<string, unknown>>}
 */
async function readJsonSafe(res) {
  const text = await res.text();
  if (!text.trim()) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

/**
 * @param {RequestInit["method"]} method
 * @param {string} path - Absolute path beginning with "/", e.g. "/api/owner/arenas"
 * @param {{ body?: object }} [opts]
 */
export async function apiRequest(method, path, opts = {}) {
  const base = getApiBase();
  if (!base) {
    throw new ApiEnvelopeError("API URL not configured. Set VITE_API_URL in .env.", 0);
  }
  const token = getAccessToken();
  /** @type {Record<string, string>} */
  const headers = {
    Accept: "application/json",
    ...opts.headers,
  };
  const init =
    opts.body !== undefined
      ? { method, headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify(opts.body) }
      : { method, headers };

  if (token) init.headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${base}${path}`, init);
  } catch {
    throw new ApiEnvelopeError("Could not reach the server.", 0);
  }

  const json = /** @type {Record<string, unknown>} */ (await readJsonSafe(res));

  if (!res.ok) {
    const msg = typeof json.message === "string" && json.message.trim() ? json.message : `Request failed (${res.status}).`;
    throw new ApiEnvelopeError(msg, res.status);
  }

  if (json && json.success === false) {
    const msg = typeof json.message === "string" ? json.message : "Request failed.";
    throw new ApiEnvelopeError(msg, res.status);
  }

  return json.success === true && "data" in json ? json.data : json;
}
