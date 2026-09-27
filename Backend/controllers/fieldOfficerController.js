const User = require("../models/User");
const bcrypt = require("bcryptjs");

const getFieldOfficers = async (req, res) => {
    try {
        const officers = await User.find({
            role: "field_officer",
        })
            .select("-password")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: officers.length,
            officers,
        });
    } catch (error) {
        console.error(
            "Get Field Officers Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Unable to fetch field officers",
        });
    }
};


const getFieldOfficerById = async (req, res) => {
    try {
        const officer = await User.findOne({
            _id: req.params.id,
            role: "field_officer",
        }).select("-password");

        if (!officer) {
            return res.status(404).json({
                success: false,
                message: "Field officer not found",
            });
        }

        return res.status(200).json({
            success: true,
            officer,
        });
    } catch (error) {
        console.error(
            "Get Field Officer Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Unable to fetch field officer",
        });
    }
};


const createFieldOfficer = async (req, res) => {
    try {
        const {
            name,
            username,
            email,
            password,
            location,
        } = req.body;

        if (
            !name ||
            !username ||
            !email ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Name, username, email and password are required",
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must be at least 6 characters",
            });
        }

        const normalizedUsername =
            username.toLowerCase().trim();

        const normalizedEmail =
            email.toLowerCase().trim();

        const existingUser = await User.findOne({
            $or: [
                { username: normalizedUsername },
                { email: normalizedEmail },
            ],
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message:
                    "Username or email already exists",
            });
        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        const officer = await User.create({
            name: name.trim(),
            username: normalizedUsername,
            email: normalizedEmail,
            password: hashedPassword,
            role: "field_officer",
            isActive: true,
            location: location || null,
        });

        const officerResponse =
            officer.toObject();

        delete officerResponse.password;

        return res.status(201).json({
            success: true,
            message:
                "Field officer created successfully",
            officer: officerResponse,
        });
    } catch (error) {
        console.error(
            "Create Field Officer Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to create field officer",
        });
    }
};


const updateFieldOfficer = async (req, res) => {
    try {
        const officer =
            await User.findOne({
                _id: req.params.id,
                role: "field_officer",
            });

        if (!officer) {
            return res.status(404).json({
                success: false,
                message:
                    "Field officer not found",
            });
        }

        const {
            name,
            username,
            email,
            password,
            isActive,
            location,
        } = req.body;

        if (username) {
            const normalizedUsername =
                username.toLowerCase().trim();

            const usernameExists =
                await User.findOne({
                    username: normalizedUsername,
                    _id: { $ne: officer._id },
                });

            if (usernameExists) {
                return res.status(409).json({
                    success: false,
                    message:
                        "Username already exists",
                });
            }

            officer.username =
                normalizedUsername;
        }

        if (email) {
            const normalizedEmail =
                email.toLowerCase().trim();

            const emailExists =
                await User.findOne({
                    email: normalizedEmail,
                    _id: { $ne: officer._id },
                });

            if (emailExists) {
                return res.status(409).json({
                    success: false,
                    message:
                        "Email already exists",
                });
            }

            officer.email =
                normalizedEmail;
        }

        if (name) {
            officer.name = name.trim();
        }

        if (typeof isActive === "boolean") {
            officer.isActive = isActive;
        }

        if (location !== undefined) {
            officer.location = location;
        }

        if (password) {
            if (password.length < 6) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Password must be at least 6 characters",
                });
            }

            officer.password =
                await bcrypt.hash(password, 10);
        }

        await officer.save();

        const officerResponse =
            officer.toObject();

        delete officerResponse.password;

        return res.status(200).json({
            success: true,
            message:
                "Field officer updated successfully",
            officer: officerResponse,
        });
    } catch (error) {
        console.error(
            "Update Field Officer Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to update field officer",
        });
    }
};


const deleteFieldOfficer = async (req, res) => {
    try {
        const officer =
            await User.findOneAndDelete({
                _id: req.params.id,
                role: "field_officer",
            });

        if (!officer) {
            return res.status(404).json({
                success: false,
                message:
                    "Field officer not found",
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Field officer deleted successfully",
        });
    } catch (error) {
        console.error(
            "Delete Field Officer Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to delete field officer",
        });
    }
};


const getFieldOfficerStats = async (req, res) => {
    try {
        const [
            totalOfficers,
            activeOfficers,
            inactiveOfficers,
        ] = await Promise.all([
            User.countDocuments({
                role: "field_officer",
            }),

            User.countDocuments({
                role: "field_officer",
                isActive: true,
            }),

            User.countDocuments({
                role: "field_officer",
                isActive: false,
            }),
        ]);

        return res.status(200).json({
            success: true,
            stats: {
                totalOfficers,
                activeOfficers,
                inactiveOfficers,
            },
        });
    } catch (error) {
        console.error(
            "Field Officer Stats Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to fetch field officer stats",
        });
    }
};


module.exports = {
    getFieldOfficers,
    getFieldOfficerById,
    createFieldOfficer,
    updateFieldOfficer,
    deleteFieldOfficer,
    getFieldOfficerStats,
};