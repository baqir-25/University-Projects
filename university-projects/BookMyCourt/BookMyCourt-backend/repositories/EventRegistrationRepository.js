const EventRegistration = require("../models/EventRegistration");
const BaseRepository = require("./BaseRepository");

class EventRegistrationRepository extends BaseRepository {
  constructor() {
    super(EventRegistration);
  }

  async countByEvent(eventId) {
    return await this.model.countDocuments({ event: eventId });
  }

  async findByUserAndEvent(userId, eventId) {
    return await this.model.findOne({ user: userId, event: eventId });
  }

  async deleteByUserAndEvent(userId, eventId) {
    return await this.model.findOneAndDelete({ user: userId, event: eventId });
  }
}

module.exports = new EventRegistrationRepository();
