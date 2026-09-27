const express = require("express");

const { getAnalytics } = require("../controllers/analyticsController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

/* =========================================
   GET ADMIN ANALYTICS
========================================= */

router.get("/", protect, getAnalytics);

module.exports = router;