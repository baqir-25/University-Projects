const Booking = require('../models/Booking');
const BaseRepository = require('./BaseRepository');
const { normalizeBookingDate } = require('../config/slotConfig');

const occupiesSlot = { status: { $in: Booking.SLOT_OCCUPYING_STATUSES } };

class BookingRepository extends BaseRepository {
  constructor() { super(Booking); }

  async findByUserId(userId) {
    return await this.model.find({ user: userId }).populate("arena").populate("court");
  }

  async findByUserIdAndStatus(userId, status) {
    return await this.model.find({ user: userId, status }).populate("arena").populate("court");
  }

  /** Confirmed bookings on or after today (UTC calendar day). */
  async findByUserUpcomingFrom(userId, todayStartUtc) {
    return await this.model
      .find({
        user: userId,
        status: "confirmed",
        date: { $gte: todayStartUtc },
      })
      .populate("arena")
      .populate("court")
      .sort({ date: 1, timeSlot: 1 });
  }

  /** History: completed, cancelled, or stale confirmed before today (UTC). */
  async findByUserPastBefore(userId, todayStartUtc) {
    return await this.model
      .find({
        user: userId,
        $or: [
          { status: "completed" },
          { status: "cancelled" },
          { status: "confirmed", date: { $lt: todayStartUtc } },
        ],
      })
      .populate("arena")
      .populate("court")
      .sort({ date: -1, timeSlot: -1 });
  }

  /**
   * All bookings for an arena (owner dashboard). Optional calendar day + status filter.
   * @param {string} arenaId
   * @param {{ date?: string, status?: 'confirmed'|'cancelled'|'completed' }} filters
   */
  async findForArena(arenaId, filters = {}) {
    const query = { arena: arenaId };
    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.date != null && String(filters.date).trim() !== "") {
      const day = normalizeBookingDate(filters.date);
      if (!day) {
        throw new Error("Invalid date; use YYYY-MM-DD or ISO date");
      }
      query.date = day;
    }
    return await this.model
      .find(query)
      .populate("user", "name email")
      .populate("court")
      .sort({ date: -1, timeSlot: -1 });
  }

  async findOccupyingAtArenaSlot(arenaId, date, timeSlot, excludeBookingId = null) {
    const q = {
      arena: arenaId,
      date,
      timeSlot,
      ...occupiesSlot,
    };
    if (excludeBookingId) q._id = { $ne: excludeBookingId };
    return await this.model.findOne(q);
  }

  async findByIdAndUser(id, userId) {
    return await this.model.findOne({ _id: id, user: userId });
  }

  async checkConflict(arenaId, date, timeSlot, courtId) {
    const base = {
      arena: arenaId,
      date,
      timeSlot,
      ...occupiesSlot,
    };
    if (courtId != null && courtId !== "") {
      return await this.model.findOne({ ...base, court: courtId });
    }
    return await this.model.findOne({
      ...base,
      $or: [{ court: null }, { court: { $exists: false } }],
    });
  }

  async checkConflictExcludingBooking(arenaId, date, timeSlot, courtId, excludeBookingId) {
    const base = {
      arena: arenaId,
      date,
      timeSlot,
      _id: { $ne: excludeBookingId },
      ...occupiesSlot,
    };
    if (courtId != null && courtId !== "") {
      return await this.model.findOne({ ...base, court: courtId });
    }
    return await this.model.findOne({
      ...base,
      $or: [{ court: null }, { court: { $exists: false } }],
    });
  }

  async findByIdWithArena(id) {
    return await this.model.findById(id).populate("arena");
  }

  async findByIdForUser(id, userId) {
    return await this.model
      .findOne({ _id: id, user: userId })
      .populate("arena")
      .populate("court");
  }

  async countByArenaOnDateExcludingCancelled(arenaId, date) {
    return await this.model.countDocuments({
      arena: arenaId,
      date,
      status: { $ne: "cancelled" },
    });
  }

  async countByArenaAndStatus(arenaId, status) {
    return await this.model.countDocuments({ arena: arenaId, status });
  }

  /**
   * Occupying bookings per court for a calendar day (UTC-normalized date).
   * Returns Map<courtId string, string[] timeSlot labels> (unique, sorted).
   */
  async findOccupyingSlotsByCourtForDate(arenaIds, date) {
    const map = new Map();
    if (!arenaIds.length || !date) return map;

    const rows = await this.model
      .find({
        arena: { $in: arenaIds },
        date,
        ...occupiesSlot,
        court: { $type: "objectId" },
      })
      .select({ court: 1, timeSlot: 1 })
      .lean();

    for (const row of rows) {
      if (!row.court) continue;
      const cid = String(row.court);
      if (!map.has(cid)) map.set(cid, new Set());
      map.get(cid).add(row.timeSlot);
    }

    const out = new Map();
    for (const [cid, set] of map) {
      out.set(cid, [...set].sort());
    }
    return out;
  }
}
module.exports = new BookingRepository();