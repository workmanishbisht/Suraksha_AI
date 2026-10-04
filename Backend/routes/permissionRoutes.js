const express = require("express");

const {
    getPermissions,
} = require("../controllers/permissionController");

const { protect } = require("../middleware/authMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");

const router = express.Router();

/* =========================================
   PERMISSION ROUTES
========================================= */

// Get all permissions
router.get(
    "/",
    protect,
    permissionMiddleware("permissions.read"),
    getPermissions
);

module.exports = router;