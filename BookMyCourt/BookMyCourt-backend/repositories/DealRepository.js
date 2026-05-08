const Deal = require("../models/Deal");
const BaseRepository = require("./BaseRepository");

class DealRepository extends BaseRepository {
  constructor() {
    super(Deal);
  }

  async findActiveByArena(arenaId) {
    const now = new Date();
    return await this.model.find({
      arena: arenaId,
      isActive: true,
      startsAt: { $lte: now },
      endsAt: { $gte: now },
    });
  }

  /** Active deals in the current window across all arenas (for discovery). */
  async findAllActiveNow() {
    const now = new Date();
    return await this.model
      .find({
        isActive: true,
        startsAt: { $lte: now },
        endsAt: { $gte: now },
      })
      .populate("arena", "name location sport imageUrl")
      .sort({ endsAt: 1 });
  }
}

module.exports = new DealRepository();
