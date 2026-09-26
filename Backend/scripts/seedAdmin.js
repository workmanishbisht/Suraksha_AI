const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const User = require("../models/User");

dotenv.config();

const createAdmin = async () => {
    try {
        await connectDB();

        const existingAdmin = await User.findOne({
            username: "surakshaai_admin",
        });

        if (existingAdmin) {
            console.log("Admin user already exists.");
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(
            process.env.ADMIN_PASSWORD,
            12
        );

        const admin = await User.create({
            name: "SurakshaAI Admin",
            username: "surakshaai_admin",
            password: hashedPassword,
            role: "admin",
            isActive: true,
        });

        console.log("Admin user created successfully.");
        console.log(`Admin Username: ${admin.username}`);

        process.exit(0);
    } catch (error) {
        console.error(`Admin creation failed: ${error.message}`);
        process.exit(1);
    }
};

createAdmin();