const EventRepository = require("../repositories/EventRepository");
const EventService = require("../services/EventService");
const ApiResponse = require("../utils/ApiResponse");

const eventService = new EventService();

class EventController {
  async list(req, res) {
    try {
      const { location } = req.query;
      const events = await EventRepository.findPublished({ location });
      return ApiResponse.success(res, {
        message: "Events fetched successfully",
        data: events,
      });
    } catch (error) {
      return ApiResponse.error(res, { statusCode: 500, message: error.message });
    }
  }

  async register(req, res) {
    try {
      const result = await eventService.register(req.user.id, req.params.id);
      return ApiResponse.success(res, {
        statusCode: 201,
        message: "Registered for event successfully",
        data: {
          eventId: result.eventId,
          title: result.title,
          registrationId: String(result.registration._id),
          registeredCount: result.registeredCount,
        },
      });
    } catch (error) {
      const msg = error.message || "";
      let statusCode = 400;
      if (msg.includes("not found") || msg.includes("not available")) statusCode = 404;
      if (msg === "Already registered for this event") statusCode = 409;
      if (msg === "Event is full") statusCode = 409;
      return ApiResponse.error(res, { statusCode, message: msg });
    }
  }

  async unregister(req, res) {
    try {
      const result = await eventService.unregister(req.user.id, req.params.id);
      return ApiResponse.success(res, {
        message: "Registration cancelled",
        data: result,
      });
    } catch (error) {
      const msg = error.message || "";
      let statusCode = 400;
      if (msg.includes("not registered")) statusCode = 404;
      return ApiResponse.error(res, { statusCode, message: msg });
    }
  }
}

module.exports = new EventController();
