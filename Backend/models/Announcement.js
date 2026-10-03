const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
        },
        type: {
            type: String,
            enum: [
                "General",
                "Alert",
                "Advisory",
                "System",
            ],
            default: "General",
        },
        audience: {
            type: String,
            enum: [
                "All Citizens",
                "All Users",
                "Citizens",
                "Field Officers",
                "Department Officers",
            ],
            default: "All Citizens",
        },
        priority: {
            type: String,
            enum: [
                "Low",
                "Normal",
                "High",
                "Critical",
            ],
            default: "Normal",
        },
        status: {
            type: String,
            enum: ["Sent", "Scheduled"],
            default: "Sent",
        },
        scheduledAt: {
            type: Date,
            default: null,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "Announcement",
    announcementSchema
);