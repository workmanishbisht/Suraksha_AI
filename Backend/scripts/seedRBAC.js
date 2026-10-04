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
        description: "Manage permissions",
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
            "roles.read",
            "permissions.read",
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

        const permissionMap = {};

        // Create or update permissions
        for (const permissionData of permissions) {
            const permission = await Permission.findOneAndUpdate(
                { name: permissionData.name },
                permissionData,
                {
                    new: true,
                    upsert: true,
                    setDefaultsOnInsert: true,
                }
            );

            permissionMap[permission.name] = permission._id;
        }

        // Create or update roles
        for (const roleData of roles) {
            const permissionIds = roleData.permissions.map(
                (permissionName) => permissionMap[permissionName]
            );

            await Role.findOneAndUpdate(
                { name: roleData.name },
                {
                    name: roleData.name,
                    description: roleData.description,
                    permissions: permissionIds,
                },
                {
                    new: true,
                    upsert: true,
                    setDefaultsOnInsert: true,
                }
            );
        }

        console.log("RBAC seeded successfully");
        console.log(`Permissions: ${permissions.length}`);
        console.log(`Roles: ${roles.length}`);

        console.log("\nRoles:");
        roles.forEach((role) => {
            console.log(`- ${role.name}`);
        });

        await mongoose.connection.close();

        console.log("\nMongoDB connection closed");
        process.exit(0);
    } catch (error) {
        console.error("RBAC seed error:", error);

        await mongoose.connection.close();

        process.exit(1);
    }
};

seedRBAC();