const express = require("express");

const {
    registerUser,
    loginUser,
    verifyTwoFactorLogin,
    getCurrentUser,
    logoutUser,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

/* REGISTER */
router.post(
    "/register",
    registerUser
);

/* LOGIN */
router.post(
    "/login",
    loginUser
);

/* VERIFY 2FA LOGIN */
router.post(
    "/verify-2fa",
    verifyTwoFactorLogin
);

/* CURRENT USER */
router.get(
    "/me",
    protect,
    getCurrentUser
);

/* LOGOUT */
router.post(
    "/logout",
    logoutUser
);

module.exports = router;