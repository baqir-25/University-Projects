const ArenaRepository = require("../repositories/ArenaRepository");
const CourtRepository = require("../repositories/CourtRepository");
const BookingRepository = require("../repositories/BookingRepository");
const EventRepository = require("../repositories/EventRepository");
const OwnerHomeService = require("../services/OwnerHomeService");
const ApiResponse = require("../utils/ApiResponse");

const ownerHomeService = new OwnerHomeService(
  ArenaRepository,
  CourtRepository,
  BookingRepository,
  EventRepository
);

function mapOwnerHomeError(error) {
  const msg = error.message || "";
  if (
    msg === "Arena not found or not owned by user" ||
    msg === "Court not found" ||
    msg === "Event not found"
  ) {
    return { statusCode: 404, message: msg };
  }
  return { statusCode: 400, message: msg };
}

class OwnerController {
  async getHomeArenas(req, res) {
    try {
      const data = await ownerHomeService.getOwnerHome(req.user.id);
      return ApiResponse.success(res, {
        message: "Owner home arenas fetched successfully",
        data,
      });
    } catch (error) {
      const { statusCode, message } = mapOwnerHomeError(error);
      return ApiResponse.error(res, { statusCode, message });
    }
  }

  async getHomeArenaById(req, res) {
    try {
      const data = await ownerHomeService.getOwnerHomeArena(req.user.id, req.params.id);
      return ApiResponse.success(res, {
        message: "Owner home arena fetched successfully",
        data,
      });
    } catch (error) {
      const { statusCode, message } = mapOwnerHomeError(error);
      return ApiResponse.error(res, { statusCode, message });
    }
  }

  async patchCourt(req, res) {
    try {
      const data = await ownerHomeService.patchCourtForOwner(req.user.id, req.params.courtId, req.body);
      return ApiResponse.success(res, {
        message: "Court updated successfully",
        data,
      });
    } catch (error) {
      const { statusCode, message } = mapOwnerHomeError(error);
      return ApiResponse.error(res, { statusCode, message });
    }
  }

  async createEvent(req, res) {
    try {
      const data = await ownerHomeService.createEventForOwner(
        req.user.id,
        req.params.arenaId,
        req.body
      );
      return ApiResponse.success(res, {
        statusCode: 201,
        message: "Event created successfully",
        data,
      });
    } catch (error) {
      const { statusCode, message } = mapOwnerHomeError(error);
      return ApiResponse.error(res, { statusCode, message });
    }
  }

  async deleteEvent(req, res) {
    try {
      const data = await ownerHomeService.deleteEventForOwner(
        req.user.id,
        req.params.arenaId,
        req.params.eventId
      );
      return ApiResponse.success(res, {
        message: "Event removed successfully",
        data,
      });
    } catch (error) {
      const { statusCode, message } = mapOwnerHomeError(error);
      return ApiResponse.error(res, { statusCode, message });
    }
  }
}

module.exports = new OwnerController();
