
const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
    {
        actor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
            index: true,
        },

        actorName: {
            type: String,
            default: "System",
            trim: true,
        },

        actorEmail: {
            type: String,
            default: "",
            trim: true,
            lowercase: true,
        },

        action: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },

        resource: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },

        resourceId: {
            type: String,
            default: "",
            trim: true,
        },

        description: {
            type: String,
            default: "",
            trim: true,
        },

        status: {
            type: String,
            enum: ["success", "failure"],
            default: "success",
            index: true,
        },

        ipAddress: {
            type: String,
            default: "",
        },

        userAgent: {
            type: String,
            default: "",
        },

        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ actorEmail: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, action: 1, createdAt: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
