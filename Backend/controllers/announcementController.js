const Announcement = require("../models/Announcement");

const getAnnouncements = async (req, res) => {
    try {
        const {
            search = "",
            status = "All",
            type = "All",
            page = 1,
            limit = 10,
        } = req.query;

        const currentPage = Math.max(
            Number(page) || 1,
            1
        );

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
            const searchRegex = new RegExp(
                search.trim(),
                "i"
            );

            query.$or = [
                { title: searchRegex },
                { message: searchRegex },
            ];
        }

        const total =
            await Announcement.countDocuments(query);

        const announcements =
            await Announcement.find(query)
                .populate(
                    "createdBy",
                    "name username email"
                )
                .sort({
                    createdAt: -1,
                })
                .skip(
                    (currentPage - 1) *
                    perPage
                )
                .limit(perPage)
                .lean();

        return res.status(200).json({
            success: true,
            announcements,
            pagination: {
                page: currentPage,
                limit: perPage,
                total,
                totalPages: Math.ceil(
                    total / perPage
                ),
            },
        });
    } catch (error) {
        console.error(
            "Get Announcements Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to fetch announcements",
        });
    }
};

const getAnnouncementStats = async (
    req,
    res
) => {
    try {
        const [
            totalMessages,
            sentMessages,
            scheduledMessages,
            criticalMessages,
        ] = await Promise.all([
            Announcement.countDocuments(),

            Announcement.countDocuments({
                status: "Sent",
            }),

            Announcement.countDocuments({
                status: "Scheduled",
            }),

            Announcement.countDocuments({
                priority: "Critical",
            }),
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
        console.error(
            "Announcement Stats Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to fetch communication statistics",
        });
    }
};

const getAnnouncementById = async (
    req,
    res
) => {
    try {
        const announcement =
            await Announcement.findById(
                req.params.id
            )
                .populate(
                    "createdBy",
                    "name username email"
                )
                .lean();

        if (!announcement) {
            return res.status(404).json({
                success: false,
                message:
                    "Announcement not found",
            });
        }

        return res.status(200).json({
            success: true,
            announcement,
        });
    } catch (error) {
        console.error(
            "Get Announcement Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to fetch announcement",
        });
    }
};

const createAnnouncement = async (
    req,
    res
) => {
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
                message:
                    "Announcement title is required",
            });
        }

        if (!message?.trim()) {
            return res.status(400).json({
                success: false,
                message:
                    "Announcement message is required",
            });
        }

        const announcement =
            await Announcement.create({
                title: title.trim(),
                message: message.trim(),
                type,
                audience,
                priority,
                status,
                scheduledAt,
                createdBy: req.user?._id || null,
            });

        const populatedAnnouncement =
            await Announcement.findById(
                announcement._id
            )
                .populate(
                    "createdBy",
                    "name username email"
                )
                .lean();

        return res.status(201).json({
            success: true,
            message:
                "Announcement created successfully",
            announcement:
                populatedAnnouncement,
        });
    } catch (error) {
        console.error(
            "Create Announcement Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to create announcement",
        });
    }
};

const updateAnnouncement = async (
    req,
    res
) => {
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

        const announcement =
            await Announcement.findById(
                req.params.id
            );

        if (!announcement) {
            return res.status(404).json({
                success: false,
                message:
                    "Announcement not found",
            });
        }

        if (title !== undefined) {
            announcement.title =
                title.trim();
        }

        if (message !== undefined) {
            announcement.message =
                message.trim();
        }

        if (type !== undefined) {
            announcement.type = type;
        }

        if (audience !== undefined) {
            announcement.audience = audience;
        }

        if (priority !== undefined) {
            announcement.priority =
                priority;
        }

        if (status !== undefined) {
            announcement.status = status;
        }

        if (scheduledAt !== undefined) {
            announcement.scheduledAt =
                scheduledAt;
        }

        await announcement.save();

        return res.status(200).json({
            success: true,
            message:
                "Announcement updated successfully",
            announcement,
        });
    } catch (error) {
        console.error(
            "Update Announcement Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to update announcement",
        });
    }
};

const deleteAnnouncement = async (
    req,
    res
) => {
    try {
        const announcement =
            await Announcement.findByIdAndDelete(
                req.params.id
            );

        if (!announcement) {
            return res.status(404).json({
                success: false,
                message:
                    "Announcement not found",
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Announcement deleted successfully",
        });
    } catch (error) {
        console.error(
            "Delete Announcement Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to delete announcement",
        });
    }
};

module.exports = {
    getAnnouncements,
    getAnnouncementStats,
    getAnnouncementById,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
};