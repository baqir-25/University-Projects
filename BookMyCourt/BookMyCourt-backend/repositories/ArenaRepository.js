const Arena = require('../models/Arena');
const BaseRepository = require('./BaseRepository');

class ArenaRepository extends BaseRepository {
  constructor() { super(Arena); }

  async findByCity(city) {
    return await this.model.find({ location: new RegExp(city, 'i') });
  }

  async findByOwnerId(ownerId) {
    return await this.model.find({ owner: ownerId }).populate("owner", "name email");
  }

  async findOwnedLeanByOwner(ownerId) {
    return await this.model.find({ owner: ownerId }).lean();
  }

  async findOwnedLeanByOwnerAndId(ownerId, arenaId) {
    return await this.model.findOne({ _id: arenaId, owner: ownerId }).lean();
  }

  async findByOwnerName(ownerName) {
    return await this.model
      .find()
      .populate({
        path: "owner",
        select: "name email",
        match: { name: new RegExp(ownerName, "i") },
      })
      .then((arenas) => arenas.filter((arena) => arena.owner));
  }

  async findByIdAndOwner(id, ownerId) {
    return await this.model.findOne({ _id: id, owner: ownerId });
  }

  /** Venues that are open (`isAvailable` not false). Optional `city` filters `location` (case-insensitive). */
  async findPublicLean(city) {
    const filter = { isAvailable: { $ne: false } };
    if (city != null && String(city).trim() !== "") {
      filter.location = new RegExp(String(city).trim(), "i");
    }
    return await this.model.find(filter).sort({ name: 1 }).lean();
  }
}
module.exports = new ArenaRepository();