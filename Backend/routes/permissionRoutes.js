
const express = require("express");
const router = express.Router();

const {
    getPermissions,
} = require("../controllers/permissionController");

const { protect } = require("../middleware/authMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");

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
