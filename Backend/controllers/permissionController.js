const Permission = require("../models/Permission");

/* =========================================
   GET ALL PERMISSIONS
========================================= */

const getPermissions = async (req, res) => {
    try {
        const permissions = await Permission.find()
            .sort({
                resource: 1,
                action: 1,
            })
            .lean();

        return res.status(200).json({
            success: true,
            permissions,
        });
    } catch (error) {
        console.error(
            "Get Permissions Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to fetch permissions",
        });
    }
};

module.exports = {
    getPermissions,
};