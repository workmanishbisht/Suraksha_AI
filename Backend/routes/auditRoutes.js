
const express = require("express");

const {
    getAuditLogs,
    getMyRecentActivity,
} = require("../controllers/auditController");

const { protect } = require("../middleware/authMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");

const router = express.Router();

/* =========================================
   MY RECENT ACTIVITY
   Authenticated user: own activity only
========================================= */

router.get(
    "/my-activity",
    protect,
    getMyRecentActivity
);

/* =========================================
   AUDIT LOG ROUTES
   Protected by RBAC
========================================= */

router.get(
    "/",
    protect,
    permissionMiddleware("permissions.read"),
    getAuditLogs
);

module.exports = router;
