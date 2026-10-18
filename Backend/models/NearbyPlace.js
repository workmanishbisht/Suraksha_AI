
const mongoose = require("mongoose");

const nearbyPlaceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Place name is required."],
            trim: true,
            maxlength: 150,
        },

        category: {
            type: String,
            enum: {
                values: ["Police", "Hospital", "Fire Station"],
                message: "Category must be Police, Hospital or Fire Station.",
            },
            required: [true, "Category is required."],
        },

        address: {
            type: String,
            required: [true, "Address is required."],
            trim: true,
            maxlength: 300,
        },

        phone: {
            type: String,
            required: [true, "Phone number is required."],
            trim: true,
            maxlength: 20,
        },

        status: {
            type: String,
            enum: {
                values: [
                    "Open 24/7",
                    "Emergency Available",
                    "Temporarily Closed",
                ],
                message: "Invalid place status.",
            },
            default: "Open 24/7",
            trim: true,
        },

        latitude: {
            type: Number,
            default: null,
            min: -90,
            max: 90,
        },

        longitude: {
            type: Number,
            default: null,
            min: -180,
            max: 180,
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
    "NearbyPlace",
    nearbyPlaceSchema
);
