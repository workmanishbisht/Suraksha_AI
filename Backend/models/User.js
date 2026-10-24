
const mongoose = require("mongoose");

/* =========================================
   LOCATION SCHEMA
========================================= */

const locationSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            default: "",
        },

        state: {
            type: String,
            trim: true,
            default: "",
        },

        country: {
            type: String,
            trim: true,
            default: "",
        },

        latitude: {
            type: Number,
            min: -90,
            max: 90,
            default: undefined,
        },

        longitude: {
            type: Number,
            min: -180,
            max: 180,
            default: undefined,
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

/* =========================================
   USER SCHEMA
========================================= */

const userSchema = new mongoose.Schema(
    {
        // Basic Information
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },

        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            maxlength: 50,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            maxlength: 254,
        },

        password: {
            type: String,
            required: true,
            minlength: 6,
            select: false,
        },

        // Email Verification
        emailVerified: {
            type: Boolean,
            default: false,
        },

        // User Role
        role: {
            type: String,
            enum: [
                "admin",
                "citizen",
                "field_officer",
                "department_officer",
            ],
            default: "citizen",
            index: true,
        },

        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },

        // Profile Information
        profileImage: {
            type: String,
            default: null,
        },

        phone: {
            type: String,
            trim: true,
            default: "",
            maxlength: 20,
        },

        dateOfBirth: {
            type: Date,
            default: null,
        },

        gender: {
            type: String,
            enum: ["male", "female", "other", ""],
            default: "",
        },

        address: {
            type: String,
            trim: true,
            default: "",
            maxlength: 500,
        },

        emergencyContact: {
            type: String,
            trim: true,
            default: "",
            maxlength: 20,
        },

        // Location Information
        location: {
            type: locationSchema,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

/* =========================================
   MODEL EXPORT
========================================= */

module.exports = mongoose.model("User", userSchema);
