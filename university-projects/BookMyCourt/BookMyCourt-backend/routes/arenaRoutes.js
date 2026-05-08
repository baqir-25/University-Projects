const express = require('express');
const router = express.Router();
const arenaController = require('../controllers/arenaController');
const reviewController = require("../controllers/reviewController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/discover", (req, res) => arenaController.getArenasDiscover(req, res));
router.post("/:id/deals", protect, authorize("owner"), (req, res) =>
  arenaController.createDeal(req, res)
);
router.post("/:id/courts", protect, authorize("owner"), (req, res) =>
  arenaController.createCourt(req, res)
);
router.get("/:id/reviews", (req, res) => reviewController.listByArena(req, res));
router.post("/:id/reviews", protect, (req, res) => reviewController.create(req, res));

router.post("/", protect, authorize("owner"), (req, res) => arenaController.createArena(req, res));

module.exports = router;