import { getApiBase } from "../config/api.js";
import { apiRequest } from "./client.js";

export class AuthApiError extends Error {
  /**
   * @param {string} message
   * @param {number} status
   * @param {string} [code]
   * @param {Record<string, string[]> | undefined} [fields]
   */
  constructor(message, status, code, fields) {
    super(message);
    this.name = "AuthApiError";
    this.status = status;
    this.code = code;
    this.fields = fields;
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
 * Human-readable message from error JSON or HTTP status.
 * @param {Record<string, unknown>} body
 * @param {number} status
 */
function messageFromBody(body, status) {
  if (typeof body.message === "string" && body.message.trim()) return body.message;
  const err = body.error;
  if (typeof err === "string") {
    if (err === "validation_error") return "Please check your input and try again.";
    if (err === "invalid_credentials") return "Invalid email or password.";
    if (err === "email_taken") return "An account with this email already exists.";
    if (err === "rate_limited") return "Too many attempts. Try again later.";
    if (err === "internal_error") return "Something went wrong.";
  }
  if (status === 401) return "Invalid email or password.";
  if (status === 409) return "An account with this email already exists.";
  if (status === 429) return "Too many attempts. Try again later.";
  if (status >= 500) return "Something went wrong.";
  return `Request failed (${status}).`;
}

/**
 * Extract first validation detail from optional `fields`.
 * @param {Record<string, unknown>} body
 */
function firstFieldMessage(body) {
  const fields = body.fields;
  if (!fields || typeof fields !== "object") return null;
  for (const arr of Object.values(fields)) {
    if (Array.isArray(arr) && arr.length && typeof arr[0] === "string") return arr[0];
  }
  return null;
}

/**
 * @param {string} path - e.g. "/api/auth/login"
 * @param {object} payload
 */
async function postAuth(path, payload) {
  const base = getApiBase();
  if (!base) {
    throw new AuthApiError("API URL not configured. Set VITE_API_URL in .env.", 0, "missing_config");
  }
  let res;
  try {
    res = await fetch(`${base}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new AuthApiError("Could not reach the server. Check your connection and VITE_API_URL.", 0, "network_error");
  }

  const body = await readJsonSafe(res);

  if (!res.ok) {
    const msg = (typeof body.message === "string" && body.message.trim() && body.message) || firstFieldMessage(body) || messageFromBody(body, res.status);
    const code = typeof body.error === "string" ? body.error : undefined;
    const fields =
      body.fields && typeof body.fields === "object" ? /** @type {Record<string, string[]>} */ (body.fields) : undefined;
    throw new AuthApiError(msg, res.status, code, fields);
  }

  return body;
}

/** @param {Record<string, unknown>} body */
function unwrapAuthPayload(body) {
  if (body && typeof body.success === "boolean" && body.data !== undefined && body.data !== null) {
    return /** @type {Record<string, unknown>} */ (body.data);
  }
  return body;
}

/**
 * @param {{ email: string, password: string }} credentials
 */
export async function login(credentials) {
  const body = await postAuth("/api/auth/login", {
    email: credentials.email.trim().toLowerCase(),
    password: credentials.password,
  });
  const data = unwrapAuthPayload(body);
  const userRaw = /** @type {Record<string, unknown>} */ ((data.user ?? {}));

  return {
    user: {
      id: String(userRaw.id ?? userRaw._id ?? ""),
      email: String(userRaw.email ?? ""),
      name: String(userRaw.name ?? ""),
      role: userRaw.role === "owner" || userRaw.role === "admin" ? userRaw.role : "player",
    },
    accessToken: String(data.accessToken ?? ""),
    expiresIn: typeof data.expiresIn === "number" ? data.expiresIn : undefined,
  };
}

/**
 * @param {{ name: string, email: string, password: string, role?: "owner" | "player" }} input
 */
export async function register(input) {
  /** @type {{ name: string, email: string, password: string, role?: "owner" | "player" }} */
  const payload = {
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    password: input.password,
  };
  if (input.role === "owner" || input.role === "player") payload.role = input.role;
  const body = await postAuth("/api/auth/register", payload);
  const data = unwrapAuthPayload(body);
  const userRaw = /** @type {Record<string, unknown>} */ ((data.user ?? {}));

  return {
    user: {
      id: String(userRaw.id ?? userRaw._id ?? ""),
      email: String(userRaw.email ?? ""),
      name: String(userRaw.name ?? ""),
      role: userRaw.role === "owner" || userRaw.role === "admin" ? userRaw.role : "player",
    },
    accessToken: String(data.accessToken ?? ""),
    expiresIn: typeof data.expiresIn === "number" ? data.expiresIn : undefined,
  };
}

/** Revoke JWT on server (best-effort). Caller always clears local session afterward. */
export async function logoutRemote() {
  try {
    await apiRequest("POST", "/api/auth/logout", { body: {} });
  } catch {
    /* 401/expired/network/conflict — treat as logged out locally */
  }
}
