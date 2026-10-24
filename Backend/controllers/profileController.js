
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");

const MAX_PROFILE_IMAGE_SIZE = 10 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
];

/* =========================================
   AUDIT LOG HELPER
========================================= */

const writeAuditLog = async (req, action, description) => {
    try {
        await AuditLog.create({
            actor: req.user._id,
            actorName: req.user.name || "User",
            actorEmail: req.user.email || "",
            action,
            resource: "profile",
            resourceId: String(req.user._id),
            description,
            status: "success",
            ipAddress: req.ip || "",
            userAgent: req.get("user-agent") || "",
        });
    } catch (error) {
        // Audit failure should not expose sensitive data
        // or turn a successful profile update into an error.
        console.error("Audit Log Error:", error.message);
    }
};

/* =========================================
   GET PROFILE
   GET /api/profile
========================================= */

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select("-password")
            .lean();

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
        console.error("Get Profile Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch profile.",
        });
    }
};

/* =========================================
   UPDATE PROFILE
   PUT /api/profile
========================================= */

const updateProfile = async (req, res) => {
    try {
        if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
            return res.status(400).json({
                success: false,
                message: "Invalid request body.",
            });
        }

        const {
            name,
            email,
            phone,
            dateOfBirth,
            gender,
            address,
            emergencyContact,
            profileImage,
        } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        const changedFields = [];

        // Name
        if (name !== undefined) {
            if (typeof name !== "string" || !name.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Name cannot be empty.",
                });
            }

            const value = name.trim();

            if (value.length > 100) {
                return res.status(400).json({
                    success: false,
                    message: "Name cannot exceed 100 characters.",
                });
            }

            if (user.name !== value) {
                user.name = value;
                changedFields.push("name");
            }
        }

        // Email
        if (email !== undefined) {
            if (typeof email !== "string") {
                return res.status(400).json({
                    success: false,
                    message: "Invalid email address.",
                });
            }

            const value = email.trim().toLowerCase();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (value.length > 254 || !emailRegex.test(value)) {
                return res.status(400).json({
                    success: false,
                    message: "Please enter a valid email address.",
                });
            }

            if (value !== user.email) {
                const existingUser = await User.findOne({
                    email: value,
                    _id: { $ne: user._id },
                }).select("_id");

                if (existingUser) {
                    return res.status(409).json({
                        success: false,
                        message: "This email address is already in use.",
                    });
                }

                user.email = value;

                // Changing email must invalidate previous verification.
                user.emailVerified = false;

                changedFields.push("email");
            }
        }

        // Phone
        if (phone !== undefined) {
            if (
                typeof phone !== "string" ||
                phone.trim().length > 20
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid phone number.",
                });
            }

            const value = phone.trim();

            if (user.phone !== value) {
                user.phone = value;
                changedFields.push("phone");
            }
        }

        // Date of birth
        if (dateOfBirth !== undefined) {
            if (dateOfBirth === null || dateOfBirth === "") {
                if (user.dateOfBirth !== null) {
                    user.dateOfBirth = null;
                    changedFields.push("dateOfBirth");
                }
            } else {
                if (typeof dateOfBirth !== "string") {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid date of birth.",
                    });
                }

                const parsedDate = new Date(dateOfBirth);

                if (
                    Number.isNaN(parsedDate.getTime()) ||
                    parsedDate > new Date()
                ) {
                    return res.status(400).json({
                        success: false,
                        message: "Please enter a valid date of birth.",
                    });
                }

                if (
                    user.dateOfBirth?.getTime() !== parsedDate.getTime()
                ) {
                    user.dateOfBirth = parsedDate;
                    changedFields.push("dateOfBirth");
                }
            }
        }

        // Gender
        if (gender !== undefined) {
            const allowedGenders = ["", "male", "female", "other"];

            if (
                typeof gender !== "string" ||
                !allowedGenders.includes(gender)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid gender value.",
                });
            }

            if (user.gender !== gender) {
                user.gender = gender;
                changedFields.push("gender");
            }
        }

        // Address
        if (address !== undefined) {
            if (
                typeof address !== "string" ||
                address.trim().length > 500
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Address must be 500 characters or fewer.",
                });
            }

            const value = address.trim();

            if (user.address !== value) {
                user.address = value;
                changedFields.push("address");
            }
        }

        // Emergency contact
        if (emergencyContact !== undefined) {
            if (
                typeof emergencyContact !== "string" ||
                emergencyContact.trim().length > 20
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid emergency contact.",
                });
            }

            const value = emergencyContact.trim();

            if (user.emergencyContact !== value) {
                user.emergencyContact = value;
                changedFields.push("emergencyContact");
            }
        }

        // Profile image: null or empty string removes the image.
        if (profileImage !== undefined) {
            if (profileImage === null || profileImage === "") {
                if (user.profileImage !== null) {
                    user.profileImage = null;
                    changedFields.push("profileImage");
                }
            } else {
                if (typeof profileImage !== "string") {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid profile image.",
                    });
                }

                const imageMatch = profileImage.match(
                    /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/
                );

                if (!imageMatch) {
                    return res.status(400).json({
                        success: false,
                        message: "Only JPG, PNG and WEBP images are allowed.",
                    });
                }

                const mimeType = imageMatch[1];
                const base64Data = imageMatch[2];

                if (
                    !ALLOWED_IMAGE_TYPES.includes(mimeType) ||
                    !base64Data ||
                    base64Data.length % 4 !== 0
                ) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid image data.",
                    });
                }

                const imageBuffer = Buffer.from(base64Data, "base64");

                if (imageBuffer.toString("base64") !== base64Data) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid Base64 image data.",
                    });
                }

                if (imageBuffer.length > MAX_PROFILE_IMAGE_SIZE) {
                    return res.status(400).json({
                        success: false,
                        message: "Profile image must be 10 MB or smaller.",
                    });
                }

                const isJpeg =
                    mimeType === "image/jpeg" &&
                    imageBuffer.length >= 3 &&
                    imageBuffer[0] === 0xff &&
                    imageBuffer[1] === 0xd8 &&
                    imageBuffer[2] === 0xff;

                const isPng =
                    mimeType === "image/png" &&
                    imageBuffer.length >= 8 &&
                    imageBuffer.subarray(0, 8).equals(
                        Buffer.from([
                            0x89, 0x50, 0x4e, 0x47,
                            0x0d, 0x0a, 0x1a, 0x0a,
                        ])
                    );

                const isWebp =
                    mimeType === "image/webp" &&
                    imageBuffer.length >= 12 &&
                    imageBuffer.toString("ascii", 0, 4) === "RIFF" &&
                    imageBuffer.toString("ascii", 8, 12) === "WEBP";

                if (!isJpeg && !isPng && !isWebp) {
                    return res.status(400).json({
                        success: false,
                        message: "Image content does not match its file type.",
                    });
                }

                if (user.profileImage !== profileImage) {
                    user.profileImage = profileImage;
                    changedFields.push("profileImage");
                }
            }
        }

        if (changedFields.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No profile changes detected.",
                user: {
                    ...user.toObject(),
                    password: undefined,
                },
            });
        }

        await user.save();

        await writeAuditLog(
            req,
            "profile.updated",
            `Updated profile fields: ${changedFields.join(", ")}`
        );

        const updatedUser = await User.findById(user._id)
            .select("-password")
            .lean();

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            user: updatedUser,
        });
    } catch (error) {
        console.error("Update Profile Error:", error.message);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Email or username is already in use.",
            });
        }

        if (
            error.name === "ValidationError" ||
            error.name === "CastError"
        ) {
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
   POST /api/profile/change-password
========================================= */

const changePassword = async (req, res) => {
    try {
        const {
            currentPassword,
            newPassword,
            confirmPassword,
        } = req.body || {};

        if (
            typeof currentPassword !== "string" ||
            typeof newPassword !== "string" ||
            typeof confirmPassword !== "string" ||
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

        if (newPassword.length < 6 || newPassword.length > 128) {
            return res.status(400).json({
                success: false,
                message: "Password must be between 6 and 128 characters.",
            });
        }

        const user = await User.findById(req.user._id)
            .select("+password");

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
                message: "New password must differ from the current password.",
            });
        }

        user.password = await bcrypt.hash(newPassword, 12);
        await user.save();

        await writeAuditLog(
            req,
            "password.changed",
            "User changed their password."
        );

        return res.status(200).json({
            success: true,
            message: "Password changed successfully.",
        });
    } catch (error) {
        console.error("Change Password Error:", error.message);

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
