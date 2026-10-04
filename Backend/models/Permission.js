const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        resource: {
            type: String,
            required: true,
            trim: true,
        },

        action: {
            type: String,
            required: true,
            enum: ["create", "read", "update", "delete", "manage"],
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

module.exports = mongoose.model("Permission", permissionSchema);