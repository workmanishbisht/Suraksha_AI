const speakeasy = require("speakeasy");
const QRCode = require("qrcode");

const TwoFactor = require("../models/TwoFactor");
const User = require("../models/User");

/* =========================================
   GET 2FA STATUS
========================================= */

const getTwoFactorStatus = async (req, res) => {
    try {
        const record = await TwoFactor.findOne({
            user: req.user._id,
        }).lean();

        res.status(200).json({
            success: true,
            enabled: Boolean(record?.enabled),
        });
    } catch (error) {
        console.error("Get 2FA Status Error:", error);

        res.status(500).json({
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
        const user = await User.findById(req.user._id).select(
            "name email"
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        let record = await TwoFactor.findOne({
            user: user._id,
        });

        if (record?.enabled) {
            return res.status(400).json({
                success: false,
                message:
                    "Two-factor authentication is already enabled.",
            });
        }

        const secret = speakeasy.generateSecret({
            name: `SurakshaAI (${user.email})`,
            issuer: "SurakshaAI",
            length: 20,
        });

        if (!record) {
            record = new TwoFactor({
                user: user._id,
                secret: secret.base32,
                enabled: false,
            });
        } else {
            record.secret = secret.base32;
            record.enabled = false;
            record.verifiedAt = null;
        }

        await record.save();

        const qrCode = await QRCode.toDataURL(
            secret.otpauth_url
        );

        res.status(200).json({
            success: true,
            message: "2FA setup initialized.",
            qrCode,
            secret: secret.base32,
        });
    } catch (error) {
        console.error("Setup 2FA Error:", error);

        res.status(500).json({
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
        const { token } = req.body;

        if (!token || !/^\d{6}$/.test(String(token))) {
            return res.status(400).json({
                success: false,
                message:
                    "Enter a valid 6-digit verification code.",
            });
        }

        const record = await TwoFactor.findOne({
            user: req.user._id,
        });

        if (!record) {
            return res.status(404).json({
                success: false,
                message: "2FA setup not initialized.",
            });
        }

        if (record.enabled) {
            return res.status(400).json({
                success: false,
                message:
                    "Two-factor authentication is already enabled.",
            });
        }

        const serverToken = speakeasy.totp({
            secret: record.secret,
            encoding: "base32",
            step: 30,
            digits: 6,
            algorithm: "sha1",
        });

        console.log("=================================");
        console.log("2FA DEBUG");
        console.log("Server OTP:", serverToken);
        console.log("User OTP:", String(token));
        console.log("=================================");

        const verified = speakeasy.totp.verify({
            secret: record.secret,
            encoding: "base32",
            token: String(token),
            step: 30,
            digits: 6,
            algorithm: "sha1",
            window: 2,
        });

        console.log("2FA Verified:", verified);

        if (!verified) {
            return res.status(400).json({
                success: false,
                message: "Invalid verification code.",
            });
        }

        record.enabled = true;
        record.verifiedAt = new Date();

        await record.save();

        res.status(200).json({
            success: true,
            message:
                "Two-factor authentication enabled successfully.",
            enabled: true,
        });
    } catch (error) {
        console.error("Verify 2FA Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to verify 2FA.",
        });
    }
};

/* =========================================
   DISABLE 2FA
========================================= */

const disableTwoFactor = async (req, res) => {
    try {
        const record = await TwoFactor.findOne({
            user: req.user._id,
        });

        if (!record) {
            return res.status(400).json({
                success: false,
                message:
                    "Two-factor authentication is not configured.",
            });
        }

        await TwoFactor.deleteOne({
            user: req.user._id,
        });

        res.status(200).json({
            success: true,
            message:
                "Two-factor authentication disabled successfully.",
            enabled: false,
        });
    } catch (error) {
        console.error("Disable 2FA Error:", error);

        res.status(500).json({
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