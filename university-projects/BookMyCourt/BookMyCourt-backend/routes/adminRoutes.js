const express = require("express");
const adminController = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/users", (req, res) => adminController.listUsers(req, res));
router.patch("/users/:userId", (req, res) => adminController.patchUser(req, res));
router.delete("/users/:userId", (req, res) => adminController.deleteUser(req, res));

router.get("/owners", (req, res) => adminController.listOwners(req, res));
router.patch("/owners/:ownerId", (req, res) => adminController.patchOwner(req, res));
router.delete("/owners/:ownerId", (req, res) => adminController.deleteOwner(req, res));

router.get("/arenas", (req, res) => adminController.listArenas(req, res));
router.patch("/arenas/:arenaId", (req, res) => adminController.patchArena(req, res));
router.delete("/arenas/:arenaId", (req, res) => adminController.deleteArena(req, res));

router.get("/courts", (req, res) => adminController.listCourts(req, res));
router.patch("/courts/:courtId", (req, res) => adminController.patchCourt(req, res));
router.delete("/courts/:courtId", (req, res) => adminController.deleteCourt(req, res));

router.get("/analytics/overview", (req, res) => adminController.analyticsOverview(req, res));

module.exports = router;
