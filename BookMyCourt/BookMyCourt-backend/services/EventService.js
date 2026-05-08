const EventRepository = require("../repositories/EventRepository");
const EventRegistrationRepository = require("../repositories/EventRegistrationRepository");

class EventService {
  constructor(eventRepo = EventRepository, registrationRepo = EventRegistrationRepository) {
    this.eventRepo = eventRepo;
    this.registrationRepo = registrationRepo;
  }

  async register(userId, eventId) {
    const event = await this.eventRepo.findPublishedById(eventId);
    if (!event) {
      throw new Error("Event not found or not available for registration");
    }

    const now = new Date();
    if (event.endsAt < now) {
      throw new Error("Event has ended");
    }

    const existing = await this.registrationRepo.findByUserAndEvent(userId, eventId);
    if (existing) {
      throw new Error("Already registered for this event");
    }

    const registeredCount = await this.registrationRepo.countByEvent(eventId);
    if (event.spots != null && Number.isFinite(Number(event.spots))) {
      const cap = Number(event.spots);
      if (cap <= 0) {
        throw new Error("Event has no available spots");
      }
      if (registeredCount >= cap) {
        throw new Error("Event is full");
      }
    }

    let registration;
    try {
      registration = await this.registrationRepo.create({
        user: userId,
        event: eventId,
      });
    } catch (e) {
      if (e.code === 11000) {
        throw new Error("Already registered for this event");
      }
      throw e;
    }

    return {
      registration,
      registeredCount: registeredCount + 1,
      eventId: String(event._id),
      title: event.title,
    };
  }

  async unregister(userId, eventId) {
    const removed = await this.registrationRepo.deleteByUserAndEvent(userId, eventId);
    if (!removed) {
      throw new Error("You are not registered for this event");
    }

    const registeredCount = await this.registrationRepo.countByEvent(eventId);
    const event = await this.eventRepo.findById(eventId);

    return {
      cancelled: true,
      registeredCount,
      eventId: String(eventId),
      title: event ? event.title : undefined,
    };
  }
}

module.exports = EventService;
