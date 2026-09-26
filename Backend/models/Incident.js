const mongoose = require("mongoose");

const incidentLocationSchema = new mongoose.Schema(
    {
        address: {
            type: String,
            trim: true,
        },
        city: {
            type: String,
            trim: true,
        },
        state: {
            type: String,
            trim: true,
        },
        country: {
            type: String,
            trim: true,
            default: "India",
        },
        latitude: {
            type: Number,
            min: -90,
            max: 90,
        },
        longitude: {
            type: Number,
            min: -180,
            max: 180,
        },
    },
    { _id: false }
);

const incidentSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            trim: true,
        },

        type: {
            type: String,
            enum: [
                "flood",
                "landslide",
                "forest_fire",
                "earthquake",
                "heavy_rain",
                "road_accident",
                "fire",
                "medical_emergency",
                "infrastructure",
                "other",
            ],
            required: true,
        },

        severity: {
            type: String,
            enum: ["critical", "high", "medium", "low"],
            default: "medium",
        },

        status: {
            type: String,
            enum: [
                "reported",
                "investigating",
                "responding",
                "resolved",
                "rejected",
            ],
            default: "reported",
        },

        location: {
            type: incidentLocationSchema,
            required: true,
        },

        peopleAffected: {
            type: Number,
            min: 0,
            default: 0,
        },

        reportedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        assignedOfficer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        source: {
            type: String,
            enum: ["citizen", "admin", "field_officer", "department"],
            default: "admin",
        },

        images: [
            {
                type: String,
                trim: true,
            },
        ],

        resolvedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Incident", incidentSchema);