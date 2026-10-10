
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Permission = require("../models/Permission");
const Role = require("../models/Role");

dotenv.config();

const permissions = [
    // Users
    {
        name: "users.create",
        resource: "users",
        action: "create",
        description: "Create new users",
    },
    {
        name: "users.read",
        resource: "users",
        action: "read",
        description: "View users",
    },
    {
        name: "users.update",
        resource: "users",
        action: "update",
        description: "Update user details",
    },
    {
        name: "users.delete",
        resource: "users",
        action: "delete",
        description: "Delete users",
    },

    // Roles
    {
        name: "roles.read",
        resource: "roles",
        action: "read",
        description: "View available roles",
    },
    {
        name: "roles.update",
        resource: "roles",
        action: "update",
        description: "Update user roles",
    },

    // Permissions
    {
        name: "permissions.read",
        resource: "permissions",
        action: "read",
        description: "View permissions",
    },
    {
        name: "permissions.update",
        resource: "permissions",
        action: "update",
        description: "Manage role permissions",
    },
];

const roles = [
    {
        name: "admin",
        description: "Administrative access",
        permissions: [
            "users.create",
            "users.read",
            "users.update",
            "users.delete",
            "roles.read",
            "roles.update",
            "permissions.read",
            "permissions.update",
        ],
    },
    {
        name: "citizen",
        description: "Citizen access",
        permissions: [
            "users.read",
        ],
    },
    {
        name: "field_officer",
        description: "Field officer access",
        permissions: [
            "users.read",
        ],
    },
    {
        name: "department_officer",
        description: "Department officer access",
        permissions: [
            "users.read",
            "users.update",
        ],
    },
];

const seedRBAC = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is not defined in .env");
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");

        const permissionMap = new Map();

        // Create or update permissions
        for (const permissionData of permissions) {
            const permission = await Permission.findOneAndUpdate(
                { name: permissionData.name },
                {
                    $set: {
                        resource: permissionData.resource,
                        action: permissionData.action,
                        description: permissionData.description,
                    },
                    $setOnInsert: {
                        name: permissionData.name,
                    },
                },
                {
                    new: true,
                    upsert: true,
                    runValidators: true,
                    setDefaultsOnInsert: true,
                }
            );

            permissionMap.set(permission.name, permission._id);
        }

        // Validate permission references before changing roles
        for (const roleData of roles) {
            for (const permissionName of roleData.permissions) {
                if (!permissionMap.has(permissionName)) {
                    throw new Error(
                        `Permission not found: ${permissionName}`
                    );
                }
            }
        }

        // Create or update role permissions
        for (const roleData of roles) {
            const permissionIds = roleData.permissions.map(
                (permissionName) => permissionMap.get(permissionName)
            );

            await Role.findOneAndUpdate(
                { name: roleData.name },
                {
                    $set: {
                        description: roleData.description,
                        permissions: permissionIds,
                    },
                    $setOnInsert: {
                        name: roleData.name,
                    },
                },
                {
                    new: true,
                    upsert: true,
                    runValidators: true,
                    setDefaultsOnInsert: true,
                }
            );

            console.log(
                `Updated role: ${roleData.name} (${permissionIds.length} permissions)`
            );
        }

        console.log("\nRBAC seeded successfully");
        console.log(`Permissions processed: ${permissions.length}`);
        console.log(`Roles processed: ${roles.length}`);

        await mongoose.connection.close();
        console.log("MongoDB connection closed");

        process.exit(0);
    } catch (error) {
        console.error("RBAC seed error:", error);

        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }

        process.exit(1);
    }
};

seedRBAC();
