const bcrypt = require("bcryptjs");
const User = require("../models/User");

/* =========================================
   GET PROFILE
========================================= */

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select(
            "-password"
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        console.error("Get Profile Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch profile.",
        });
    }
};


/* =========================================
   UPDATE PROFILE
========================================= */

const updateProfile = async (req, res) => {
    try {
        const { name } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        if (name !== undefined) {
            const trimmedName = name.trim();

            if (!trimmedName) {
                return res.status(400).json({
                    success: false,
                    message: "Name cannot be empty.",
                });
            }

            user.name = trimmedName;
        }

        await user.save();

        const updatedUser = await User.findById(user._id).select(
            "-password"
        );

        res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            user: updatedUser,
        });
    } catch (error) {
        console.error("Update Profile Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update profile.",
        });
    }
};


/* =========================================
   CHANGE PASSWORD
========================================= */

const changePassword = async (req, res) => {
    try {
        const {
            currentPassword,
            newPassword,
            confirmPassword,
        } = req.body;

        if (
            !currentPassword ||
            !newPassword ||
            !confirmPassword
        ) {
            return res.status(400).json({
                success: false,
                message: "All password fields are required.",
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "New passwords do not match.",
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message:
                    "New password must be at least 6 characters.",
            });
        }

        const user = await User.findById(req.user._id).select(
            "+password"
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        const isPasswordValid = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect.",
            });
        }

        const isSamePassword = await bcrypt.compare(
            newPassword,
            user.password
        );

        if (isSamePassword) {
            return res.status(400).json({
                success: false,
                message:
                    "New password must be different from current password.",
            });
        }

        user.password = await bcrypt.hash(
            newPassword,
            12
        );

        await user.save();

        res.status(200).json({
            success: true,
            message: "Password changed successfully.",
        });
    } catch (error) {
        console.error("Change Password Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to change password.",
        });
    }
};


module.exports = {
    getProfile,
    updateProfile,
    changePassword,
};