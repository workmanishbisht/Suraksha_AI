
const mongoose = require("mongoose");

const generalSchema = new mongoose.Schema(
    {
        systemName: {
            type: String,
            default: "SurakshaAI",
            trim: true,
        },
        organization: {
            type: String,
            default: "Disaster Management Authority",
            trim: true,
        },
        supportEmail: {
            type: String,
            default: "support@surakshaai.com",
            trim: true,
            lowercase: true,
        },
        timezone: {
            type: String,
            default: "Asia/Kolkata",
        },
        language: {
            type: String,
            enum: ["English", "Hindi"],
            default: "English",
        },
    },
    { _id: false }
);

const securitySchema = new mongoose.Schema(
    {
        sessionTimeout: {
            type: Number,
            default: 30,
            min: 5,
            max: 1440,
        },
        maxLoginAttempts: {
            type: Number,
            default: 5,
            min: 3,
            max: 10,
        },
        twoFactorEnabled: {
            type: Boolean,
            default: false,
        },
    },
    { _id: false }
);

const notificationsSchema = new mongoose.Schema(
    {
        emailNotifications: { type: Boolean, default: true },
        incidentAlerts: { type: Boolean, default: true },
        criticalAlerts: { type: Boolean, default: true },
        officerUpdates: { type: Boolean, default: true },
        weeklyReports: { type: Boolean, default: false },
    },
    { _id: false }
);

const preferencesSchema = new mongoose.Schema(
    {
        compactSidebar: { type: Boolean, default: false },
    },
    { _id: false }
);

const systemSettingSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            default: "global",
            unique: true,
            immutable: true,
        },
        general: {
            type: generalSchema,
            default: () => ({}),
        },
        security: {
            type: securitySchema,
            default: () => ({}),
        },
        notifications: {
            type: notificationsSchema,
            default: () => ({}),
        },
        preferences: {
            type: preferencesSchema,
            default: () => ({}),
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model(
    "SystemSetting",
    systemSettingSchema
);
