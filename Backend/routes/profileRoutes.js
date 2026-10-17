
const express = require("express");

const {
    getProfile,
    updateProfile,
    changePassword,
} = require("../controllers/profileController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

/* =========================================
   GET PROFILE
========================================= */

router.get("/", protect, getProfile);

/* =========================================
   UPDATE PROFILE
========================================= */

router.put("/", protect, updateProfile);

/* =========================================
   CHANGE PASSWORD
========================================= */

router.post("/change-password", protect, changePassword);

module.exports = router;
