/**
 * Normalize API court PATCH/GET summaries into Owner UI court rows.
 * @param {Record<string, unknown>} c
 * @param {{ defaultPrice?: number, defaultSport?: string }} defaults
 */
export function courtFromApiCourt(c, defaults = {}) {
  const defaultPrice = typeof defaults.defaultPrice === "number" ? defaults.defaultPrice : 35;
  const defaultSport =
    defaults.defaultSport && String(defaults.defaultSport).trim() ? String(defaults.defaultSport).trim().toUpperCase() : "MULTI-SPORT";

  const status =
    typeof c.status === "string" && ["available", "unavailable", "maintenance"].includes(c.status)
      ? c.status
      : typeof c.isActive === "boolean"
        ? c.isActive
          ? "available"
          : "unavailable"
        : "available";

  const visible = c.visible !== false;
  const isActive = typeof c.isActive === "boolean" ? c.isActive : status === "available";

  const apiSportRaw = c.sport;
  const sportFromApi =
    typeof apiSportRaw === "string" && apiSportRaw.trim() ? apiSportRaw.trim().toUpperCase() : null;

  return {
    id: String(c._id ?? c.id),
    name: typeof c.name === "string" ? c.name : "Court",
    sortOrder: typeof c.sortOrder === "number" ? c.sortOrder : 0,
    visible,
    status,
    isActive,
    sport: sportFromApi ?? defaultSport,
    price: defaultPrice,
    capacity: typeof c.capacity === "number" ? c.capacity : 10,
    amenities: Array.isArray(c.amenities) ? c.amenities : [],
    bookedSlots: Array.isArray(c.bookedSlots) ? c.bookedSlots : [],
  };
}

function defaultSportTokenFromArena(sportRaw) {
  const sport = typeof sportRaw === "string" ? sportRaw.trim() : String(sportRaw || "");
  if (!sport) return "MULTI-SPORT";
  const first = sport.split(/·|,/).map((s) => s.trim()).filter(Boolean)[0];
  return (first ? first.toUpperCase() : sport.toUpperCase().slice(0, 48)) || "MULTI-SPORT";
}

function formatOwnerBookingDate(dateRaw) {
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
 * Owner Bookings tab row — API booking with populated `user` and `court`.
 * @param {Record<string, unknown>} raw
 */
export function mapOwnerBookingListRow(raw) {
  if (!raw || typeof raw !== "object") return null;
  const id = raw._id != null ? String(raw._id) : raw.id != null ? String(raw.id) : "";
  if (!id) return null;

  const user = raw.user && typeof raw.user === "object" ? /** @type {Record<string, unknown>} */ (raw.user) : null;
  const court = raw.court && typeof raw.court === "object" ? /** @type {Record<string, unknown>} */ (raw.court) : null;

  const userName = user?.name != null ? String(user.name).trim() : "";
  const userEmail = user?.email != null ? String(user.email).trim() : "";
  const by =
    userName && userEmail ? `${userName} · ${userEmail}` : userName || userEmail || "Player";

  const courtName = court?.name != null ? String(court.name) : String(raw.courtName ?? "Court");
  const sport =
    court?.sport != null
      ? String(court.sport)
      : raw.sport != null
        ? String(raw.sport)
        : "";

  const dateRaw = raw.date ?? raw.bookingDate ?? raw.scheduledDate;
  const date = formatOwnerBookingDate(dateRaw);
  const time = String(raw.timeSlot ?? raw.time ?? "—");

  const dbStatus = String(raw.status ?? "confirmed").toLowerCase();

  const amt =
    typeof raw.amount === "number"
      ? raw.amount
      : typeof raw.total === "number"
        ? raw.total
        : Number(raw.price ?? raw.amt ?? 0) || 0;

  return { id, court: courtName, sport, date, time, by, amt, status: dbStatus };
}

/** Map a single API deal to Owner home list row. */
export function dealRowFromApi(raw) {
  if (!raw || typeof raw !== "object") return null;
  const id = raw._id != null ? String(raw._id) : raw.id != null ? String(raw.id) : "";
  if (!id) return null;
  const discountPercent =
    typeof raw.discountPercent === "number" ? raw.discountPercent : Number(raw.discountPercent) || 0;
  return {
    ownerDealId: id,
    title: typeof raw.title === "string" ? raw.title : "",
    discountPercent,
    description: raw.description != null ? String(raw.description) : "",
    startsAt: raw.startsAt != null ? String(raw.startsAt) : "",
    endsAt: raw.endsAt != null ? String(raw.endsAt) : "",
    isActive: raw.isActive !== false,
  };
}

/** @returns {unknown} event row for Owner + Discover helpers */
export function arenaHomeFromApi(ah) {
  const id = String(ah._id ?? ah.id ?? "");
  const sport = typeof ah.sport === "string" ? ah.sport : "";
  const pricePerSlot = typeof ah.pricePerSlot === "number" ? ah.pricePerSlot : 35;

  const defaultSportTok = defaultSportTokenFromArena(sport);
  const courtsRaw = Array.isArray(ah.courts) ? ah.courts : [];
  /** @type {Record<string, unknown>[]} */
  const courtsTyped = courtsRaw.map((raw) =>
    typeof raw === "object" && raw ? /** @type {Record<string, unknown>} */ (raw) : {},
  );

  const courts = courtsTyped.map((c) =>
    courtFromApiCourt(c, {
      defaultPrice: pricePerSlot,
      defaultSport: defaultSportTok,
    }),
  );
  courts.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  /** @type {Record<string, unknown>|null} */
  let bookingsStats = null;
  const bstats = ah.bookings;
  if (bstats && typeof bstats === "object" && !Array.isArray(bstats)) {
    bookingsStats = /** @type {Record<string, unknown>} */ (bstats);
  }

  /** @type {Record<string, unknown>[]} */
  const eventsRaw = Array.isArray(ah.events) ? ah.events.map((e) => (typeof e === "object" && e ? e : {})) : [];

  const name = typeof ah.name === "string" ? ah.name : "";
  const events = eventsRaw.map((ev) => eventRowFromApi(ev, name));

  /** @type {Record<string, unknown>[]} */
  const dealsRaw = Array.isArray(ah.deals) ? ah.deals.map((d) => (typeof d === "object" && d ? d : {})) : [];
  const deals = dealsRaw.map((d) => dealRowFromApi(/** @type {Record<string, unknown>} */ (d))).filter(Boolean);

  const open =
    ah.open !== undefined ? ah.open !== false && ah.open !== "false" : ah.isAvailable !== false && ah.isAvailable !== "false";

  return {
    id,
    name,
    location: typeof ah.location === "string" ? ah.location : "",
    sport,
    description: typeof ah.description === "string" ? ah.description : "",
    pricePerSlot,
    owner: ah.owner,
    open,
    courts,
    bookings: [],
    bookingsStats,
    events,
    deals,
  };
}

/** Map a single API event to Owner/Discover event row. */
export function eventRowFromApi(ev, arenaName) {
  let dateLabel = typeof ev.dateLabel === "string" ? ev.dateLabel : "";
  if (!dateLabel && typeof ev.startsAt === "string") {
    dateLabel = formatIsoToDisplay(ev.startsAt);
  }
  const spots = typeof ev.spots === "number" ? ev.spots : 0;
  return {
    ownerEventId: String(ev._id ?? ev.id ?? ""),
    title: typeof ev.title === "string" ? ev.title : "",
    date: dateLabel,
    spots,
    total: spots,
    sport: typeof ev.sportEmoji === "string" ? ev.sportEmoji : "🏟️",
    arena: arenaName,
  };
}

function formatIsoToDisplay(iso) {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  } catch {
    return iso;
  }
}
