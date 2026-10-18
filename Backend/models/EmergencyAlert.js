
const mongoose = require("mongoose");

const emergencyAlertSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150,
        },

        description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 5000,
        },

        severity: {
            type: String,
            enum: ["Critical", "High", "Medium", "Low"],
            required: true,
            default: "Medium",
        },

        category: {
            type: String,
            enum: [
                "Weather",
                "Flood",
                "Fire",
                "Traffic",
                "Safety",
                "Health",
                "Other",
            ],
            default: "Other",
        },

        location: {
            type: String,
            required: true,
            trim: true,
        },

        status: {
            type: String,
            enum: ["Active", "Resolved"],
            default: "Active",
            index: true,
        },

        targetAudience: {
            type: String,
            enum: ["All Citizens", "All Users"],
            default: "All Citizens",
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        resolvedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

emergencyAlertSchema.index({
    status: 1,
    severity: 1,
    createdAt: -1,
});

module.exports = mongoose.model(
    "EmergencyAlert",
    emergencyAlertSchema
);
