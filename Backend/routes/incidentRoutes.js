const express = require("express");

const {
    getIncidents,
    getIncidentById,
    createIncident,
    updateIncident,
    deleteIncident,
} = require("../controllers/incidentController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

/* =========================================
   INCIDENT ROUTES
========================================= */

// Get all incidents
router.get("/", protect, getIncidents);

// Get single incident
router.get("/:id", protect, getIncidentById);

// Create incident
router.post("/", protect, createIncident);

// Update incident
router.put("/:id", protect, updateIncident);

// Delete incident
router.delete("/:id", protect, deleteIncident);

module.exports = router;