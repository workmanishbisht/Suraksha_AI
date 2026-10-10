const SystemSetting = require("../models/SystemSetting");

const getSettings = async (req, res) => {
    try {
        let settings = await SystemSetting.findOne();

        if (!settings) {
            settings = await SystemSetting.create({
                updatedBy: req.user?._id || null,
            });
        }

        return res.status(200).json({
            success: true,
            settings,
        });
    } catch (error) {
        console.error(
            "Get Settings Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to fetch system settings",
        });
    }
};

const updateSettings = async (req, res) => {
    try {
        const {
            general,
            security,
            notifications,
            preferences,
        } = req.body;

        let settings = await SystemSetting.findOne();

        if (!settings) {
            settings = new SystemSetting();
        }

        if (general) {
            settings.general = {
                ...settings.general.toObject(),
                ...general,
            };
        }

        if (security) {
            settings.security = {
                ...settings.security.toObject(),
                ...security,
            };
        }

        if (notifications) {
            settings.notifications = {
                ...settings.notifications.toObject(),
                ...notifications,
            };
        }

        if (preferences) {
            settings.preferences = {
                ...settings.preferences.toObject(),
                ...preferences,
            };
        }

        settings.updatedBy =
            req.user?._id || null;

        await settings.save();

        return res.status(200).json({
            success: true,
            message: "System settings updated successfully",
            settings,
        });
    } catch (error) {
        console.error(
            "Update Settings Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to update system settings",
        });
    }
};

const resetSettings = async (req, res) => {
    try {
        let settings = await SystemSetting.findOne();

        if (!settings) {
            settings = await SystemSetting.create({
                updatedBy: req.user?._id || null,
            });
        } else {
            settings.general = undefined;
            settings.security = undefined;
            settings.notifications = undefined;
            settings.preferences = undefined;
            settings.updatedBy =
                req.user?._id || null;

            await settings.save();
        }

        const freshSettings =
            await SystemSetting.findOne();

        return res.status(200).json({
            success: true,
            message: "System settings reset successfully",
            settings: freshSettings,
        });
    } catch (error) {
        console.error(
            "Reset Settings Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to reset system settings",
        });
    }
};

module.exports = {
    getSettings,
    updateSettings,
    resetSettings,
};