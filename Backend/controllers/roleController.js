const Role = require("../models/Role");

/* =========================================
   GET ALL ROLES
========================================= */

const getRoles = async (req, res) => {
    try {
        const roles = await Role.find()
            .populate(
                "permissions",
                "name resource action description"
            )
            .sort({ name: 1 })
            .lean();

        return res.status(200).json({
            success: true,
            roles,
        });
    } catch (error) {
        console.error(
            "Get Roles Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Unable to fetch roles",
        });
    }
};

/* =========================================
   GET ROLE BY ID
========================================= */

const getRoleById = async (req, res) => {
    try {
        const { id } = req.params;

        const role = await Role.findById(id)
            .populate(
                "permissions",
                "name resource action description"
            )
            .lean();

        if (!role) {
            return res.status(404).json({
                success: false,
                message: "Role not found",
            });
        }

        return res.status(200).json({
            success: true,
            role,
        });
    } catch (error) {
        console.error(
            "Get Role Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Unable to fetch role",
        });
    }
};

/* =========================================
   UPDATE ROLE PERMISSIONS
========================================= */

const updateRolePermissions = async (
    req,
    res
) => {
    try {
        const { id } = req.params;
        const { permissions } = req.body;

        if (!Array.isArray(permissions)) {
            return res.status(400).json({
                success: false,
                message:
                    "Permissions must be an array",
            });
        }

        const role = await Role.findById(id);

        if (!role) {
            return res.status(404).json({
                success: false,
                message: "Role not found",
            });
        }

        role.permissions = permissions;

        await role.save();

        const updatedRole =
            await Role.findById(id)
                .populate(
                    "permissions",
                    "name resource action description"
                )
                .lean();

        return res.status(200).json({
            success: true,
            message:
                "Role permissions updated successfully",
            role: updatedRole,
        });
    } catch (error) {
        console.error(
            "Update Role Permissions Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to update role permissions",
        });
    }
};

module.exports = {
    getRoles,
    getRoleById,
    updateRolePermissions,
};