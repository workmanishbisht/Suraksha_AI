const express = require("express");

const {
    getReports,
    getReportStats,
    getReportById,
} = require("../controllers/reportController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Get all reports
router.get("/", protect, getReports);

// Get report statistics
router.get("/stats", protect, getReportStats);

// Get single report
router.get("/:id", protect, getReportById);

module.exports = router;