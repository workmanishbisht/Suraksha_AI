
const mongoose = require("mongoose");

const Role = require("../models/Role");
const Permission = require("../models/Permission");
const AuditLog = require("../models/AuditLog");

/* =========================================
   HELPERS
========================================= */

const getActorName = (user) =>
    user?.name ||
    user?.username ||
    user?.email ||
    "System";

/* =========================================
   CREATE AUDIT LOG
========================================= */

const createRoleAuditLog = async (
    req,
    {
        action,
        role,
        description,
        metadata = {},
    }
) => {
    try {
        await AuditLog.create({
            actor: req.user?._id || null,
            actorName: getActorName(req.user),
            actorEmail: req.user?.email || "",
            action,
            resource: "Role",
            resourceId: role._id.toString(),
            description,
            status: "success",
            ipAddress: req.ip || "",
            userAgent: req.get("user-agent") || "",
            metadata: {
                roleId: role._id.toString(),
                roleName: role.name,
                ...metadata,
            },
        });
    } catch (error) {
        console.error(
            "Role Audit Log Error:",
            error.message
        );
    }
};

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

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role ID",
            });
        }

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

const updateRolePermissions = async (req, res) => {
    try {
        const { id } = req.params;
        const { permissions } = req.body;

        // Validate role ID.
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role ID",
            });
        }

        // Validate the permissions payload.
        if (!Array.isArray(permissions)) {
            return res.status(400).json({
                success: false,
                message: "Permissions must be an array",
            });
        }

        // Validate every permission ID.
        const invalidIds = permissions.filter(
            (permissionId) =>
                typeof permissionId !== "string" ||
                !mongoose.isValidObjectId(permissionId)
        );

        if (invalidIds.length > 0) {
            return res.status(400).json({
                success: false,
                message: "One or more permission IDs are invalid",
            });
        }

        // Reject duplicate IDs.
        const uniquePermissionIds = [...new Set(permissions)];

        if (uniquePermissionIds.length !== permissions.length) {
            return res.status(400).json({
                success: false,
                message: "Duplicate permission IDs are not allowed",
            });
        }

        // Find the requested role.
        const role = await Role.findById(id);

        if (!role) {
            return res.status(404).json({
                success: false,
                message: "Role not found",
            });
        }

        // Ensure all permission IDs exist.
        const existingPermissions = await Permission.find({
            _id: { $in: uniquePermissionIds },
        })
            .select("_id")
            .lean();

        if (
            existingPermissions.length !==
            uniquePermissionIds.length
        ) {
            return res.status(400).json({
                success: false,
                message: "One or more permissions do not exist",
            });
        }

        // Capture existing permissions before updating.
        const previousPermissions = (
            role.permissions || []
        ).map((permission) => permission.toString());

        const addedPermissions = uniquePermissionIds.filter(
            (permissionId) =>
                !previousPermissions.includes(permissionId)
        );

        const removedPermissions = previousPermissions.filter(
            (permissionId) =>
                !uniquePermissionIds.includes(permissionId)
        );

        // Save the validated permissions.
        role.permissions = uniquePermissionIds;

        await role.save();

        // Audit only if something actually changed.
        if (
            addedPermissions.length > 0 ||
            removedPermissions.length > 0
        ) {
            await createRoleAuditLog(req, {
                action: "ROLE_PERMISSIONS_UPDATED",
                role,
                description:
                    `Permissions updated for role: ${role.name}`,
                metadata: {
                    previousPermissions,
                    newPermissions: uniquePermissionIds,
                    addedPermissions,
                    removedPermissions,
                },
            });
        }

        // Return the updated role with populated permissions.
        const updatedRole = await Role.findById(role._id)
            .populate(
                "permissions",
                "name resource action description"
            )
            .lean();

        return res.status(200).json({
            success: true,
            message: "Role permissions updated successfully",
            role: updatedRole,
        });
    } catch (error) {
        console.error(
            "Update Role Permissions Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Unable to update role permissions",
        });
    }
};

/* =========================================
   EXPORT CONTROLLERS
========================================= */

module.exports = {
    getRoles,
    getRoleById,
    updateRolePermissions,
};
