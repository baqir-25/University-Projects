const ArenaRepository = require('../repositories/ArenaRepository');
const CourtRepository = require("../repositories/CourtRepository");
const ReviewRepository = require("../repositories/ReviewRepository");
const BookingRepository = require("../repositories/BookingRepository");
const ArenaService = require('../services/ArenaService');
const PublicArenaService = require("../services/PublicArenaService");
const ApiResponse = require("../utils/ApiResponse");

const arenaService = new ArenaService(ArenaRepository, CourtRepository);
const publicArenaService = new PublicArenaService(
  ArenaRepository,
  CourtRepository,
  ReviewRepository,
  BookingRepository
);

class ArenaController {
  /** Full Home-style payload: ratings, sports, img, courts + bookedSlots (see PublicArenaService). */
  async getArenasDiscover(req, res) {
    try {
      const { city, date } = req.query;
      const data = await publicArenaService.listPublicArenas({ city, date });
      return ApiResponse.success(res, {
        message: "Arenas fetched successfully",
        data,
      });
    } catch (error) {
      const msg = error.message || "";
      const statusCode = msg.includes("Invalid date") ? 400 : 500;
      return ApiResponse.error(res, { statusCode, message: msg || "Failed to fetch arenas" });
    }
  }

  async createArena(req, res) {
    try {
      const arena = await arenaService.createArena(req.body);
      return ApiResponse.success(res, {
        statusCode: 201,
        message: "Arena created successfully",
        data: arena,
      });
    } catch (error) {
      return ApiResponse.error(res, { statusCode: 400, message: error.message });
    }
  }

  async ownerUpdateArena(req, res) {
    try {
      const arena = await arenaService.updateArenaByOwner(req.user.id, req.params.id, req.body);
      return ApiResponse.success(res, {
        message: "Arena updated successfully",
        data: arena,
      });
    } catch (error) {
      const statusCode = error.message === "Arena not found or not owned by user" ? 404 : 400;
      return ApiResponse.error(res, { statusCode, message: error.message });
    }
  }

  async createDeal(req, res) {
    try {
      const deal = await arenaService.createDealForOwner(req.user.id, req.params.id, req.body);
      return ApiResponse.success(res, {
        statusCode: 201,
        message: "Deal created successfully",
        data: deal,
      });
    } catch (error) {
      const statusCode =
        error.message === "Arena not found or not owned by user" ? 404 : 400;
      return ApiResponse.error(res, { statusCode, message: error.message });
    }
  }

  async createCourt(req, res) {
    try {
      const court = await arenaService.createCourtForOwner(req.user.id, req.params.id, req.body);
      return ApiResponse.success(res, {
        statusCode: 201,
        message: "Court created successfully",
        data: court,
      });
    } catch (error) {
      const statusCode =
        error.message === "Arena not found or not owned by user" ? 404 : 400;
      return ApiResponse.error(res, { statusCode, message: error.message });
    }
  }

}

module.exports = new ArenaController();