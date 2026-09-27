const express = require("express");

const {
    getTwoFactorStatus,
    setupTwoFactor,
    verifyTwoFactorSetup,
    disableTwoFactor,
} = require("../controllers/twoFactorController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

/* GET 2FA STATUS */
router.get("/status", protect, getTwoFactorStatus);

/* SETUP 2FA */
router.post("/setup", protect, setupTwoFactor);

/* VERIFY 2FA */
router.post("/verify", protect, verifyTwoFactorSetup);

/* DISABLE 2FA */
router.post("/disable", protect, disableTwoFactor);

module.exports = router;