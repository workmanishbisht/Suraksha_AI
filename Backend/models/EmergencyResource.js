const mongoose = require("mongoose");

const emergencyResourceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        type: {
            type: String,
            enum: [
                "rescue_teams",
                "ambulances",
                "helicopters",
                "relief_camps",
                "medical_units",
            ],
            required: true,
        },

        total: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },

        available: {
            type: Number,
            min: 0,
            default: 0,
        },

        location: {
            type: String,
            trim: true,
            default: "",
        },

        status: {
            type: String,
            enum: [
                "available",
                "limited",
                "unavailable",
            ],
            default: "available",
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "EmergencyResource",
    emergencyResourceSchema
);