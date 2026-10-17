
const express = require("express");

const {
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
} = require("../controllers/notificationController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

/* =========================================
   GET ALL NOTIFICATIONS
========================================= */

router.get("/", protect, getNotifications);

/* =========================================
   MARK ALL AS READ
========================================= */

router.patch("/read-all", protect, markAllNotificationsRead);

/* =========================================
   MARK SINGLE NOTIFICATION AS READ
========================================= */

router.patch("/:id/read", protect, markNotificationRead);

module.exports = router;
