const ArenaRepository = require("../repositories/ArenaRepository");
const ReviewRepository = require("../repositories/ReviewRepository");
const ApiResponse = require("../utils/ApiResponse");

class ReviewController {
  async listByArena(req, res) {
    try {
      const arena = await ArenaRepository.findById(req.params.id);
      if (!arena) {
        return ApiResponse.error(res, { statusCode: 404, message: "Arena not found" });
      }
      const [reviews, stats] = await Promise.all([
        ReviewRepository.findByArena(req.params.id),
        ReviewRepository.aggregateStats(req.params.id),
      ]);
      return ApiResponse.success(res, {
        message: "Reviews fetched successfully",
        data: {
          reviews,
          aggregate: {
            averageRating: stats.averageRating ? Math.round(stats.averageRating * 10) / 10 : 0,
            count: stats.count || 0,
          },
        },
      });
    } catch (error) {
      return ApiResponse.error(res, { statusCode: 500, message: error.message });
    }
  }

  async create(req, res) {
    try {
      const arenaId = req.params.id;
      const arena = await ArenaRepository.findById(arenaId);
      if (!arena) {
        return ApiResponse.error(res, { statusCode: 404, message: "Arena not found" });
      }

      const { rating, comment, booking } = req.body;
      if (rating === undefined || rating === null) {
        return ApiResponse.error(res, { statusCode: 400, message: "rating is required" });
      }

      const review = await ReviewRepository.create({
        arena: arenaId,
        user: req.user.id,
        booking,
        rating: Number(rating),
        comment,
      });

      return ApiResponse.success(res, {
        statusCode: 201,
        message: "Review submitted successfully",
        data: review,
      });
    } catch (error) {
      if (error.code === 11000) {
        return ApiResponse.error(res, {
          statusCode: 409,
          message: "You have already reviewed this arena",
        });
      }
      return ApiResponse.error(res, { statusCode: 400, message: error.message });
    }
  }
}

module.exports = new ReviewController();
