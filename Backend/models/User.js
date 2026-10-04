const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema(
    {
        name: {
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

        source: {
            type: String,
            enum: ["manual", "detected"],
            default: "manual",
        },
    },
    {
        _id: false,
    }
);

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
            minlength: 6,
        },

        role: {
            type: String,
            enum: [
                "admin",
                "citizen",
                "field_officer",
                "department_officer",
            ],
            default: "citizen",
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        profileImage: {
            type: String,
            default: null,
        },

        location: {
            type: locationSchema,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("User", userSchema);