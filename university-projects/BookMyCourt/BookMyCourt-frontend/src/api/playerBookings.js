import { apiRequest } from "./client.js";

/**
 * @param {{ scope?: "upcoming" | "past", status?: string }} [query]
 */
export async function fetchMyBookings(query = {}) {
  const q = new URLSearchParams();
  if (query.scope) q.set("scope", query.scope);
  else if (query.status) q.set("status", query.status);
  const qs = q.toString();
  return apiRequest("GET", `/api/bookings${qs ? `?${qs}` : ""}`);
}

/**
 * @param {{ arena: string, date: string, timeSlot: string, court?: string }} body
 */
export async function createBooking(body) {
  /** @type {Record<string, unknown>} */
  const payload = {
    arena: body.arena,
    date: body.date,
    timeSlot: body.timeSlot,
  };
  if (body.court != null && String(body.court).trim() !== "") {
    payload.court = String(body.court).trim();
  }
  return apiRequest("POST", "/api/bookings", { body: payload });
}

/**
 * @param {unknown} data - envelope `data` (array or wrapper)
 */
export function extractBookingsList(data) {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && Array.isArray(/** @type {{ bookings?: unknown[] }} */ (data).bookings))
    return /** @type {{ bookings: unknown[] }} */ (data).bookings;
  return [];
}

function formatBookingDateDisplay(dateRaw) {
  if (dateRaw == null) return "";
  const s = String(dateRaw);
  if (/^\d{4}-\d{2}-\d{2}/.test(s) || s.includes("T")) {
    try {
      const d = new Date(s);
      if (!Number.isNaN(d.getTime()))
        return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    } catch {
      /* use raw */
    }
  }
  return s;
}

/**
 * @param {Record<string, unknown>} raw
 * @param {"upcoming" | "past"} scope
 */
export function mapMyBookingRow(raw, scope) {
  if (!raw || typeof raw !== "object") return null;
  const id = raw._id != null ? String(raw._id) : raw.id != null ? String(raw.id) : "";
  if (!id) return null;

  const arena = raw.arena && typeof raw.arena === "object" ? /** @type {Record<string, unknown>} */ (raw.arena) : null;
  const court = raw.court && typeof raw.court === "object" ? /** @type {Record<string, unknown>} */ (raw.court) : null;

  const arenaName = arena?.name != null ? String(arena.name) : String(raw.arenaName ?? "");
  const courtName = court?.name != null ? String(court.name) : String(raw.courtName ?? "Court");
  const arenaId = arena?._id != null ? String(arena._id) : arena?.id != null ? String(arena.id) : undefined;

  const dateRaw = raw.date ?? raw.bookingDate ?? raw.scheduledDate;
  const date = formatBookingDateDisplay(dateRaw);
  const time = String(raw.timeSlot ?? raw.time ?? raw.slot ?? "TBD");

  const dbStatus = String(raw.status ?? "").toLowerCase();

  /** @type {"upcoming" | "completed" | "cancelled"} */
  let uiStatus = "upcoming";
  if (scope === "upcoming") {
    uiStatus = "upcoming";
  } else if (dbStatus === "cancelled") {
    uiStatus = "cancelled";
  } else {
    uiStatus = "completed";
  }

  const amt =
    typeof raw.amount === "number"
      ? raw.amount
      : typeof raw.total === "number"
        ? raw.total
        : Number(raw.price ?? raw.amt ?? 0) || 0;

  return {
    id,
    apiBookingId: id,
    arenaId,
    arena: arenaName,
    court: courtName,
    date,
    time,
    status: uiStatus,
    amt,
    localOnly: false,
  };
}
