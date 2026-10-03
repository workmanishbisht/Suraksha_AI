const express = require("express");

const {
    getAnnouncements,
    getAnnouncementStats,
    getAnnouncementById,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
} = require("../controllers/announcementController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getAnnouncements);

router.get(
    "/stats",
    protect,
    getAnnouncementStats
);

router.get(
    "/:id",
    protect,
    getAnnouncementById
);

router.post(
    "/",
    protect,
    createAnnouncement
);

router.patch(
    "/:id",
    protect,
    updateAnnouncement
);

router.delete(
    "/:id",
    protect,
    deleteAnnouncement
);

module.exports = router;