
const Announcement = require("../models/Announcement");
const Notification = require("../models/Notification");
const User = require("../models/User");

/* =========================================
   GET ALL ANNOUNCEMENTS
========================================= */

const getAnnouncements = async (req, res) => {
    try {
        const {
            search = "",
            status = "All",
            type = "All",
            page = 1,
            limit = 10,
        } = req.query;

        const currentPage = Math.max(Number(page) || 1, 1);
        const perPage = Math.min(
            Math.max(Number(limit) || 10, 1),
            100
        );

        const query = {};

        if (status !== "All") {
            query.status = status;
        }

        if (type !== "All") {
            query.type = type;
        }

        if (search.trim()) {
            const searchRegex = new RegExp(search.trim(), "i");

            query.$or = [
                { title: searchRegex },
                { message: searchRegex },
            ];
        }

        const total = await Announcement.countDocuments(query);

        const announcements = await Announcement.find(query)
            .populate("createdBy", "name username email")
            .sort({ createdAt: -1 })
            .skip((currentPage - 1) * perPage)
            .limit(perPage)
            .lean();

        return res.status(200).json({
            success: true,
            announcements,
            pagination: {
                page: currentPage,
                limit: perPage,
                total,
                totalPages: Math.ceil(total / perPage),
            },
        });
    } catch (error) {
        console.error("Get Announcements Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch announcements",
        });
    }
};

/* =========================================
   GET ANNOUNCEMENT STATISTICS
========================================= */

const getAnnouncementStats = async (req, res) => {
    try {
        const [
            totalMessages,
            sentMessages,
            scheduledMessages,
            criticalMessages,
        ] = await Promise.all([
            Announcement.countDocuments(),
            Announcement.countDocuments({ status: "Sent" }),
            Announcement.countDocuments({ status: "Scheduled" }),
            Announcement.countDocuments({ priority: "Critical" }),
        ]);

        return res.status(200).json({
            success: true,
            stats: {
                totalMessages,
                sentMessages,
                scheduledMessages,
                criticalMessages,
            },
        });
    } catch (error) {
        console.error("Announcement Stats Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch communication statistics",
        });
    }
};

/* =========================================
   GET ANNOUNCEMENT BY ID
========================================= */

const getAnnouncementById = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id)
            .populate("createdBy", "name username email")
            .lean();

        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: "Announcement not found",
            });
        }

        return res.status(200).json({
            success: true,
            announcement,
        });
    } catch (error) {
        console.error("Get Announcement Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch announcement",
        });
    }
};

/* =========================================
   CREATE ANNOUNCEMENT
========================================= */

const createAnnouncement = async (req, res) => {
    try {
        const {
            title,
            message,
            type = "General",
            audience = "All Citizens",
            priority = "Normal",
            status = "Sent",
            scheduledAt = null,
        } = req.body;

        if (!title?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Announcement title is required",
            });
        }

        if (!message?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Announcement message is required",
            });
        }

        // Validate audience before creating the announcement.
        const audienceRoles = {
            "All Citizens": ["citizen"],
            "Field Officers": ["field_officer"],
            "Department Officers": ["department_officer"],
            "All Users": [
                "admin",
                "citizen",
                "field_officer",
                "department_officer",
            ],
        };

        if (!audienceRoles[audience]) {
            return res.status(400).json({
                success: false,
                message: "Unsupported announcement audience",
            });
        }

        const announcement = await Announcement.create({
            title: title.trim(),
            message: message.trim(),
            type,
            audience,
            priority,
            status,
            scheduledAt,
            createdBy: req.user?._id || null,
        });

        let notificationCount = 0;

        // Generate notifications only for sent announcements.
        if (status === "Sent") {
            const recipients = await User.find({
                role: { $in: audienceRoles[audience] },
                isActive: true,
            })
                .select("_id")
                .lean();

            if (recipients.length > 0) {
                const notifications = recipients.map((recipient) => ({
                    recipient: recipient._id,
                    title: announcement.title,
                    message: announcement.message,
                    type: "announcement",
                    link: "/admin/announcements",
                }));

                const createdNotifications =
                    await Notification.insertMany(notifications);

                notificationCount = createdNotifications.length;
            }
        }

        const populatedAnnouncement = await Announcement.findById(
            announcement._id
        )
            .populate("createdBy", "name username email")
            .lean();

        return res.status(201).json({
            success: true,
            message: "Announcement created successfully",
            announcement: populatedAnnouncement,
            notificationCount,
        });
    } catch (error) {
        console.error("Create Announcement Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to create announcement",
        });
    }
};

/* =========================================
   UPDATE ANNOUNCEMENT
========================================= */

const updateAnnouncement = async (req, res) => {
    try {
        const {
            title,
            message,
            type,
            audience,
            priority,
            status,
            scheduledAt,
        } = req.body;

        const announcement = await Announcement.findById(req.params.id);

        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: "Announcement not found",
            });
        }

        if (title !== undefined) {
            if (!title.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Announcement title cannot be empty",
                });
            }

            announcement.title = title.trim();
        }

        if (message !== undefined) {
            if (!message.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Announcement message cannot be empty",
                });
            }

            announcement.message = message.trim();
        }

        if (type !== undefined) {
            announcement.type = type;
        }

        if (audience !== undefined) {
            announcement.audience = audience;
        }

        if (priority !== undefined) {
            announcement.priority = priority;
        }

        if (status !== undefined) {
            announcement.status = status;
        }

        if (scheduledAt !== undefined) {
            announcement.scheduledAt = scheduledAt;
        }

        await announcement.save();

        return res.status(200).json({
            success: true,
            message: "Announcement updated successfully",
            announcement,
        });
    } catch (error) {
        console.error("Update Announcement Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to update announcement",
        });
    }
};

/* =========================================
   DELETE ANNOUNCEMENT
========================================= */

const deleteAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findByIdAndDelete(
            req.params.id
        );

        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: "Announcement not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Announcement deleted successfully",
        });
    } catch (error) {
        console.error("Delete Announcement Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to delete announcement",
        });
    }
};

/* =========================================
   EXPORT CONTROLLERS
========================================= */

module.exports = {
    getAnnouncements,
    getAnnouncementStats,
    getAnnouncementById,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
};
