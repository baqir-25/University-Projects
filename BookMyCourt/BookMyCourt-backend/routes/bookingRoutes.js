const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, (req, res) => bookingController.create(req, res));
router.get("/", protect, (req, res) => bookingController.getMyBookings(req, res));
module.exports = router;