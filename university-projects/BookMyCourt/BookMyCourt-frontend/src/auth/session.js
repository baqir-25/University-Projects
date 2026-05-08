const STORAGE_KEY = "bmc_auth_session";

/**
 * @typedef {{ accessToken: string, expiresIn?: number, user: { id: string, email: string, name: string, role: string } }} AuthSessionPayload
 */

/**
 * @param {AuthSessionPayload} payload
 */
export function saveSession(payload) {
  const expiresAt = typeof payload.expiresIn === "number" ? Date.now() + payload.expiresIn * 1000 : null;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        accessToken: payload.accessToken,
        user: payload.user,
        expiresAt,
      })
    );
  } catch {
    /* ignore quota / private mode */
  }
}

/** @returns {{ accessToken: string, user: object, expiresAt: number | null } | null} */
export function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data?.accessToken || !data?.user) return null;
    if (typeof data.expiresAt === "number" && Date.now() > data.expiresAt) {
      clearSession();
      return null;
    }
    return {
      accessToken: data.accessToken,
      user: data.user,
      expiresAt: data.expiresAt ?? null,
    };
  } catch {
    return null;
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** @returns {string | null} */
export function getAccessToken() {
  return loadSession()?.accessToken ?? null;
}

export function initialUserFromSession() {
  return loadSession()?.user ?? null;
}
