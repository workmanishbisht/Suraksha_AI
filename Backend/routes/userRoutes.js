const express = require("express");

const {
    getUsers,
    getUserStats,
    getUserById,
    updateUserRole,
    updateUserStatus,
    deleteUser,
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");

const router = express.Router();

/* =========================================
   USER ROUTES
========================================= */

// Get all users
router.get(
    "/",
    protect,
    permissionMiddleware("users.read"),
    getUsers
);

// Get user statistics
router.get(
    "/stats",
    protect,
    permissionMiddleware("users.read"),
    getUserStats
);

// Get user by ID
router.get(
    "/:id",
    protect,
    permissionMiddleware("users.read"),
    getUserById
);

// Update user role
router.patch(
    "/:id/role",
    protect,
    permissionMiddleware("roles.update"),
    updateUserRole
);

// Update user status
router.patch(
    "/:id/status",
    protect,
    permissionMiddleware("users.update"),
    updateUserStatus
);

// Delete user
router.delete(
    "/:id",
    protect,
    permissionMiddleware("users.delete"),
    deleteUser
);

module.exports = router;