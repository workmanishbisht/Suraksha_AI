const express = require("express");

const {
    getIncidents,
    getIncidentById,
    createIncident,
    updateIncident,
    deleteIncident,
} = require("../controllers/incidentController");

const { protect } = require("../middleware/authMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");

const router = express.Router();

/* =========================================
   INCIDENT ROUTES
========================================= */

// Get incidents accessible to the current user
router.get(
    "/",
    protect,
    permissionMiddleware("incidents.read"),
    getIncidents
);

// Get a single incident
router.get(
    "/:id",
    protect,
    permissionMiddleware("incidents.read"),
    getIncidentById
);

// Create an incident or citizen report
router.post(
    "/",
    protect,
    permissionMiddleware("incidents.create"),
    createIncident
);

// Update an incident
router.put(
    "/:id",
    protect,
    permissionMiddleware("incidents.update"),
    updateIncident
);

// Delete an incident
router.delete(
    "/:id",
    protect,
    permissionMiddleware("incidents.delete"),
    deleteIncident
);

module.exports = router;