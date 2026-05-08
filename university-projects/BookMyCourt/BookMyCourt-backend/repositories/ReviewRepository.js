const mongoose = require("mongoose");
const Review = require("../models/Review");
const BaseRepository = require("./BaseRepository");

class ReviewRepository extends BaseRepository {
  constructor() {
    super(Review);
  }

  async findByArena(arenaId) {
    return await this.model
      .find({ arena: arenaId })
      .populate("user", "name")
      .sort({ createdAt: -1 });
  }

  async aggregateStats(arenaId) {
    if (!mongoose.Types.ObjectId.isValid(arenaId)) {
      return { averageRating: 0, count: 0 };
    }
    const arenaObjectId = new mongoose.Types.ObjectId(arenaId);
    const stats = await this.model.aggregate([
      { $match: { arena: arenaObjectId } },
      {
        $group: {
          _id: "$arena",
          averageRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);
    return stats[0] || { averageRating: 0, count: 0 };
  }

  /** Map arena id string -> { averageRating (1 decimal), count } */
  async aggregateStatsForArenaIds(arenaIds) {
    const map = new Map();
    const oids = arenaIds.filter((id) => mongoose.Types.ObjectId.isValid(id)).map((id) => new mongoose.Types.ObjectId(id));
    if (!oids.length) return map;

    const rows = await this.model.aggregate([
      { $match: { arena: { $in: oids } } },
      {
        $group: {
          _id: "$arena",
          averageRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    for (const r of rows) {
      const avg = r.averageRating != null ? Math.round(Number(r.averageRating) * 10) / 10 : 0;
      map.set(String(r._id), { averageRating: avg, reviewCount: r.count || 0 });
    }
    return map;
  }
}

module.exports = new ReviewRepository();
