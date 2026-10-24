const speakeasy = require("speakeasy");
const QRCode = require("qrcode");

const TwoFactor = require("../models/TwoFactor");
const User = require("../models/User");

/* =========================================
   HELPERS
========================================= */

const normalizeOtp = (value) => {
    if (typeof value !== "string" && typeof value !== "number") {
        return "";
    }

    return String(value).trim();
};

const isValidOtp = (value) => {
    return /^\d{6}$/.test(normalizeOtp(value));
};

const verifyOtp = (secret, value, window = 1) => {
    const token = normalizeOtp(value);

    if (!secret || !isValidOtp(token)) {
        return false;
    }

    return speakeasy.totp.verify({
        secret,
        encoding: "base32",
        token,
        step: 30,
        digits: 6,
        algorithm: "sha1",
        window,
    });
};

/* =========================================
   GET 2FA STATUS
========================================= */

const getTwoFactorStatus = async (req, res) => {
    try {
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
        }

        const record = await TwoFactor.findOne({
            user: userId,
        })
            .select("enabled verifiedAt")
            .lean();

        return res.status(200).json({
            success: true,
            enabled: Boolean(record?.enabled),
            verifiedAt: record?.verifiedAt || null,
        });
    } catch (error) {
        console.error("Get 2FA Status Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch 2FA status.",
        });
    }
};

/* =========================================
   SETUP 2FA
========================================= */

const setupTwoFactor = async (req, res) => {
    try {
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
        }

        const user = await User.findById(userId).select("name email");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        let record = await TwoFactor.findOne({
            user: user._id,
        });

        // Do not replace the secret when 2FA is already enabled.
        if (record?.enabled) {
            return res.status(400).json({
                success: false,
                message: "Two-factor authentication is already enabled.",
            });
        }

        const secret = speakeasy.generateSecret({
            name: `SurakshaAI (${user.email})`,
            issuer: "SurakshaAI",
            length: 20,
        });

        if (!secret?.base32 || !secret?.otpauth_url) {
            throw new Error("Unable to generate 2FA secret.");
        }

        if (!record) {
            record = new TwoFactor({
                user: user._id,
                secret: secret.base32,
                enabled: false,
                verifiedAt: null,
            });
        } else {
            // Rotate only an incomplete, disabled setup.
            record.secret = secret.base32;
            record.enabled = false;
            record.verifiedAt = null;
        }

        await record.save();

        const qrCode = await QRCode.toDataURL(
            secret.otpauth_url
        );

        return res.status(200).json({
            success: true,
            message:
                "2FA setup initialized. Scan this QR code and verify the current code.",
            qrCode,
            secret: secret.base32,
        });
    } catch (error) {
        console.error("Setup 2FA Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to initialize 2FA setup.",
        });
    }
};

/* =========================================
   VERIFY 2FA SETUP
========================================= */

const verifyTwoFactorSetup = async (req, res) => {
    try {
        const userId = req.user?._id;
        const token = normalizeOtp(req.body?.token);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
        }

        if (!isValidOtp(token)) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid 6-digit verification code.",
            });
        }

        const record = await TwoFactor.findOne({
            user: userId,
        });

        if (!record || !record.secret) {
            return res.status(404).json({
                success: false,
                message: "2FA setup not initialized. Start setup again.",
            });
        }

        if (record.enabled) {
            return res.status(400).json({
                success: false,
                message: "Two-factor authentication is already enabled.",
            });
        }

        const verified = verifyOtp(
            record.secret,
            token,
            1
        );

        if (!verified) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid or expired verification code. Check automatic date and time on your phone and use the current code from the QR you just scanned.",
            });
        }

        record.enabled = true;
        record.verifiedAt = new Date();

        await record.save();

        return res.status(200).json({
            success: true,
            message:
                "Two-factor authentication enabled successfully.",
            enabled: true,
            verifiedAt: record.verifiedAt,
        });
    } catch (error) {
        console.error("Verify 2FA Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to verify 2FA.",
        });
    }
};

/* =========================================
   DISABLE 2FA
   Requires current authenticator code
========================================= */

const disableTwoFactor = async (req, res) => {
    try {
        const userId = req.user?._id;
        const token = normalizeOtp(req.body?.token);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
        }

        if (!isValidOtp(token)) {
            return res.status(400).json({
                success: false,
                message:
                    "Enter your current 6-digit authenticator code.",
            });
        }

        const record = await TwoFactor.findOne({
            user: userId,
        });

        if (!record || !record.enabled) {
            return res.status(400).json({
                success: false,
                message:
                    "Two-factor authentication is not enabled.",
            });
        }

        const verified = verifyOtp(
            record.secret,
            token,
            1
        );

        if (!verified) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid or expired authenticator code.",
            });
        }

        await TwoFactor.deleteOne({
            _id: record._id,
            user: userId,
        });

        return res.status(200).json({
            success: true,
            message:
                "Two-factor authentication disabled successfully.",
            enabled: false,
        });
    } catch (error) {
        console.error("Disable 2FA Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to disable 2FA.",
        });
    }
};

/* =========================================
   EXPORTS
========================================= */

module.exports = {
    getTwoFactorStatus,
    setupTwoFactor,
    verifyTwoFactorSetup,
    disableTwoFactor,
};