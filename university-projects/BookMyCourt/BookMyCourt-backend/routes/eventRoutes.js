const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", (req, res) => eventController.list(req, res));
router.post("/:eventId/register", protect, (req, res) => {
  req.params.id = req.params.eventId;
  return eventController.register(req, res);
});
router.delete("/:eventId/register", protect, (req, res) => {
  req.params.id = req.params.eventId;
  return eventController.unregister(req, res);
});

module.exports = router;
