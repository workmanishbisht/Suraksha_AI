
const express = require("express");

const {
    getEmergencyAlerts,
    getEmergencyAlertById,
    createEmergencyAlert,
    resolveEmergencyAlert,
    reactivateEmergencyAlert,
} = require("../controllers/emergencyAlertController");

const { protect } = require("../middleware/authMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");

const router = express.Router();

// All emergency alert routes require authentication.
router.use(protect);

// GET: Fetch emergency alerts visible to the logged-in user's role.
router.get(
    "/",
    permissionMiddleware("emergencyAlerts.read"),
    getEmergencyAlerts
);

// GET: Fetch a single emergency alert.
router.get(
    "/:id",
    permissionMiddleware("emergencyAlerts.read"),
    getEmergencyAlertById
);

// POST: Create an emergency alert (authorized roles only).
router.post(
    "/",
    permissionMiddleware("emergencyAlerts.create"),
    createEmergencyAlert
);

// PATCH: Mark an emergency alert as resolved.
router.patch(
    "/:id/resolve",
    permissionMiddleware("emergencyAlerts.update"),
    resolveEmergencyAlert
);

// PATCH: Reactivate a resolved emergency alert.
router.patch(
    "/:id/reactivate",
    permissionMiddleware("emergencyAlerts.update"),
    reactivateEmergencyAlert
);

module.exports = router;
