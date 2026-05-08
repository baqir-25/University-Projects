const BookingRepository = require('../repositories/BookingRepository');
const CourtRepository = require("../repositories/CourtRepository");
const ArenaRepository = require("../repositories/ArenaRepository");
const BookingService = require('../services/BookingService');
const ApiResponse = require("../utils/ApiResponse");

const bookingService = new BookingService(BookingRepository, CourtRepository, ArenaRepository);

const BOOKING_STATUSES = ["confirmed", "cancelled", "completed"];

class BookingController {
  normalizeStatus(status) {
    if (!status) return null;
    const value = String(status).toLowerCase();
    if (value === "completed") return "completed";
    if (value === "cancelled") return "cancelled";
    if (value === "confirmed") return "confirmed";
    return value;
  }

  async create(req, res) {
    try {
      // req.user.id comes from authMiddleware
      const booking = await bookingService.placeBooking({ ...req.body, user: req.user.id });
      return ApiResponse.success(res, {
        statusCode: 201,
        message: "Booking created successfully",
        data: booking,
      });
    } catch (err) {
      return ApiResponse.error(res, { statusCode: 400, message: err.message });
    }
  }

  /** Owner-only: list bookings for an arena they own. */
  async listByArenaForOwner(req, res) {
    try {
      const { arenaId } = req.params;
      const arena = await ArenaRepository.findByIdAndOwner(arenaId, req.user.id);
      if (!arena) {
        return ApiResponse.error(res, {
          statusCode: 404,
          message: "Arena not found or not owned by user",
        });
      }

      const { date, status } = req.query;
      let statusFilter = null;
      if (status != null && String(status).trim() !== "") {
        const s = String(status).toLowerCase().trim();
        if (!BOOKING_STATUSES.includes(s)) {
          return ApiResponse.error(res, {
            statusCode: 400,
            message: "status must be one of: confirmed, cancelled, completed",
          });
        }
        statusFilter = s;
      }

      const bookings = await BookingRepository.findForArena(arenaId, {
        date,
        status: statusFilter,
      });

      return ApiResponse.success(res, {
        message: "Bookings fetched successfully",
        data: bookings,
      });
    } catch (err) {
      const statusCode = err.message && err.message.includes("Invalid date") ? 400 : 500;
      return ApiResponse.error(res, { statusCode, message: err.message });
    }
  }

  async getMyBookings(req, res) {
    try {
      const { status, scope } = req.query;

      let timeline =
        scope === "upcoming" || scope === "past"
          ? scope
          : null;
      if (!timeline && status != null) {
        const s = String(status).toLowerCase();
        if (s === "upcoming" || s === "past") timeline = s;
      }

      if (timeline === "upcoming" || timeline === "past") {
        const history = await bookingService.getUserBookingsByScope(req.user.id, timeline);
        return ApiResponse.success(res, {
          statusCode: 200,
          message: "Bookings fetched successfully",
          data: history,
        });
      }

      const normalizedStatus = this.normalizeStatus(status);
      const history = normalizedStatus
        ? await bookingService.getUserBookingsByStatus(req.user.id, normalizedStatus)
        : await bookingService.getUserBookings(req.user.id);
      return ApiResponse.success(res, {
        statusCode: 200,
        message: "Bookings fetched successfully",
        data: history,
      });
    } catch (err) {
      const statusCode = err.message && err.message.includes("scope") ? 400 : 500;
      return ApiResponse.error(res, { statusCode, message: err.message });
    }
  }

  async ownerUpdateStatus(req, res) {
    try {
      const { status } = req.body;
      const booking = await bookingService.ownerUpdateBookingStatus(
        req.user.id,
        req.params.id,
        status
      );
      return ApiResponse.success(res, {
        message: "Booking status updated successfully",
        data: booking,
      });
    } catch (err) {
      let statusCode = 400;
      if (err.message === "Booking not found") statusCode = 404;
      if (err.message === "Not authorized to update this booking") statusCode = 403;
      return ApiResponse.error(res, { statusCode, message: err.message });
    }
  }
}
module.exports = new BookingController();