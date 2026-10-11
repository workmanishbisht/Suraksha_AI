
const SystemSetting = require("../models/SystemSetting");

const DEFAULT_SETTINGS = {
    general: {
        systemName: "SurakshaAI",
        organization: "Disaster Management Authority",
        supportEmail: "support@surakshaai.com",
        timezone: "Asia/Kolkata",
        language: "English",
    },
    security: {
        sessionTimeout: 30,
        maxLoginAttempts: 5,
        twoFactorEnabled: false,
    },
    notifications: {
        emailNotifications: true,
        incidentAlerts: true,
        criticalAlerts: true,
        officerUpdates: true,
        weeklyReports: false,
    },
    preferences: {
        compactSidebar: false,
    },
};

const getSettings = async (req, res) => {
    try {
        let settings = await SystemSetting.findOne({ key: "global" });

        if (!settings) {
            settings = await SystemSetting.create({
                key: "global",
                updatedBy: req.user?._id || null,
            });
        }

        return res.status(200).json({
            success: true,
            settings,
        });
    } catch (error) {
        console.error("Get Settings Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch system settings",
        });
    }
};

const updateSettings = async (req, res) => {
    try {
        const allowedSections = [
            "general",
            "security",
            "notifications",
            "preferences",
        ];

        const body = req.body;

        if (
            !body ||
            typeof body !== "object" ||
            Array.isArray(body) ||
            !Object.keys(body).length
        ) {
            return res.status(400).json({
                success: false,
                message: "Provide settings to update",
            });
        }

        const unknownSections = Object.keys(body).filter(
            (key) => !allowedSections.includes(key)
        );

        if (unknownSections.length) {
            return res.status(400).json({
                success: false,
                message: `Unknown settings section: ${unknownSections.join(", ")}`,
            });
        }

        let settings = await SystemSetting.findOne({ key: "global" });

        if (!settings) {
            settings = new SystemSetting({ key: "global" });
        }

        const allowedFields = {
            general: [
                "systemName",
                "organization",
                "supportEmail",
                "timezone",
                "language",
            ],
            security: [
                "sessionTimeout",
                "maxLoginAttempts",
                "twoFactorEnabled",
            ],
            notifications: [
                "emailNotifications",
                "incidentAlerts",
                "criticalAlerts",
                "officerUpdates",
                "weeklyReports",
            ],
            preferences: ["compactSidebar"],
        };

        const allowedTimezones = [
            "Asia/Kolkata",
            "UTC",
            "Asia/Dubai",
            "Europe/London",
        ];

        for (const [section, values] of Object.entries(body)) {
            if (
                !values ||
                typeof values !== "object" ||
                Array.isArray(values)
            ) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid ${section} settings`,
                });
            }

            for (const [field, value] of Object.entries(values)) {
                if (!allowedFields[section].includes(field)) {
                    return res.status(400).json({
                        success: false,
                        message: `Unknown setting: ${section}.${field}`,
                    });
                }

                if (section === "general") {
                    if (["systemName", "organization"].includes(field)) {
                        if (typeof value !== "string" || !value.trim()) {
                            return res.status(400).json({
                                success: false,
                                message: `${field} is required`,
                            });
                        }
                    }

                    if (field === "supportEmail") {
                        if (
                            typeof value !== "string" ||
                            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
                        ) {
                            return res.status(400).json({
                                success: false,
                                message: "Enter a valid support email",
                            });
                        }
                    }

                    if (
                        field === "timezone" &&
                        !allowedTimezones.includes(value)
                    ) {
                        return res.status(400).json({
                            success: false,
                            message: "Invalid timezone",
                        });
                    }

                    if (
                        field === "language" &&
                        !["English", "Hindi"].includes(value)
                    ) {
                        return res.status(400).json({
                            success: false,
                            message: "Invalid language",
                        });
                    }
                }

                if (section === "security") {
                    if (field === "sessionTimeout") {
                        if (
                            !Number.isInteger(value) ||
                            value < 5 ||
                            value > 1440
                        ) {
                            return res.status(400).json({
                                success: false,
                                message: "Session timeout must be 5–1440 minutes",
                            });
                        }
                    }

                    if (field === "maxLoginAttempts") {
                        if (
                            !Number.isInteger(value) ||
                            value < 3 ||
                            value > 10
                        ) {
                            return res.status(400).json({
                                success: false,
                                message: "Login attempts must be between 3 and 10",
                            });
                        }
                    }

                    if (
                        field === "twoFactorEnabled" &&
                        typeof value !== "boolean"
                    ) {
                        return res.status(400).json({
                            success: false,
                            message: "twoFactorEnabled must be a boolean",
                        });
                    }
                }

                if (
                    ["notifications", "preferences"].includes(section) &&
                    typeof value !== "boolean"
                ) {
                    return res.status(400).json({
                        success: false,
                        message: `${section}.${field} must be a boolean`,
                    });
                }

                settings.set(`${section}.${field}`, value);
            }
        }

        settings.updatedBy = req.user?._id || null;

        await settings.save();

        return res.status(200).json({
            success: true,
            message: "System settings updated successfully",
            settings,
        });
    } catch (error) {
        console.error("Update Settings Error:", error);

        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: "Settings validation failed",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Unable to update system settings",
        });
    }
};

const resetSettings = async (req, res) => {
    try {
        let settings = await SystemSetting.findOne({ key: "global" });

        if (!settings) {
            settings = new SystemSetting({ key: "global" });
        }

        settings.general = DEFAULT_SETTINGS.general;
        settings.security = DEFAULT_SETTINGS.security;
        settings.notifications = DEFAULT_SETTINGS.notifications;
        settings.preferences = DEFAULT_SETTINGS.preferences;
        settings.updatedBy = req.user?._id || null;

        await settings.save();

        return res.status(200).json({
            success: true,
            message: "System settings reset to defaults",
            settings,
        });
    } catch (error) {
        console.error("Reset Settings Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to reset system settings",
        });
    }
};

module.exports = {
    getSettings,
    updateSettings,
    resetSettings,
};
