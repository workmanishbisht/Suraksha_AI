
const mongoose = require("mongoose");

/* =========================================
   PERMISSION SCHEMA
========================================= */

const permissionSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Permission name is required"],
            unique: true,
            trim: true,
        },

        resource: {
            type: String,
            required: [true, "Permission resource is required"],
            trim: true,
        },

        action: {
            type: String,
            required: [true, "Permission action is required"],
            trim: true,
            lowercase: true,
            enum: {
                values: [
                    "create",
                    "read",
                    "update",
                    "delete",
                    "manage",
                ],
                message: "Invalid permission action",
            },
        },

        description: {
            type: String,
            default: "",
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

/* =========================================
   INDEXES
========================================= */

permissionSchema.index(
    { name: 1 },
    { unique: true }
);

/* =========================================
   MODEL EXPORT
========================================= */

module.exports = mongoose.model(
    "Permission",
    permissionSchema
);
