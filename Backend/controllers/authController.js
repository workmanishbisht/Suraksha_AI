
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const speakeasy = require("speakeasy");

const User = require("../models/User");
const TwoFactor = require("../models/TwoFactor");

/* =========================================
   HELPER: NORMALIZE OTP
========================================= */

const normalizeOtp = (value) => {
    if (typeof value !== "string" && typeof value !== "number") {
        return "";
    }

    return String(value).trim();
};

const isValidOtpFormat = (value) => /^\d{6}$/.test(value);

/* =========================================
   REGISTER USER
========================================= */

const registerUser = async (req, res) => {
    try {
        const { name, username, email, password, accountType } = req.body;

        if (
            !name?.trim() ||
            !username?.trim() ||
            !email?.trim() ||
            typeof password !== "string" ||
            !password ||
            !accountType
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters",
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

        const normalizedUsername = username.trim().toLowerCase();
        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            $or: [
                { username: normalizedUsername },
                { email: normalizedEmail },
            ],
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Username or email already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            name: name.trim(),
            username: normalizedUsername,
            email: normalizedEmail,
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
        console.error("Register Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Something went wrong while creating account",
        });
    }
};

/* =========================================
   CREATE LOGIN TOKEN
========================================= */

const createLoginToken = (user) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is missing from environment");
    }

    return jwt.sign(
        {
            id: user._id,
            role: user.role,
            username: user.username,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || "1d",
        }
    );
};

/* =========================================
   SET LOGIN COOKIE
========================================= */

const setLoginCookie = (res, token) => {
    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("token", token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 24 * 60 * 60 * 1000,
    });
};

/* =========================================
   LOGIN USER
========================================= */

const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (
            typeof username !== "string" ||
            !username.trim() ||
            typeof password !== "string" ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "Username/email and password are required",
            });
        }

        const loginValue = username.trim().toLowerCase();

        const user = await User.findOne({
            $or: [
                { username: loginValue },
                { email: loginValue },
            ],
        }).select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid username/email or password",
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Your account has been deactivated",
            });
        }

        if (!user.password) {
            return res.status(401).json({
                success: false,
                message: "Invalid username/email or password",
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

        // Check whether 2FA is enabled for this user.
        const twoFactor = await TwoFactor.findOne({
            user: user._id,
            enabled: true,
        });

        if (twoFactor) {
            if (!process.env.JWT_SECRET) {
                throw new Error("JWT_SECRET is missing from environment");
            }

            // Short-lived token used only for the 2FA login challenge.
            const challengeToken = jwt.sign(
                {
                    id: user._id,
                    type: "2fa-login",
                },
                process.env.JWT_SECRET,
                { expiresIn: "5m" }
            );

            return res.status(200).json({
                success: true,
                requiresTwoFactor: true,
                message: "Two-factor authentication required",
                challengeToken,
                user: {
                    id: user._id,
                    name: user.name,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    profileImage: user.profileImage || null,
                },
            });
        }

        // Normal login when 2FA is not enabled.
        const token = createLoginToken(user);
        setLoginCookie(res, token);

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
                profileImage: user.profileImage || null,
            },
        });
    } catch (error) {
        console.error("Login Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Something went wrong during login",
        });
    }
};

/* =========================================
   VERIFY 2FA DURING LOGIN
========================================= */

const verifyTwoFactorLogin = async (req, res) => {
    try {
        const { challengeToken } = req.body || {};
        const token = normalizeOtp(req.body?.token);

        // Validate the challenge and OTP.
        if (
            typeof challengeToken !== "string" ||
            !challengeToken.trim() ||
            !token
        ) {
            return res.status(400).json({
                success: false,
                message: "2FA challenge and verification code are required",
            });
        }

        // Keep OTP as a string so leading zeroes are preserved.
        if (!isValidOtpFormat(token)) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid 6-digit verification code",
            });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is missing from environment");
        }

        // Verify the temporary login challenge.
        let decoded;

        try {
            decoded = jwt.verify(
                challengeToken,
                process.env.JWT_SECRET
            );
        } catch {
            return res.status(401).json({
                success: false,
                message: "2FA session expired. Please login again.",
            });
        }

        if (decoded.type !== "2fa-login" || !decoded.id) {
            return res.status(401).json({
                success: false,
                message: "Invalid 2FA login session.",
            });
        }

        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Your account has been deactivated.",
            });
        }

        // Fetch the enabled 2FA record for this exact user.
        const twoFactor = await TwoFactor.findOne({
            user: user._id,
            enabled: true,
        });

        if (!twoFactor || !twoFactor.secret) {
            return res.status(400).json({
                success: false,
                message: "Two-factor authentication is not enabled or is not configured correctly.",
            });
        }

        /*
         * IMPORTANT:
         * The secret stored in MongoDB must match the secret enrolled
         * in the user's authenticator app.
         *
         * Never log the secret or submitted OTP.
         */
        const verified = speakeasy.totp.verify({
            secret: twoFactor.secret,
            encoding: "base32",
            token,
            step: 30,
            digits: 6,
            algorithm: "sha1",
            window: 2,
        });

        if (!verified) {
            return res.status(401).json({
                success: false,
                message: "Invalid verification code. Check your authenticator app and device time.",
            });
        }

        // OTP verified: create the normal authenticated session.
        const loginToken = createLoginToken(user);
        setLoginCookie(res, loginToken);

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
                profileImage: user.profileImage || null,
            },
        });
    } catch (error) {
        console.error("2FA Login Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Something went wrong during 2FA verification",
        });
    }
};

/* =========================================
   GET CURRENT USER
========================================= */

const getCurrentUser = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        return res.status(200).json({
            success: true,
            user: {
                id: req.user._id,
                name: req.user.name,
                username: req.user.username,
                email: req.user.email,
                role: req.user.role,
                profileImage: req.user.profileImage || null,
            },
        });
    } catch (error) {
        console.error("Get Current User Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to get current user",
        });
    }
};

/* =========================================
   LOGOUT USER
========================================= */

const logoutUser = async (req, res) => {
    try {
        const isProduction = process.env.NODE_ENV === "production";

        res.clearCookie("token", {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
        });

        return res.status(200).json({
            success: true,
            message: "Logout successful",
        });
    } catch (error) {
        console.error("Logout Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Something went wrong during logout",
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
