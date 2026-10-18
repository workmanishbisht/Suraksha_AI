
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
    getNearbyPlaces,
    createNearbyPlace,
    getLiveNearbyPlaces,
} = require("../controllers/nearbyPlaceController");

// Existing MongoDB APIs
router.get("/", protect, getNearbyPlaces);
router.post("/", protect, createNearbyPlace);

// Geoapify live nearby search
router.get("/live", protect, getLiveNearbyPlaces);

module.exports = router;
