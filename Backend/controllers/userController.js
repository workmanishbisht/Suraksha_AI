const mongoose = require("mongoose");

const User = require("../models/User");

const AuditLog = require("../models/AuditLog");


/* =========================================
   GET ALL USERS
========================================= */

const getUsers = async (req, res) => {
    try {
        const {
            search = "",
            role = "All Roles",
            status = "All Status",
            page = 1,
            limit = 10,
        } = req.query;

        const currentPage = Math.max(
            Number(page) || 1,
            1
        );

        const perPage = Math.min(
            Math.max(Number(limit) || 10, 1),
            100
        );

        const query = {};

        /* SEARCH */

        if (search.trim()) {
            const searchRegex = new RegExp(
                search.trim(),
                "i"
            );

            query.$or = [
                { name: searchRegex },
                { username: searchRegex },
                { email: searchRegex },
            ];
        }

        /* ROLE FILTER */

        if (
            role &&
            role !== "All Roles"
        ) {
            const roleMap = {
                Admin: "admin",
                Citizen: "citizen",
                "Field Officer": "field_officer",
                "Department Officer":
                    "department_officer",
            };

            const selectedRole =
                roleMap[role] || role;

            query.role = selectedRole;
        }

        /* STATUS FILTER */

        if (
            status &&
            status !== "All Status"
        ) {
            query.isActive =
                status === "Active";
        }

        const totalUsers =
            await User.countDocuments(query);

        const users = await User.find(query)
            .select(
                "_id name username email role isActive profileImage createdAt updatedAt lastLogin"
            )
            .sort({
                createdAt: -1,
            })
            .skip(
                (currentPage - 1) *
                perPage
            )
            .limit(perPage)
            .lean();

        const formattedUsers =
            users.map((user) => ({
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role,
                status: user.isActive
                    ? "Active"
                    : "Inactive",
                profileImage:
                    user.profileImage ||
                    null,
                joined:
                    user.createdAt,
                lastLogin:
                    user.lastLogin ||
                    null,
            }));

        return res.status(200).json({
            success: true,
            users: formattedUsers,
            pagination: {
                page: currentPage,
                limit: perPage,
                total: totalUsers,
                totalPages: Math.ceil(
                    totalUsers / perPage
                ),
            },
        });
    } catch (error) {
        console.error(
            "Get Users Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to fetch users",
        });
    }
};


/* =========================================
   GET USER STATS
========================================= */

const getUserStats = async (
    req,
    res
) => {
    try {
        const [
            totalUsers,
            activeUsers,
            inactiveUsers,
            adminUsers,
            citizenUsers,
            fieldOfficerUsers,
            departmentOfficerUsers,
        ] = await Promise.all([
            User.countDocuments(),

            User.countDocuments({
                isActive: true,
            }),

            User.countDocuments({
                isActive: false,
            }),

            User.countDocuments({
                role: "admin",
            }),

            User.countDocuments({
                role: "citizen",
            }),

            User.countDocuments({
                role: "field_officer",
            }),

            User.countDocuments({
                role: "department_officer",
            }),
        ]);

        return res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                activeUsers,
                inactiveUsers,
                adminUsers,
                citizenUsers,
                fieldOfficerUsers,
                departmentOfficerUsers,
            },
        });
    } catch (error) {
        console.error(
            "Get User Stats Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to fetch user statistics",
        });
    }
};


/* =========================================
   GET USER BY ID
========================================= */

const getUserById = async (
    req,
    res
) => {
    try {
        const { id } = req.params;

        if (
            !mongoose.Types.ObjectId.isValid(
                id
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid user ID",
            });
        }

        const user =
            await User.findById(id)
                .select("-password")
                .lean();

        if (!user) {
            return res.status(404).json({
                success: false,
                message:
                    "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role,
                status: user.isActive
                    ? "Active"
                    : "Inactive",
                profileImage:
                    user.profileImage ||
                    null,
                createdAt:
                    user.createdAt,
                updatedAt:
                    user.updatedAt,
                lastLogin:
                    user.lastLogin ||
                    null,
            },
        });
    } catch (error) {
        console.error(
            "Get User Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to fetch user details",
        });
    }
};


/* =========================================
   UPDATE USER ROLE
========================================= */

const updateUserRole = async (
    req,
    res
) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        const allowedRoles = [
            "admin",
            "citizen",
            "field_officer",
            "department_officer",
        ];

        if (
            !mongoose.Types.ObjectId.isValid(
                id
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid user ID",
            });
        }

        if (
            !allowedRoles.includes(role)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid user role",
            });
        }

        const user =
            await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message:
                    "User not found",
            });
        }

        /* Prevent changing own role */

        if (
            req.user._id.toString() ===
            user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You cannot change your own role",
            });
        }

        /* Only Super Admin can assign Admin role */

        if (
            role === "admin" &&
            req.user.role !== "super_admin"
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Only Super Admin can assign Admin role",
            });
        }

        /* Prevent Admin from changing another Admin */

        if (
            req.user.role === "admin" &&
            user.role === "admin"
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Admin cannot change another Admin role",
            });
        }

        // AUDIT LOG: Capture the previous role.
        const previousRole = user.role;

        user.role = role;

        await user.save();

        // AUDIT LOG: Record successful role changes.
        if (previousRole !== role) {
            try {
                await AuditLog.create({
                    actor: req.user?._id || null,
                    actorName:
                        req.user?.name ||
                        req.user?.username ||
                        "System",
                    actorEmail:
                        req.user?.email || "",
                    action: "USER_ROLE_UPDATED",
                    resource: "User",
                    resourceId: user._id.toString(),
                    description:
                        `User role changed from ${previousRole} to ${role}`,
                    status: "success",
                    ipAddress: req.ip || "",
                    userAgent:
                        req.get("user-agent") || "",
                    metadata: {
                        targetUserId:
                            user._id.toString(),
                        targetUserName: user.name,
                        targetUserEmail: user.email,
                        previousRole,
                        newRole: role,
                    },
                });
            } catch (auditError) {
                console.error(
                    "User Role Audit Log Error:",
                    auditError.message
                );
            }
        }

        return res.status(200).json({
            success: true,
            message:
                "User role updated successfully",
            user: {
                id: user._id,
                name: user.name,
                username:
                    user.username,
                email: user.email,
                role: user.role,
                status: user.isActive
                    ? "Active"
                    : "Inactive",
            },
        });
    } catch (error) {
        console.error(
            "Update User Role Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to update user role",
        });
    }
};


/* =========================================
   UPDATE USER STATUS
========================================= */

const updateUserStatus = async (
    req,
    res
) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        if (
            !mongoose.Types.ObjectId.isValid(
                id
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid user ID",
            });
        }

        if (
            typeof isActive !==
            "boolean"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "isActive must be true or false",
            });
        }

        const user =
            await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message:
                    "User not found",
            });
        }

        /* Prevent self deactivation */

        if (
            req.user._id.toString() ===
            user._id.toString() &&
            isActive === false
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "You cannot deactivate your own account",
            });
        }

        // AUDIT LOG: Capture the previous status.
        const previousStatus = user.isActive;

        user.isActive = isActive;

        await user.save();

        // AUDIT LOG: Record actual status changes.
        if (previousStatus !== isActive) {
            try {
                await AuditLog.create({
                    actor: req.user?._id || null,
                    actorName:
                        req.user?.name ||
                        req.user?.username ||
                        "System",
                    actorEmail:
                        req.user?.email || "",
                    action: isActive
                        ? "USER_ACTIVATED"
                        : "USER_DEACTIVATED",
                    resource: "User",
                    resourceId: user._id.toString(),
                    description:
                        `User ${isActive ? "activated" : "deactivated"}: ${user.name || user.email}`,
                    status: "success",
                    ipAddress: req.ip || "",
                    userAgent:
                        req.get("user-agent") || "",
                    metadata: {
                        targetUserId:
                            user._id.toString(),
                        targetUserName: user.name,
                        targetUserEmail: user.email,
                        previousStatus,
                        newStatus: isActive,
                    },
                });
            } catch (auditError) {
                console.error(
                    "User Status Audit Log Error:",
                    auditError.message
                );
            }
        }

        return res.status(200).json({
            success: true,
            message: isActive
                ? "User activated successfully"
                : "User deactivated successfully",
            user: {
                id: user._id,
                name: user.name,
                username:
                    user.username,
                email: user.email,
                role: user.role,
                status: user.isActive
                    ? "Active"
                    : "Inactive",
            },
        });
    } catch (error) {
        console.error(
            "Update User Status Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to update user status",
        });
    }
};


/* =========================================
   DELETE USER
========================================= */

const deleteUser = async (
    req,
    res
) => {
    try {
        const { id } = req.params;

        if (
            !mongoose.Types.ObjectId.isValid(
                id
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid user ID",
            });
        }

        /* Prevent self deletion */

        if (
            req.user._id.toString() ===
            id
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "You cannot delete your own account",
            });
        }

        const user =
            await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message:
                    "User not found",
            });
        }

        /* Prevent deleting Admin */

        if (user.role === "admin") {
            return res.status(403).json({
                success: false,
                message:
                    "Admin accounts cannot be deleted",
            });
        }

        await User.findByIdAndDelete(id);

        // AUDIT LOG: Record the deleted user's details.
        try {
            await AuditLog.create({
                actor: req.user?._id || null,
                actorName:
                    req.user?.name ||
                    req.user?.username ||
                    "System",
                actorEmail:
                    req.user?.email || "",
                action: "USER_DELETED",
                resource: "User",
                resourceId: user._id.toString(),
                description:
                    `User deleted: ${user.name || user.email}`,
                status: "success",
                ipAddress: req.ip || "",
                userAgent:
                    req.get("user-agent") || "",
                metadata: {
                    targetUserId:
                        user._id.toString(),
                    targetUserName: user.name,
                    targetUserEmail: user.email,
                    targetUserRole: user.role,
                },
            });
        } catch (auditError) {
            console.error(
                "User Delete Audit Log Error:",
                auditError.message
            );
        }

        return res.status(200).json({
            success: true,
            message:
                "User deleted successfully",
        });
    } catch (error) {
        console.error(
            "Delete User Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to delete user",
        });
    }
};


module.exports = {
    getUsers,
    getUserStats,
    getUserById,
    updateUserRole,
    updateUserStatus,
    deleteUser,
};