const express = require("express");

const {
    getCitizens,
    getCitizenStats,
    getCitizenById,
    updateCitizenStatus,
} = require("../controllers/citizenController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
    "/",
    protect,
    getCitizens
);

router.get(
    "/stats",
    protect,
    getCitizenStats
);

router.get(
    "/:id",
    protect,
    getCitizenById
);

router.patch(
    "/:id/status",
    protect,
    updateCitizenStatus
);

module.exports = router;