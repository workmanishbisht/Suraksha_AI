
const mongoose = require("mongoose");
const EmergencyContact = require("../models/EmergencyContact");

const getContacts = async (req, res) => {
    try {
        const contacts = await EmergencyContact.find({
            user: req.user._id,
        }).sort({ createdAt: -1 }).lean();

        return res.status(200).json({
            success: true,
            contacts,
        });
    } catch (error) {
        console.error("Get Contacts Error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to fetch emergency contacts.",
        });
    }
};

const createContact = async (req, res) => {
    try {
        const { name, relation, phone } = req.body;

        if (
            !name?.trim() ||
            !relation?.trim() ||
            !/^[0-9]{10}$/.test(phone || "")
        ) {
            return res.status(400).json({
                success: false,
                message: "Enter name, relationship and a valid 10-digit phone number.",
            });
        }

        const contact = await EmergencyContact.create({
            user: req.user._id,
            name: name.trim(),
            relation: relation.trim(),
            phone,
        });

        return res.status(201).json({
            success: true,
            message: "Emergency contact added successfully.",
            contact,
        });
    } catch (error) {
        console.error("Create Contact Error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to add emergency contact.",
        });
    }
};

const updateContact = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid contact ID.",
            });
        }

        const { name, relation, phone } = req.body;

        if (
            !name?.trim() ||
            !relation?.trim() ||
            !/^[0-9]{10}$/.test(phone || "")
        ) {
            return res.status(400).json({
                success: false,
                message: "Enter name, relationship and a valid 10-digit phone number.",
            });
        }

        const contact = await EmergencyContact.findOneAndUpdate(
            {
                _id: req.params.id,
                user: req.user._id,
            },
            {
                $set: {
                    name: name.trim(),
                    relation: relation.trim(),
                    phone,
                },
            },
            { new: true, runValidators: true }
        );

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: "Emergency contact not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Emergency contact updated successfully.",
            contact,
        });
    } catch (error) {
        console.error("Update Contact Error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to update emergency contact.",
        });
    }
};

const deleteContact = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid contact ID.",
            });
        }

        const contact = await EmergencyContact.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: "Emergency contact not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Emergency contact deleted successfully.",
        });
    } catch (error) {
        console.error("Delete Contact Error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to delete emergency contact.",
        });
    }
};

module.exports = {
    getContacts,
    createContact,
    updateContact,
    deleteContact,
};
