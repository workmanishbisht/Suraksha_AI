
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const MAX_PROFILE_IMAGE_SIZE = 10 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
];

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

        return res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        console.error("Get Profile Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch profile.",
        });
    }
};

/* =========================================
   UPDATE PROFILE
   Name + Email + Profile Image
========================================= */

const updateProfile = async (req, res) => {
    try {
        const { name, email, profileImage } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        /* ---------------------------------
           UPDATE NAME
        --------------------------------- */

        if (name !== undefined) {
            if (typeof name !== "string") {
                return res.status(400).json({
                    success: false,
                    message: "Name must be a string.",
                });
            }

            const trimmedName = name.trim();

            if (!trimmedName) {
                return res.status(400).json({
                    success: false,
                    message: "Name cannot be empty.",
                });
            }

            if (trimmedName.length > 100) {
                return res.status(400).json({
                    success: false,
                    message: "Name cannot be longer than 100 characters.",
                });
            }

            user.name = trimmedName;
        }

        /* ---------------------------------
           UPDATE EMAIL
        --------------------------------- */

        if (email !== undefined) {
            if (typeof email !== "string") {
                return res.status(400).json({
                    success: false,
                    message: "Email must be a string.",
                });
            }

            const trimmedEmail = email.trim().toLowerCase();

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(trimmedEmail)) {
                return res.status(400).json({
                    success: false,
                    message: "Please enter a valid email address.",
                });
            }

            if (trimmedEmail.length > 254) {
                return res.status(400).json({
                    success: false,
                    message: "Email address is too long.",
                });
            }

            const existingUser = await User.findOne({
                email: trimmedEmail,
                _id: { $ne: user._id },
            });

            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: "This email address is already in use.",
                });
            }

            user.email = trimmedEmail;
        }

        /* ---------------------------------
           UPDATE PROFILE IMAGE
        --------------------------------- */

        if (profileImage !== undefined) {
            // Remove profile image
            if (profileImage === null || profileImage === "") {
                user.profileImage = null;
            } else {
                if (typeof profileImage !== "string") {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid profile image.",
                    });
                }

                const imageMatch = profileImage.match(
                    /^data:(image\/jpeg|image\/png|image\/webp);base64,(.+)$/
                );

                if (!imageMatch) {
                    return res.status(400).json({
                        success: false,
                        message: "Only JPG, PNG and WEBP images are allowed.",
                    });
                }

                const mimeType = imageMatch[1];
                const base64Data = imageMatch[2];

                if (!ALLOWED_IMAGE_TYPES.includes(mimeType)) {
                    return res.status(400).json({
                        success: false,
                        message: "Only JPG, PNG and WEBP images are allowed.",
                    });
                }

                // Validate base64 format
                const isValidBase64 =
                    base64Data.length > 0 &&
                    base64Data.length % 4 === 0 &&
                    /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
                        base64Data
                    );

                if (!isValidBase64) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid image data.",
                    });
                }

                const estimatedSize = Math.floor(
                    (base64Data.length * 3) / 4
                ) -
                    (base64Data.endsWith("==")
                        ? 2
                        : base64Data.endsWith("=")
                            ? 1
                            : 0);

                if (estimatedSize > MAX_PROFILE_IMAGE_SIZE) {
                    return res.status(400).json({
                        success: false,
                        message: "Profile image must be 10 MB or smaller.",
                    });
                }

                user.profileImage = profileImage;
            }
        }

        /* ---------------------------------
           SAVE PROFILE
        --------------------------------- */

        await user.save();

        const updatedUser = await User.findById(user._id).select(
            "-password"
        );

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            user: updatedUser,
        });
    } catch (error) {
        console.error("Update Profile Error:", error);

        // Handle duplicate email/username database index errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern || {})[0];

            return res.status(409).json({
                success: false,
                message:
                    field === "email"
                        ? "This email address is already in use."
                        : field === "username"
                            ? "This username is already in use."
                            : "A duplicate value already exists.",
            });
        }

        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        return res.status(500).json({
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

        /* ---------------------------------
           REQUIRED FIELDS
        --------------------------------- */

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

        /* ---------------------------------
           PASSWORD MATCH
        --------------------------------- */

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "New passwords do not match.",
            });
        }

        /* ---------------------------------
           PASSWORD LENGTH
        --------------------------------- */

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 6 characters.",
            });
        }

        /* ---------------------------------
           GET USER
        --------------------------------- */

        const user = await User.findById(req.user._id).select(
            "+password"
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        /* ---------------------------------
           VERIFY CURRENT PASSWORD
        --------------------------------- */

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

        /* ---------------------------------
           PREVENT SAME PASSWORD
        --------------------------------- */

        const isSamePassword = await bcrypt.compare(
            newPassword,
            user.password
        );

        if (isSamePassword) {
            return res.status(400).json({
                success: false,
                message: "New password must be different from current password.",
            });
        }

        /* ---------------------------------
           HASH NEW PASSWORD
        --------------------------------- */

        user.password = await bcrypt.hash(newPassword, 12);

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password changed successfully.",
        });
    } catch (error) {
        console.error("Change Password Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to change password.",
        });
    }
};

/* =========================================
   EXPORTS
========================================= */

module.exports = {
    getProfile,
    updateProfile,
    changePassword,
};
