
const mongoose = require("mongoose");
const EmergencyAlert = require("../models/EmergencyAlert");
const Notification = require("../models/Notification");
const User = require("../models/User");

// Validate MongoDB ObjectId
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Citizen visibility rules
const getAudienceFilter = (user) => {
    if (user?.role === "citizen") {
        return {
            targetAudience: {
                $in: ["All Citizens", "All Users"],
            },
        };
    }

    return {};
};

// GET: Fetch emergency alerts
const getEmergencyAlerts = async (req, res) => {
    try {
        const { severity, category, status, search } = req.query;

        const filter = {
            ...getAudienceFilter(req.user),
        };

        if (severity) {
            const allowed = ["Critical", "High", "Medium", "Low"];

            if (!allowed.includes(severity)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid severity.",
                });
            }

            filter.severity = severity;
        }

        if (category) {
            const allowed = [
                "Weather",
                "Flood",
                "Fire",
                "Traffic",
                "Safety",
                "Health",
                "Other",
            ];

            if (!allowed.includes(category)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid alert category.",
                });
            }

            filter.category = category;
        }

        if (status) {
            const allowed = ["Active", "Resolved"];

            if (!allowed.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid alert status.",
                });
            }

            filter.status = status;
        }

        if (search?.trim()) {
            const escapedSearch = search
                .trim()
                .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

            filter.$or = [
                { title: { $regex: escapedSearch, $options: "i" } },
                {
                    description: {
                        $regex: escapedSearch,
                        $options: "i",
                    },
                },
                { location: { $regex: escapedSearch, $options: "i" } },
            ];
        }

        const alerts = await EmergencyAlert.find(filter)
            .sort({ createdAt: -1 })
            .limit(100)
            .populate("createdBy", "name email")
            .lean();

        return res.status(200).json({
            success: true,
            count: alerts.length,
            alerts,
        });
    } catch (error) {
        console.error("Get Emergency Alerts Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch emergency alerts.",
        });
    }
};

// GET: Fetch a single emergency alert
const getEmergencyAlertById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid emergency alert ID.",
            });
        }

        const filter = {
            _id: id,
            ...getAudienceFilter(req.user),
        };

        const alert = await EmergencyAlert.findOne(filter)
            .populate("createdBy", "name email")
            .lean();

        if (!alert) {
            return res.status(404).json({
                success: false,
                message: "Emergency alert not found.",
            });
        }

        return res.status(200).json({
            success: true,
            alert,
        });
    } catch (error) {
        console.error("Get Emergency Alert Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch emergency alert.",
        });
    }
};

// POST: Create an emergency alert
const createEmergencyAlert = async (req, res) => {
    try {
        const {
            title,
            description,
            severity,
            category,
            location,
            targetAudience,
        } = req.body;

        if (
            typeof title !== "string" ||
            !title.trim() ||
            typeof description !== "string" ||
            !description.trim() ||
            typeof location !== "string" ||
            !location.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Title, description and location are required.",
            });
        }

        if (
            title.trim().length > 150 ||
            description.trim().length > 5000
        ) {
            return res.status(400).json({
                success: false,
                message: "Title or description exceeds the allowed length.",
            });
        }

        const allowedSeverities = [
            "Critical",
            "High",
            "Medium",
            "Low",
        ];

        const allowedCategories = [
            "Weather",
            "Flood",
            "Fire",
            "Traffic",
            "Safety",
            "Health",
            "Other",
        ];

        const allowedAudiences = [
            "All Citizens",
            "All Users",
        ];

        if (
            severity !== undefined &&
            !allowedSeverities.includes(severity)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid severity.",
            });
        }

        if (
            category !== undefined &&
            !allowedCategories.includes(category)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid alert category.",
            });
        }

        if (
            targetAudience !== undefined &&
            !allowedAudiences.includes(targetAudience)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid target audience.",
            });
        }

        const creatorId = req.user?._id;

        if (!creatorId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
        }

        const alert = await EmergencyAlert.create({
            title: title.trim(),
            description: description.trim(),
            severity: severity || "Medium",
            category: category || "Other",
            location: location.trim(),
            targetAudience: targetAudience || "All Citizens",
            status: "Active",
            createdBy: creatorId,
        });

        // Find users who should receive the notification.
        // User roles are lowercase in the User model.
        const audienceFilter =
            alert.targetAudience === "All Citizens"
                ? { role: "citizen" }
                : {};

        const recipients = await User.find(audienceFilter)
            .select("_id")
            .lean();

        let notifiedCount = 0;
        let notificationWarning = null;

        // Keep the alert even if notification delivery fails.
        try {
            if (recipients.length > 0) {
                const notificationTitle =
                    `[${alert.severity}] ${alert.title}`;

                const notificationMessage =
                    `${alert.description} Location: ${alert.location}`;

                const result = await Notification.insertMany(
                    recipients.map((user) => ({
                        recipient: user._id,
                        title: notificationTitle,
                        message: notificationMessage,
                        type: "incident",
                        link: "/citizen/alerts",
                        isRead: false,
                    }))
                );

                notifiedCount = result.length;
            }
        } catch (notificationError) {
            console.error(
                "Emergency Alert Notification Error:",
                notificationError
            );

            notificationWarning =
                "Alert was created, but some notifications could not be sent.";
        }

        return res.status(201).json({
            success: true,
            message: "Emergency alert created successfully.",
            alert,
            notifiedCount,
            ...(notificationWarning && { notificationWarning }),
        });
    } catch (error) {
        console.error("Create Emergency Alert Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to create emergency alert.",
        });
    }
};

// PATCH: Resolve an emergency alert
const resolveEmergencyAlert = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid emergency alert ID.",
            });
        }

        const alert = await EmergencyAlert.findByIdAndUpdate(
            id,
            {
                $set: {
                    status: "Resolved",
                    resolvedAt: new Date(),
                },
            },
            {
                returnDocument: "after",
                runValidators: true,
            }
        );

        if (!alert) {
            return res.status(404).json({
                success: false,
                message: "Emergency alert not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Emergency alert resolved successfully.",
            alert,
        });
    } catch (error) {
        console.error("Resolve Emergency Alert Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to resolve emergency alert.",
        });
    }
};

// PATCH: Reactivate an emergency alert
const reactivateEmergencyAlert = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid emergency alert ID.",
            });
        }

        const alert = await EmergencyAlert.findByIdAndUpdate(
            id,
            {
                $set: {
                    status: "Active",
                    resolvedAt: null,
                },
            },
            {
                returnDocument: "after",
                runValidators: true,
            }
        );

        if (!alert) {
            return res.status(404).json({
                success: false,
                message: "Emergency alert not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Emergency alert reactivated successfully.",
            alert,
        });
    } catch (error) {
        console.error("Reactivate Emergency Alert Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to reactivate emergency alert.",
        });
    }
};

module.exports = {
    getEmergencyAlerts,
    getEmergencyAlertById,
    createEmergencyAlert,
    resolveEmergencyAlert,
    reactivateEmergencyAlert,
};
