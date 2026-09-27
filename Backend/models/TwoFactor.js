const mongoose = require("mongoose");

const twoFactorSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true,
        },

        secret: {
            type: String,
            required: true,
        },

        enabled: {
            type: Boolean,
            default: false,
        },

        verifiedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("TwoFactor", twoFactorSchema);