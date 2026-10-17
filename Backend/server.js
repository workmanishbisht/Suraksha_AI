
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/* =========================================
   ROUTES
========================================= */

const authRoutes = require("./routes/authRoutes");
const twoFactorRoutes = require("./routes/twoFactorRoutes");

const locationRoutes = require("./routes/locationRoutes");
const weatherRoutes = require("./routes/weatherRoutes");

const incidentRoutes = require("./routes/incidentRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

const citizenRoutes = require("./routes/citizenRoutes");
const fieldOfficerRoutes = require("./routes/fieldOfficerRoutes");

const emergencyResourceRoutes = require("./routes/emergencyResourceRoutes");
const reportRoutes = require("./routes/reportRoutes");

const profileRoutes = require("./routes/profileRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const userRoutes = require("./routes/userRoutes");
const roleRoutes = require("./routes/roleRoutes");
const permissionRoutes = require("./routes/permissionRoutes");

const auditRoutes = require("./routes/auditRoutes");
const systemSettingRoutes = require("./routes/systemSettingRoutes");

/* =========================================
   DATABASE
========================================= */

connectDB();

/* =========================================
   MIDDLEWARE
========================================= */

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* =========================================
   HEALTH CHECK
========================================= */

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "SurakshaAI Backend API is running",
    });
});

/* =========================================
   AUTHENTICATION
========================================= */

app.use("/api/auth", authRoutes);
app.use("/api/2fa", twoFactorRoutes);

/* =========================================
   LOCATION & WEATHER
========================================= */

app.use("/api/location", locationRoutes);
app.use("/api/weather", weatherRoutes);

/* =========================================
   INCIDENTS & ANALYTICS
========================================= */

app.use("/api/incidents", incidentRoutes);
app.use("/api/analytics", analyticsRoutes);

/* =========================================
   CITIZENS & FIELD OFFICERS
========================================= */

app.use("/api/citizens", citizenRoutes);
app.use("/api/field-officers", fieldOfficerRoutes);

/* =========================================
   EMERGENCY RESOURCES & REPORTS
========================================= */

app.use("/api/emergency-resources", emergencyResourceRoutes);
app.use("/api/reports", reportRoutes);

/* =========================================
   PROFILE & COMMUNICATION
========================================= */

app.use("/api/profile", profileRoutes);
app.use("/api/announcements", announcementRoutes);

/* =========================================
   NOTIFICATIONS
========================================= */

// IMPORTANT: Protect these routes with your existing
// authentication middleware before using them.
app.use("/api/notifications", notificationRoutes);

/* =========================================
   USERS, ROLES & PERMISSIONS
========================================= */

app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/permissions", permissionRoutes);

/* =========================================
   AUDIT LOGS
========================================= */

app.use("/api/audit-logs", auditRoutes);

/* =========================================
   SYSTEM SETTINGS
========================================= */

app.use("/api/system-settings", systemSettingRoutes);

/* =========================================
   404 HANDLER
========================================= */

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
});

/* =========================================
   GLOBAL ERROR HANDLER
========================================= */

app.use((error, req, res, next) => {
    console.error("Server Error:", error);

    if (res.headersSent) {
        return next(error);
    }

    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal server error",
    });
});

/* =========================================
   START SERVER
========================================= */

app.listen(PORT, () => {
    console.log(
        `SurakshaAI Backend running on http://localhost:${PORT}`
    );
});
