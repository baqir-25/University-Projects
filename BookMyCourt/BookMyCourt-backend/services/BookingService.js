const { normalizeBookingDate, isValidDailySlot } = require('../config/slotConfig');

class BookingService {
  constructor(bookingRepo, courtRepo, arenaRepo) {
    this.bookingRepo = bookingRepo;
    this.courtRepo = courtRepo;
    this.arenaRepo = arenaRepo;
  }

  async placeBooking(bookingData) {
    const date = normalizeBookingDate(bookingData.date);
    if (!date) throw new Error('Invalid booking date');
    if (!isValidDailySlot(bookingData.timeSlot)) throw new Error('Invalid time slot');
    const arena = await this.arenaRepo.findById(bookingData.arena);
    if (!arena) throw new Error("Arena not found");
    const price = Number(arena.pricePerSlot);
    if (!Number.isFinite(price) || price < 0) {
      throw new Error("Arena has invalid pricePerSlot");
    }

    const courts = await this.courtRepo.findByArenaId(bookingData.arena);
    let courtId = bookingData.court;

    if (courts.length > 0) {
      if (!courtId) throw new Error('Court is required for this arena');
      const courtDoc = await this.courtRepo.findByIdAndArena(courtId, bookingData.arena);
      if (!courtDoc || courtDoc.isActive === false) throw new Error('Invalid or inactive court');
    } else {
      courtId = undefined;
    }

    const payload = {
      user: bookingData.user,
      arena: bookingData.arena,
      date,
      timeSlot: bookingData.timeSlot,
      price,
    };
    if (courtId) payload.court = courtId;

    const conflict =
      courts.length > 0
        ? await this.bookingRepo.checkConflict(bookingData.arena, date, bookingData.timeSlot, courtId)
        : await this.bookingRepo.findOccupyingAtArenaSlot(bookingData.arena, date, bookingData.timeSlot);

    if (conflict) throw new Error("Slot already booked");

    return await this.bookingRepo.create(payload);
  }

  async getUserBookings(userId) {
    return await this.bookingRepo.findByUserId(userId);
  }

  async getUserBookingsByStatus(userId, status) {
    return await this.bookingRepo.findByUserIdAndStatus(userId, status);
  }

  /** Date-based lists for the player app: `upcoming` | `past` (UTC day boundary). */
  async getUserBookingsByScope(userId, scope) {
    const today = normalizeBookingDate(new Date());
    if (!today) throw new Error("Unable to resolve today's date");
    if (scope === "upcoming") {
      return await this.bookingRepo.findByUserUpcomingFrom(userId, today);
    }
    if (scope === "past") {
      return await this.bookingRepo.findByUserPastBefore(userId, today);
    }
    throw new Error("scope must be 'upcoming' or 'past'");
  }

  async ownerUpdateBookingStatus(ownerId, bookingId, status) {
    if (!["cancelled", "completed"].includes(status)) {
      throw new Error("Invalid booking status");
    }

    const booking = await this.bookingRepo.findByIdWithArena(bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    if (!booking.arena || String(booking.arena.owner) !== String(ownerId)) {
      throw new Error("Not authorized to update this booking");
    }

    return await this.bookingRepo.updateById(bookingId, { status });
  }
}
module.exports = BookingService;
