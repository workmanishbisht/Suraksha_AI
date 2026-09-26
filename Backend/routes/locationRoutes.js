const express = require("express");

const {
    getMyLocation,
    searchLocation,
    saveLocation,
    detectLocation,
} = require("../controllers/locationController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/me", protect, getMyLocation);
router.get("/search", protect, searchLocation);
router.put("/", protect, saveLocation);
router.post("/detect", protect, detectLocation);

module.exports = router;
