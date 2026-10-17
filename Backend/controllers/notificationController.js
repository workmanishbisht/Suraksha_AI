
const Notification = require("../models/Notification");

// GET: Logged-in user ki notifications
const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;

        const notifications = await Notification.find({
            recipient: userId,
        })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        const unreadCount = await Notification.countDocuments({
            recipient: userId,
            isRead: false,
        });

        return res.status(200).json({
            success: true,
            notifications,
            unreadCount,
        });
    } catch (error) {
        console.error("Get Notifications Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch notifications.",
        });
    }
};

// PATCH: Ek notification read mark karna
const markNotificationRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            {
                _id: req.params.id,
                recipient: req.user._id,
            },
            { $set: { isRead: true } },
            { new: true, runValidators: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Notification marked as read.",
            notification,
        });
    } catch (error) {
        console.error("Mark Notification Read Error:", error);

        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid notification ID.",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Unable to update notification.",
        });
    }
};

// PATCH: Saari notifications read mark karna
const markAllNotificationsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            {
                recipient: req.user._id,
                isRead: false,
            },
            { $set: { isRead: true } }
        );

        return res.status(200).json({
            success: true,
            message: "All notifications marked as read.",
        });
    } catch (error) {
        console.error("Mark All Notifications Read Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to update notifications.",
        });
    }
};

module.exports = {
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
};
