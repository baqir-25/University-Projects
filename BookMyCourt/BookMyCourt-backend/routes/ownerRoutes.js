const express = require("express");
const router = express.Router();
const arenaController = require("../controllers/arenaController");
const bookingController = require("../controllers/bookingController");
const ownerController = require("../controllers/ownerController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect, authorize("owner"));

router.get("/arenas", (req, res) => ownerController.getHomeArenas(req, res));
router.get("/arenas/:arenaId/bookings", (req, res) =>
  bookingController.listByArenaForOwner(req, res)
);

router.get("/arenas/:id", (req, res) => ownerController.getHomeArenaById(req, res));
router.patch("/arenas/:id", (req, res) => arenaController.ownerUpdateArena(req, res));

router.patch("/courts/:courtId", (req, res) => ownerController.patchCourt(req, res));

router.post("/arenas/:arenaId/events", (req, res) => ownerController.createEvent(req, res));
router.delete("/arenas/:arenaId/events/:eventId", (req, res) =>
  ownerController.deleteEvent(req, res)
);

router.patch("/arenas/:arenaId/bookings/:bookingId", (req, res) => {
  req.params.id = req.params.bookingId;
  return bookingController.ownerUpdateStatus(req, res);
});
router.patch("/bookings/:bookingId", (req, res) => {
  req.params.id = req.params.bookingId;
  return bookingController.ownerUpdateStatus(req, res);
});

module.exports = router;
