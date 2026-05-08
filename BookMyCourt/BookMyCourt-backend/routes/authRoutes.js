const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require("../middleware/authMiddleware");

router.post('/register', (req, res) => authController.register(req, res));
router.post('/login', (req, res) => authController.login(req, res));
router.post("/logout", protect, (req, res) => authController.logout(req, res));

module.exports = router;