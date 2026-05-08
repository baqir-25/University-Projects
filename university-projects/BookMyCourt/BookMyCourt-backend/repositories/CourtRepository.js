const Court = require("../models/Court");
const BaseRepository = require("./BaseRepository");

class CourtRepository extends BaseRepository {
  constructor() {
    super(Court);
  }

  async findByArenaId(arenaId) {
    return await this.model
      .find({ arena: arenaId })
      .sort({ sortOrder: 1, name: 1 })
      .lean();
  }

  /** Courts visible to players for listing flows (`visible` not false). */
  async findPublicByArenaIds(arenaIds) {
    if (!arenaIds.length) return [];
    return await this.model
      .find({
        arena: { $in: arenaIds },
        visible: { $ne: false },
      })
      .sort({ sortOrder: 1, name: 1 })
      .lean();
  }

  async findByIdAndArena(courtId, arenaId) {
    return await this.model.findOne({ _id: courtId, arena: arenaId });
  }

  async findByIdWithArena(courtId) {
    return await this.model.findById(courtId).populate({
      path: "arena",
      select: "owner name sport",
    });
  }

  async countByArena(arenaId) {
    return await this.model.countDocuments({ arena: arenaId });
  }
}

module.exports = new CourtRepository();
