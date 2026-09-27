const express = require("express");

const {
    getEmergencyResources,
    getEmergencyResourceById,
    createEmergencyResource,
    updateEmergencyResource,
    deleteEmergencyResource,
    getEmergencyResourceStats,
} = require("../controllers/emergencyResourceController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

/* =========================================
   EMERGENCY RESOURCE ROUTES
========================================= */

router.get(
    "/",
    protect,
    getEmergencyResources
);

router.get(
    "/stats",
    protect,
    getEmergencyResourceStats
);

router.get(
    "/:id",
    protect,
    getEmergencyResourceById
);

router.post(
    "/",
    protect,
    createEmergencyResource
);

router.put(
    "/:id",
    protect,
    updateEmergencyResource
);

router.delete(
    "/:id",
    protect,
    deleteEmergencyResource
);

module.exports = router;