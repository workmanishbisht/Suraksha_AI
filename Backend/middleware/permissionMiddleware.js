const Role = require("../models/Role");

const permissionMiddleware = (requiredPermission) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Authentication required",
                });
            }

            const role = await Role.findOne({
                name: req.user.role,
            }).populate("permissions");

            if (!role) {
                return res.status(403).json({
                    success: false,
                    message: "User role not found",
                });
            }

            const hasPermission = role.permissions.some(
                (permission) => permission.name === requiredPermission
            );

            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    message: "You do not have permission to perform this action",
                });
            }

            next();
        } catch (error) {
            console.error("Permission middleware error:", error);

            return res.status(500).json({
                success: false,
                message: "Server error while checking permission",
            });
        }
    };
};

module.exports = permissionMiddleware;