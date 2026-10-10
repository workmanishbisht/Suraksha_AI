
const express = require("express");

const { getAuditLogs } = require("../controllers/auditController");
const { protect } = require("../middleware/authMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");

const router = express.Router();

/* =========================================
   AUDIT LOG ROUTES
========================================= */

// Get audit logs - protected by RBAC
router.get(
    "/",
    protect,
    permissionMiddleware("permissions.read"),
    getAuditLogs
);

module.exports = router;
