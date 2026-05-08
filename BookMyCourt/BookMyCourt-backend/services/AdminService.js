const mongoose = require("mongoose");
const User = require("../models/User");
const Arena = require("../models/Arena");
const Court = require("../models/Court");
const Booking = require("../models/Booking");
const Deal = require("../models/Deal");
const Event = require("../models/Event");
const EventRegistration = require("../models/EventRegistration");
const Review = require("../models/Review");

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toUtcDateRange(from, to) {
  if (!DATE_RE.test(from) || !DATE_RE.test(to)) {
    throw new Error("from and to must be in YYYY-MM-DD format");
  }
  const fromDate = new Date(`${from}T00:00:00.000Z`);
  const toDate = new Date(`${to}T23:59:59.999Z`);
  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
    throw new Error("Invalid date range");
  }
  if (fromDate > toDate) {
    throw new Error("from must be earlier than or equal to to");
  }
  return { fromDate, toDate };
}

function parsePagination(pageRaw, limitRaw) {
  const page = Math.max(1, Number.parseInt(pageRaw, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(limitRaw, 10) || 10));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

function paginationMeta(page, limit, total) {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

function parseEntityStatus(status, fields) {
  if (status == null || String(status).trim() === "") return {};
  const normalized = String(status).trim().toLowerCase();
  if (normalized === "active") return fields.active;
  if (normalized === "disabled") return fields.disabled;
  throw new Error("status must be one of: active, disabled");
}

function parseDisabledPatch(body) {
  if (!body || typeof body !== "object" || typeof body.disabled !== "boolean") {
    throw new Error("disabled (boolean) is required");
  }
  return body.disabled;
}

function parseCascadeFlag(body) {
  if (!body || typeof body !== "object") return false;
  if (typeof body.cascade === "boolean") return body.cascade;
  if (typeof body.cascadeDisable === "boolean") return body.cascadeDisable;
  return false;
}

function ensureObjectId(id, fieldName) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(`Invalid ${fieldName}`);
  }
}

function mapUser(user) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    disabled: Boolean(user.disabled),
    city: user.city || null,
    phone: user.phone || null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function mapArena(arena) {
  const owner = arena.owner || null;
  return {
    id: String(arena._id),
    name: arena.name,
    sport: arena.sport,
    location: arena.location,
    pricePerSlot: arena.pricePerSlot,
    disabled: arena.isAvailable === false,
    owner: owner
      ? {
          id: String(owner._id),
          name: owner.name,
          email: owner.email,
          disabled: Boolean(owner.disabled),
        }
      : null,
    createdAt: arena.createdAt,
    updatedAt: arena.updatedAt,
  };
}

function mapCourt(court) {
  return {
    id: String(court._id),
    name: court.name,
    sport: court.sport || null,
    sortOrder: court.sortOrder ?? 0,
    visible: court.visible !== false,
    status: court.status,
    disabled: court.isActive === false,
    arena: court.arena
      ? {
          id: String(court.arena._id),
          name: court.arena.name,
          location: court.arena.location || null,
        }
      : null,
    createdAt: court.createdAt,
    updatedAt: court.updatedAt,
  };
}

class AdminService {
  buildUserListFilter(role, q, status) {
    const filter = { role, ...parseEntityStatus(status, { active: { disabled: { $ne: true } }, disabled: { disabled: true } }) };
    if (q != null && String(q).trim() !== "") {
      const pattern = new RegExp(escapeRegex(String(q).trim()), "i");
      filter.$or = [{ name: pattern }, { email: pattern }, { city: pattern }, { phone: pattern }];
    }
    return filter;
  }

  async listUsers({ role, q, status, page, limit }) {
    const { page: pageNo, limit: pageSize, skip } = parsePagination(page, limit);
    const filter = this.buildUserListFilter(role, q, status);

    const [total, rows] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize),
    ]);

    return {
      items: rows.map(mapUser),
      meta: paginationMeta(pageNo, pageSize, total),
    };
  }

  async patchUserDisabled(userId, disabled, expectedRole) {
    ensureObjectId(userId, "userId");
    const user = await User.findById(userId);
    if (!user || user.role !== expectedRole) {
      throw new Error(`${expectedRole} not found`);
    }
    user.disabled = disabled;
    await user.save();
    return mapUser(user);
  }

  async patchOwnerDisabled(ownerId, disabled, cascade) {
    ensureObjectId(ownerId, "ownerId");
    const owner = await User.findById(ownerId);
    if (!owner || owner.role !== "owner") {
      throw new Error("owner not found");
    }
    owner.disabled = disabled;
    await owner.save();

    const summary = { arenasUpdated: 0, courtsUpdated: 0 };
    if (cascade) {
      const arenaDocs = await Arena.find({ owner: ownerId }).select({ _id: 1 });
      const arenaIds = arenaDocs.map((a) => a._id);

      const arenaResult = await Arena.updateMany(
        { owner: ownerId },
        { $set: { isAvailable: !disabled } }
      );
      summary.arenasUpdated = arenaResult.modifiedCount || 0;

      if (arenaIds.length > 0) {
        const courtPatch = disabled
          ? { isActive: false, status: "unavailable" }
          : { isActive: true, status: "available" };
        const courtResult = await Court.updateMany(
          { arena: { $in: arenaIds } },
          { $set: courtPatch }
        );
        summary.courtsUpdated = courtResult.modifiedCount || 0;
      }
    }

    return { owner: mapUser(owner), cascadeSummary: summary, cascadeApplied: cascade };
  }

  async deletePlayerUser(userId) {
    ensureObjectId(userId, "userId");
    const user = await User.findById(userId);
    if (!user || user.role !== "player") {
      throw new Error("player not found");
    }

    const [bookingResult, reviewResult, registrationResult, deleteUserResult] = await Promise.all([
      Booking.deleteMany({ user: userId }),
      Review.deleteMany({ user: userId }),
      EventRegistration.deleteMany({ user: userId }),
      User.deleteOne({ _id: userId }),
    ]);

    return {
      removedUserId: userId,
      removedBookings: bookingResult.deletedCount || 0,
      removedReviews: reviewResult.deletedCount || 0,
      removedEventRegistrations: registrationResult.deletedCount || 0,
      removedUsers: deleteUserResult.deletedCount || 0,
    };
  }

  async listArenas({ q, status, ownerId, page, limit }) {
    const { page: pageNo, limit: pageSize, skip } = parsePagination(page, limit);
    const filter = {
      ...parseEntityStatus(status, { active: { isAvailable: true }, disabled: { isAvailable: false } }),
    };

    if (ownerId != null && String(ownerId).trim() !== "") {
      ensureObjectId(ownerId, "ownerId");
      filter.owner = ownerId;
    }

    if (q != null && String(q).trim() !== "") {
      const pattern = new RegExp(escapeRegex(String(q).trim()), "i");
      filter.$or = [{ name: pattern }, { location: pattern }, { sport: pattern }];
    }

    const [total, rows] = await Promise.all([
      Arena.countDocuments(filter),
      Arena.find(filter)
        .populate({ path: "owner", select: "name email disabled" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize),
    ]);

    return {
      items: rows.map(mapArena),
      meta: paginationMeta(pageNo, pageSize, total),
    };
  }

  async patchArenaDisabled(arenaId, disabled) {
    ensureObjectId(arenaId, "arenaId");
    const arena = await Arena.findById(arenaId);
    if (!arena) throw new Error("arena not found");

    arena.isAvailable = !disabled;
    await arena.save();

    let courtsUpdated = 0;
    if (disabled) {
      const courtResult = await Court.updateMany(
        { arena: arenaId },
        { $set: { isActive: false, status: "unavailable" } }
      );
      courtsUpdated = courtResult.modifiedCount || 0;
    }

    return {
      arena: {
        id: String(arena._id),
        disabled: arena.isAvailable === false,
      },
      cascadeSummary: { courtsUpdated },
    };
  }

  async listCourts({ q, status, arenaId, page, limit }) {
    const { page: pageNo, limit: pageSize, skip } = parsePagination(page, limit);
    const match = {
      ...parseEntityStatus(status, { active: { isActive: true }, disabled: { isActive: false } }),
    };

    if (arenaId != null && String(arenaId).trim() !== "") {
      ensureObjectId(arenaId, "arenaId");
      match.arena = new mongoose.Types.ObjectId(arenaId);
    }

    const pipeline = [
      { $match: match },
      {
        $lookup: {
          from: "arenas",
          localField: "arena",
          foreignField: "_id",
          as: "arena",
        },
      },
      {
        $unwind: {
          path: "$arena",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    if (q != null && String(q).trim() !== "") {
      const pattern = new RegExp(escapeRegex(String(q).trim()), "i");
      pipeline.push({
        $match: {
          $or: [{ name: pattern }, { sport: pattern }, { "arena.name": pattern }, { "arena.location": pattern }],
        },
      });
    }

    const countRows = await Court.aggregate([...pipeline, { $count: "total" }]);
    const total = countRows.length ? countRows[0].total : 0;
    const rows = await Court.aggregate([
      ...pipeline,
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: pageSize },
    ]);

    return {
      items: rows.map((court) =>
        mapCourt({
          ...court,
          arena: court.arena
            ? {
                _id: court.arena._id,
                name: court.arena.name,
                location: court.arena.location,
              }
            : null,
        })
      ),
      meta: paginationMeta(pageNo, pageSize, total),
    };
  }

  async patchCourtDisabled(courtId, disabled) {
    ensureObjectId(courtId, "courtId");
    const court = await Court.findById(courtId);
    if (!court) throw new Error("court not found");

    court.isActive = !disabled;
    court.status = disabled ? "unavailable" : "available";
    await court.save();

    return {
      id: String(court._id),
      disabled: court.isActive === false,
      status: court.status,
    };
  }

  async deleteCourt(courtId) {
    ensureObjectId(courtId, "courtId");
    const court = await Court.findById(courtId);
    if (!court) throw new Error("court not found");

    const [bookingResult, courtResult] = await Promise.all([
      Booking.deleteMany({ court: courtId }),
      Court.deleteOne({ _id: courtId }),
    ]);

    return {
      removedCourtId: courtId,
      removedBookings: bookingResult.deletedCount || 0,
      removedCourts: courtResult.deletedCount || 0,
    };
  }

  async cascadeDeleteForArenaIds(arenaIds, removeArenaDocuments) {
    if (!arenaIds.length) {
      return {
        removedArenas: 0,
        removedCourts: 0,
        removedBookings: 0,
        removedDeals: 0,
        removedEvents: 0,
        removedEventRegistrations: 0,
        removedReviews: 0,
      };
    }

    const [eventDocs] = await Promise.all([
      Event.find({ arena: { $in: arenaIds } }).select({ _id: 1 }),
    ]);
    const eventIds = eventDocs.map((e) => e._id);

    const [
      bookingResult,
      dealResult,
      reviewResult,
      courtResult,
      eventResult,
      registrationByEventResult,
      arenaResult,
    ] = await Promise.all([
      Booking.deleteMany({ arena: { $in: arenaIds } }),
      Deal.deleteMany({ arena: { $in: arenaIds } }),
      Review.deleteMany({ arena: { $in: arenaIds } }),
      Court.deleteMany({ arena: { $in: arenaIds } }),
      Event.deleteMany({ arena: { $in: arenaIds } }),
      eventIds.length ? EventRegistration.deleteMany({ event: { $in: eventIds } }) : Promise.resolve({ deletedCount: 0 }),
      removeArenaDocuments ? Arena.deleteMany({ _id: { $in: arenaIds } }) : Promise.resolve({ deletedCount: 0 }),
    ]);

    return {
      removedArenas: arenaResult.deletedCount || 0,
      removedCourts: courtResult.deletedCount || 0,
      removedBookings: bookingResult.deletedCount || 0,
      removedDeals: dealResult.deletedCount || 0,
      removedEvents: eventResult.deletedCount || 0,
      removedEventRegistrations: registrationByEventResult.deletedCount || 0,
      removedReviews: reviewResult.deletedCount || 0,
    };
  }

  async deleteArena(arenaId) {
    ensureObjectId(arenaId, "arenaId");
    const arena = await Arena.findById(arenaId).select({ _id: 1 });
    if (!arena) throw new Error("arena not found");
    const summary = await this.cascadeDeleteForArenaIds([arena._id], true);
    return { removedArenaId: arenaId, ...summary };
  }

  async deleteOwner(ownerId) {
    ensureObjectId(ownerId, "ownerId");
    const owner = await User.findById(ownerId);
    if (!owner || owner.role !== "owner") {
      throw new Error("owner not found");
    }

    const arenaDocs = await Arena.find({ owner: ownerId }).select({ _id: 1 });
    const arenaIds = arenaDocs.map((a) => a._id);
    const arenaSummary = await this.cascadeDeleteForArenaIds(arenaIds, true);

    const [bookingResult, reviewResult, registrationResult, ownerDeleteResult] = await Promise.all([
      Booking.deleteMany({ user: ownerId }),
      Review.deleteMany({ user: ownerId }),
      EventRegistration.deleteMany({ user: ownerId }),
      User.deleteOne({ _id: ownerId }),
    ]);

    return {
      removedOwnerId: ownerId,
      ...arenaSummary,
      removedOwnerBookings: bookingResult.deletedCount || 0,
      removedOwnerReviews: reviewResult.deletedCount || 0,
      removedOwnerEventRegistrations: registrationResult.deletedCount || 0,
      removedOwners: ownerDeleteResult.deletedCount || 0,
    };
  }

  async analyticsOverview({ from, to }) {
    if (!from || !to) {
      throw new Error("from and to query params are required");
    }
    const { fromDate, toDate } = toUtcDateRange(from, to);

    const now = new Date();
    const todayStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0)
    );
    const todayEnd = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999)
    );

    const bookingRange = { date: { $gte: fromDate, $lte: toDate } };

    const [
      totalUsers,
      activeUsers,
      disabledUsers,
      totalOwners,
      activeOwners,
      disabledOwners,
      totalArenas,
      activeArenas,
      disabledArenas,
      totalCourts,
      activeCourts,
      disabledCourts,
      totalBookings,
      completedBookings,
      confirmedBookings,
      cancelledBookings,
      bookingsToday,
    ] = await Promise.all([
      User.countDocuments({ role: "player" }),
      User.countDocuments({ role: "player", disabled: { $ne: true } }),
      User.countDocuments({ role: "player", disabled: true }),
      User.countDocuments({ role: "owner" }),
      User.countDocuments({ role: "owner", disabled: { $ne: true } }),
      User.countDocuments({ role: "owner", disabled: true }),
      Arena.countDocuments({}),
      Arena.countDocuments({ isAvailable: true }),
      Arena.countDocuments({ isAvailable: false }),
      Court.countDocuments({}),
      Court.countDocuments({ isActive: true }),
      Court.countDocuments({ isActive: false }),
      Booking.countDocuments(bookingRange),
      Booking.countDocuments({ ...bookingRange, status: "completed" }),
      Booking.countDocuments({ ...bookingRange, status: "confirmed" }),
      Booking.countDocuments({ ...bookingRange, status: "cancelled" }),
      Booking.countDocuments({ date: { $gte: todayStart, $lte: todayEnd } }),
    ]);

    const [revenueTotalAgg] = await Booking.aggregate([
      { $match: { ...bookingRange, status: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$price" }, count: { $sum: 1 } } },
    ]);
    const [revenueCompletedAgg] = await Booking.aggregate([
      { $match: { ...bookingRange, status: "completed" } },
      { $group: { _id: null, total: { $sum: "$price" } } },
    ]);
    const [topArenaAgg] = await Booking.aggregate([
      { $match: { ...bookingRange, status: "completed" } },
      { $group: { _id: "$arena", revenue: { $sum: "$price" } } },
      { $sort: { revenue: -1 } },
      { $limit: 1 },
      {
        $lookup: {
          from: "arenas",
          localField: "_id",
          foreignField: "_id",
          as: "arena",
        },
      },
      {
        $unwind: {
          path: "$arena",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);

    const revenueTotal = Number(revenueTotalAgg?.total || 0);
    const revenueCompleted = Number(revenueCompletedAgg?.total || 0);
    const avgBookingValue =
      revenueTotalAgg && Number(revenueTotalAgg.count) > 0
        ? revenueTotal / Number(revenueTotalAgg.count)
        : 0;

    return {
      totalUsers,
      activeUsers,
      disabledUsers,
      totalOwners,
      activeOwners,
      disabledOwners,
      totalArenas,
      activeArenas,
      disabledArenas,
      totalCourts,
      activeCourts,
      disabledCourts,
      totalBookings,
      completedBookings,
      confirmedBookings,
      cancelledBookings,
      bookingsToday,
      revenueTotal,
      revenueCompleted,
      avgBookingValue,
      topArena: topArenaAgg
        ? {
            id: topArenaAgg.arena ? String(topArenaAgg.arena._id) : String(topArenaAgg._id),
            name: topArenaAgg.arena ? topArenaAgg.arena.name : null,
            revenue: Number(topArenaAgg.revenue || 0),
          }
        : null,
    };
  }
}

module.exports = {
  AdminService,
  parseDisabledPatch,
  parseCascadeFlag,
};
