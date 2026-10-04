const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            enum: [
                "admin",
                "citizen",
                "field_officer",
                "department_officer",
            ],
            trim: true,
        },

        permissions: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Permission",
            },
        ],

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

module.exports = mongoose.model("Role", roleSchema);