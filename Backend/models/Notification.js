
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

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
                "incident",
                "citizen",
                "field_officer",
                "announcement",
                "system",
            ],
            default: "system",
        },

        link: {
            type: String,
            default: "",
        },

        isRead: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

notificationSchema.index({
    recipient: 1,
    isRead: 1,
    createdAt: -1,
});

module.exports = mongoose.model("Notification", notificationSchema);
