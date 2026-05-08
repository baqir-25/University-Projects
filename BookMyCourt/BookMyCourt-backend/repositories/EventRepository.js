const Event = require("../models/Event");
const BaseRepository = require("./BaseRepository");

class EventRepository extends BaseRepository {
  constructor() {
    super(Event);
  }

  async findPublished(query = {}) {
    const filter = { status: "published" };
    if (query.location) {
      filter.location = new RegExp(query.location, "i");
    }
    return await this.model.find(filter).sort({ startsAt: 1 }).populate("arena", "name location");
  }

  async findPublishedById(eventId) {
    return await this.model.findOne({ _id: eventId, status: "published" });
  }

  async findByArenaDashboard(arenaId) {
    return await this.model
      .find({ arena: arenaId, status: { $ne: "cancelled" } })
      .sort({ startsAt: 1 })
      .lean();
  }

  async findByIdAndArena(eventId, arenaId) {
    return await this.model.findOne({ _id: eventId, arena: arenaId });
  }

  async cancelById(eventId) {
    return await this.model.findByIdAndUpdate(
      eventId,
      { status: "cancelled" },
      { new: true, runValidators: true }
    );
  }
}

module.exports = new EventRepository();
