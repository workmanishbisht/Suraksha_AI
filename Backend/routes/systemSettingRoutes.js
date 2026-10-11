
const express = require("express");
const router = express.Router();

const {
    getSettings,
    updateSettings,
    resetSettings,
} = require("../controllers/systemSettingController");

const authModule = require("../middleware/authMiddleware");

/* =========================================
   AUTH MIDDLEWARE
========================================= */

// Supports: module.exports = protect
// Supports: module.exports = { protect }
// Supports: module.exports = { authMiddleware }
const protect =
    typeof authModule === "function"
        ? authModule
        : authModule?.protect || authModule?.authMiddleware;

if (typeof protect !== "function") {
    throw new Error(
        "authMiddleware must export a middleware function. Check middleware/authMiddleware.js"
    );
}

/* =========================================
   ADMIN AUTHORIZATION
========================================= */

const adminOnly = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required",
        });
    }

    if (String(req.user.role).toLowerCase() !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Admin access required",
        });
    }

    next();
};

/* =========================================
   AUTHENTICATION & AUTHORIZATION
========================================= */

router.use(protect);
router.use(adminOnly);

/* =========================================
   SYSTEM SETTINGS ROUTES
========================================= */

// GET /api/system-settings
router.get("/", getSettings);

// PATCH /api/system-settings
router.patch("/", updateSettings);

// POST /api/system-settings/reset
router.post("/reset", resetSettings);

module.exports = router;
