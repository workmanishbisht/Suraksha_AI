const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const registerUser = async (req, res) => {
    try {
        const {
            name,
            username,
            email,
            password,
            accountType,
        } = req.body;

        if (
            !name ||
            !username ||
            !email ||
            !password ||
            !accountType
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const roleMap = {
            Citizen: "citizen",
            "Field Officer": "field_officer",
            "Department Officer": "department_officer",
        };

        const role = roleMap[accountType];

        if (!role) {
            return res.status(400).json({
                success: false,
                message: "Invalid account type",
            });
        }

        const existingUser = await User.findOne({
            $or: [
                {
                    username: username.toLowerCase().trim(),
                },
                {
                    email: email.toLowerCase().trim(),
                },
            ],
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Username or email already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(
            password,
            12
        );

        const user = await User.create({
            name: name.trim(),
            username: username.toLowerCase().trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role,
            isActive: true,
        });

        return res.status(201).json({
            success: true,
            message: "Account created successfully",
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error(
            "Register Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Something went wrong while creating account",
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message:
                    "Username/email and password are required",
            });
        }

        const loginValue = username
            .toLowerCase()
            .trim();

        // Login using username OR email
        const user = await User.findOne({
            $or: [
                {
                    username: loginValue,
                },
                {
                    email: loginValue,
                },
            ],
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid username/email or password",
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message:
                    "Your account has been deactivated",
            });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid username/email or password",
            });
        }

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
                username: user.username,
            },
            process.env.JWT_SECRET,
            {
                expiresIn:
                    process.env.JWT_EXPIRES_IN || "1d",
            }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure:
                process.env.NODE_ENV === "production",
            sameSite:
                process.env.NODE_ENV === "production"
                    ? "none"
                    : "lax",
            maxAge: 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error(
            "Login Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Something went wrong during login",
        });
    }
};

const getCurrentUser = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            user: {
                id: req.user._id,
                name: req.user.name,
                username: req.user.username,
                email: req.user.email,
                role: req.user.role,
            },
        });
    } catch (error) {
        console.error(
            "Get Current User Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Unable to get current user",
        });
    }
};

const logoutUser = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure:
                process.env.NODE_ENV === "production",
            sameSite:
                process.env.NODE_ENV === "production"
                    ? "none"
                    : "lax",
        });

        return res.status(200).json({
            success: true,
            message: "Logout successful",
        });
    } catch (error) {
        console.error(
            "Logout Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Something went wrong during logout",
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getCurrentUser,
    logoutUser,
};