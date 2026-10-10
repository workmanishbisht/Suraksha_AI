const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const speakeasy = require("speakeasy");
const User = require("../models/User");
const TwoFactor = require("../models/TwoFactor");

/* =========================================
   REGISTER USER
========================================= */

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
                    username: username
                        .toLowerCase()
                        .trim(),
                },
                {
                    email: email
                        .toLowerCase()
                        .trim(),
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
            username: username
                .toLowerCase()
                .trim(),
            email: email
                .toLowerCase()
                .trim(),
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
                profileImage: user.profileImage || null,
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

/* =========================================
   CREATE LOGIN TOKEN
========================================= */

const createLoginToken = (user) => {
    return jwt.sign(
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
};

/* =========================================
   SET LOGIN COOKIE
========================================= */

const setLoginCookie = (res, token) => {
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
};

/* =========================================
   LOGIN USER
========================================= */

const loginUser = async (req, res) => {
    try {
        const {
            username,
            password,
        } = req.body;

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
                message:
                    "Invalid username/email or password",
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message:
                    "Your account has been deactivated",
            });
        }

        const isPasswordValid =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid username/email or password",
            });
        }

        /* =========================================
           CHECK 2FA
        ========================================== */

        const twoFactor =
            await TwoFactor.findOne({
                user: user._id,
                enabled: true,
            });

        /* =========================================
           2FA ENABLED
        ========================================== */

        if (twoFactor) {
            const challengeToken = jwt.sign(
                {
                    id: user._id,
                    type: "2fa-login",
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "5m",
                }
            );

            return res.status(200).json({
                success: true,
                requiresTwoFactor: true,
                message:
                    "Two-factor authentication required",
                challengeToken,
                user: {
                    id: user._id,
                    name: user.name,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    profileImage:
                        user.profileImage || null,
                },
            });
        }

        /* =========================================
           NORMAL LOGIN
        ========================================== */

        const token = createLoginToken(user);

        setLoginCookie(
            res,
            token
        );

        return res.status(200).json({
            success: true,
            requiresTwoFactor: false,
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role,
                profileImage:
                    user.profileImage || null,
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

/* =========================================
   VERIFY 2FA DURING LOGIN
========================================= */

const verifyTwoFactorLogin = async (req, res) => {
    try {
        const {
            challengeToken,
            token,
        } = req.body;

        /* =========================================
           VALIDATE INPUT
        ========================================== */

        if (!challengeToken || !token) {
            return res.status(400).json({
                success: false,
                message:
                    "2FA challenge and verification code are required",
            });
        }

        if (!/^\d{6}$/.test(String(token))) {
            return res.status(400).json({
                success: false,
                message:
                    "Enter a valid 6-digit verification code",
            });
        }

        /* =========================================
           VERIFY LOGIN CHALLENGE
        ========================================== */

        let decoded;

        try {
            decoded = jwt.verify(
                challengeToken,
                process.env.JWT_SECRET
            );
        } catch (error) {
            return res.status(401).json({
                success: false,
                message:
                    "2FA session expired. Please login again.",
            });
        }

        if (
            decoded.type !== "2fa-login" ||
            !decoded.id
        ) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid 2FA login session.",
            });
        }

        /* =========================================
           GET USER
        ========================================== */

        const user = await User.findById(
            decoded.id
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message:
                    "Your account has been deactivated.",
            });
        }

        /* =========================================
           GET ACTIVE 2FA RECORD
        ========================================== */

        const twoFactor =
            await TwoFactor.findOne({
                user: user._id,
                enabled: true,
            });

        if (!twoFactor) {
            return res.status(400).json({
                success: false,
                message:
                    "Two-factor authentication is not enabled.",
            });
        }

        /* =========================================
           VERIFY OTP
        ========================================== */

        const verified =
            speakeasy.totp.verify({
                secret: twoFactor.secret,
                encoding: "base32",
                token: String(token),
                step: 30,
                digits: 6,
                algorithm: "sha1",
                window: 2,
            });

        if (!verified) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid verification code.",
            });
        }

        /* =========================================
           CREATE FINAL LOGIN TOKEN
        ========================================== */

        const loginToken =
            createLoginToken(user);

        setLoginCookie(
            res,
            loginToken
        );

        return res.status(200).json({
            success: true,
            message: "Login successful",
            requiresTwoFactor: false,
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role,
                profileImage:
                    user.profileImage || null,
            },
        });
    } catch (error) {
        console.error(
            "2FA Login Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Something went wrong during 2FA verification",
        });
    }
};

/* =========================================
   GET CURRENT USER
========================================= */

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
                profileImage:
                    req.user.profileImage || null,
            },
        });
    } catch (error) {
        console.error(
            "Get Current User Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to get current user",
        });
    }
};

/* =========================================
   LOGOUT USER
========================================= */

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

/* =========================================
   EXPORTS
========================================= */

module.exports = {
    registerUser,
    loginUser,
    verifyTwoFactorLogin,
    getCurrentUser,
    logoutUser,
};