const express = require("express");
const router = express.Router();
const dealController = require("../controllers/dealController");

router.get("/", (req, res) => dealController.listAllActive(req, res));

module.exports = router;
