const { normalizeBookingDate } = require("../config/slotConfig");
const { COURT_STATUSES, effectiveCourtStatus } = require("../utils/courtStatus");
const { normalizeSport } = require("../constants/sports");

function serializeCourt(court, arenaSportFallback) {
  const o = court.toObject ? court.toObject() : { ...court };
  const status = effectiveCourtStatus(o);
  return {
    _id: o._id,
    name: o.name,
    sport: o.sport ?? arenaSportFallback ?? null,
    sortOrder: o.sortOrder ?? 0,
    visible: o.visible !== false,
    status,
    isActive: status === "available",
  };
}

class OwnerHomeService {
  constructor(arenaRepository, courtRepository, bookingRepository, eventRepository) {
    this.arenaRepository = arenaRepository;
    this.courtRepository = courtRepository;
    this.bookingRepository = bookingRepository;
    this.eventRepository = eventRepository;
  }

  async getOwnerHome(ownerId) {
    const arenas = await this.arenaRepository.findOwnedLeanByOwner(ownerId);
    return Promise.all(arenas.map((a) => this.buildArenaPayload(a)));
  }

  async getOwnerHomeArena(ownerId, arenaId) {
    const arena = await this.arenaRepository.findOwnedLeanByOwnerAndId(ownerId, arenaId);
    if (!arena) {
      throw new Error("Arena not found or not owned by user");
    }
    return this.buildArenaPayload(arena);
  }

  async buildArenaPayload(arena) {
    const arenaId = arena._id;
    const pricePerSlot = Number(arena.pricePerSlot) || 0;
    const today = normalizeBookingDate(new Date());

    const [courtsRaw, bookingCounts, eventsRaw] = await Promise.all([
      this.courtRepository.findByArenaId(arenaId),
      Promise.all([
        this.bookingRepository.countByArenaOnDateExcludingCancelled(arenaId, today),
        this.bookingRepository.countByArenaAndStatus(arenaId, "completed"),
        this.bookingRepository.countByArenaAndStatus(arenaId, "confirmed"),
      ]),
      this.eventRepository.findByArenaDashboard(arenaId),
    ]);

    const [todayBookingsCount, completedBookingsCount, confirmedBookingsCount] = bookingCounts;

    const courts = courtsRaw.map((c) => serializeCourt(c, arena.sport));

    return {
      ...arena,
      open: arena.isAvailable !== false,
      courts,
      bookings: {
        todayBookingsCount,
        completedBookingsCount,
        confirmedBookingsCount,
        estimatedRevenueTotal: completedBookingsCount * pricePerSlot,
        /** Slot price used for estimate (arena.pricePerSlot). */
        pricePerSlot,
      },
      events: eventsRaw.map((e) => this.serializeEvent(e)),
    };
  }

  serializeEvent(e) {
    return {
      _id: e._id,
      title: e.title,
      dateLabel: e.dateLabel,
      sportEmoji: e.sportEmoji,
      spots: e.spots,
      description: e.description,
      location: e.location,
      arena: e.arena,
      startsAt: e.startsAt,
      endsAt: e.endsAt,
      status: e.status,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    };
  }

  async assertArenaOwned(ownerId, arenaId) {
    const arena = await this.arenaRepository.findByIdAndOwner(arenaId, ownerId);
    if (!arena) {
      throw new Error("Arena not found or not owned by user");
    }
    return arena;
  }

  async patchCourtForOwner(ownerId, courtId, body) {
    const court = await this.courtRepository.findByIdWithArena(courtId);
    if (!court || !court.arena) {
      throw new Error("Court not found");
    }
    if (String(court.arena.owner) !== String(ownerId)) {
      throw new Error("Court not found");
    }

    const patch = {};
    if (Object.prototype.hasOwnProperty.call(body, "visible")) {
      patch.visible = Boolean(body.visible);
    }
    if (Object.prototype.hasOwnProperty.call(body, "status")) {
      if (!COURT_STATUSES.includes(body.status)) {
        throw new Error(`status must be one of: ${COURT_STATUSES.join(", ")}`);
      }
      patch.status = body.status;
      patch.isActive = body.status === "available";
    }
    if (
      Object.prototype.hasOwnProperty.call(body, "isActive") &&
      !Object.prototype.hasOwnProperty.call(body, "status")
    ) {
      patch.isActive = Boolean(body.isActive);
      patch.status = patch.isActive ? "available" : "unavailable";
    }
    if (Object.prototype.hasOwnProperty.call(body, "name")) {
      if (!body.name || String(body.name).trim() === "") {
        throw new Error("Court name cannot be empty");
      }
      patch.name = String(body.name).trim();
    }
    if (Object.prototype.hasOwnProperty.call(body, "sortOrder")) {
      patch.sortOrder = Number(body.sortOrder);
    }
    if (Object.prototype.hasOwnProperty.call(body, "sport")) {
      if (body.sport == null || body.sport === "") {
        patch.$unset = { ...(patch.$unset || {}), sport: "" };
      } else {
        patch.sport = normalizeSport(body.sport);
      }
    }

    let updated = court;
    if (Object.keys(patch).length > 0) {
      updated = await this.courtRepository.updateById(courtId, patch);
    }
    const arenaSportFallback =
      court.arena && typeof court.arena === "object" ? court.arena.sport : undefined;
    return serializeCourt(updated, arenaSportFallback);
  }

  async createEventForOwner(ownerId, arenaId, body) {
    await this.assertArenaOwned(ownerId, arenaId);

    const {
      title,
      description,
      location,
      startsAt,
      endsAt,
      dateLabel,
      sportEmoji,
      spots,
      status,
    } = body;

    if (!title || String(title).trim() === "") {
      throw new Error("title is required");
    }
    if (!startsAt || !endsAt) {
      throw new Error("startsAt and endsAt are required");
    }

    const start = new Date(startsAt);
    const end = new Date(endsAt);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error("startsAt and endsAt must be valid dates");
    }

    const allowedStatus = ["draft", "published"];
    const eventStatus = status && allowedStatus.includes(status) ? status : "published";

    const doc = await this.eventRepository.create({
      title: String(title).trim(),
      description: description != null ? String(description).trim() : undefined,
      location: location != null ? String(location).trim() : undefined,
      arena: arenaId,
      startsAt: start,
      endsAt: end,
      dateLabel: dateLabel != null ? String(dateLabel).trim() : undefined,
      sportEmoji: sportEmoji != null ? String(sportEmoji).trim() : undefined,
      spots: spots != null ? Number(spots) : undefined,
      status: eventStatus,
    });

    return this.serializeEvent(doc.toObject ? doc.toObject() : doc);
  }

  async deleteEventForOwner(ownerId, arenaId, eventId) {
    await this.assertArenaOwned(ownerId, arenaId);
    const existing = await this.eventRepository.findByIdAndArena(eventId, arenaId);
    if (!existing) {
      throw new Error("Event not found");
    }
    const cancelled = await this.eventRepository.cancelById(eventId);
    return this.serializeEvent(cancelled.toObject ? cancelled.toObject() : cancelled);
  }
}

module.exports = OwnerHomeService;