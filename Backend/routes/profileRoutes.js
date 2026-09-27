const express = require("express");

const {
    getProfile,
    updateProfile,
    changePassword,
} = require("../controllers/profileController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

/* =========================================
   PROFILE
========================================= */

router.get("/", protect, getProfile);

router.put("/", protect, updateProfile);

/* =========================================
   PASSWORD
========================================= */

router.post(
    "/change-password",
    protect,
    changePassword
);

module.exports = router;