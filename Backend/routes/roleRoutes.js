const express = require("express");

const {
    getRoles,
    getRoleById,
    updateRolePermissions,
} = require("../controllers/roleController");

const { protect } = require("../middleware/authMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");

const router = express.Router();

/* =========================================
   ROLE ROUTES
========================================= */

// Get all roles
router.get(
    "/",
    protect,
    permissionMiddleware("roles.read"),
    getRoles
);

// Get role by ID
router.get(
    "/:id",
    protect,
    permissionMiddleware("roles.read"),
    getRoleById
);

// Update role permissions
router.patch(
    "/:id/permissions",
    protect,
    permissionMiddleware("permissions.update"),
    updateRolePermissions
);

module.exports = router;