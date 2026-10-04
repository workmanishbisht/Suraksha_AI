const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const locationRoutes = require("./routes/locationRoutes");
const weatherRoutes = require("./routes/weatherRoutes");
const incidentRoutes = require("./routes/incidentRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const citizenRoutes = require("./routes/citizenRoutes");
const fieldOfficerRoutes = require("./routes/fieldOfficerRoutes");
const emergencyResourceRoutes = require("./routes/emergencyResourceRoutes");
const reportRoutes = require("./routes/reportRoutes");
const profileRoutes = require("./routes/profileRoutes");
const twoFactorRoutes = require("./routes/twoFactorRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const userRoutes = require("./routes/userRoutes");
const roleRoutes = require("./routes/roleRoutes");
const permissionRoutes = require("./routes/permissionRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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
   API ROUTES
========================================= */

app.use("/api/auth", authRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/citizens", citizenRoutes);
app.use("/api/field-officers", fieldOfficerRoutes);
app.use("/api/emergency-resources", emergencyResourceRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/2fa", twoFactorRoutes);
app.use("/api/announcements", announcementRoutes);

/* =========================================
   USERS & ROLES
========================================= */

app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/permissions", permissionRoutes);

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

    res.status(error.statusCode || 500).json({
        success: false,
        message:
            error.message ||
            "Internal server error",
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