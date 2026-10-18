
const mongoose = require("mongoose");

const emergencyContactSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },
        relation: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50,
        },
        phone: {
            type: String,
            required: true,
            match: /^[0-9]{10}$/,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model(
    "EmergencyContact",
    emergencyContactSchema
);
