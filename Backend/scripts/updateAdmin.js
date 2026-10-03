const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

const connectDB = require("../config/db");
const User = require("../models/User");

dotenv.config();

const updateAdmin = async () => {
    try {
        await connectDB();

        const admin = await User.findOne({
            role: "admin",
        });

        if (!admin) {
            console.log("No existing admin found.");
            process.exit(1);
        }

        const hashedPassword = await bcrypt.hash(
            process.env.ADMIN_PASSWORD,
            12
        );

        admin.name = "Suraksha AI";
        admin.username = "surakshaai_admin";
        admin.password = hashedPassword;
        admin.role = "admin";
        admin.isActive = true;

        await admin.save();

        console.log("Admin updated successfully.");
        console.log(`Name: ${admin.name}`);
        console.log(`Username: ${admin.username}`);
        console.log(`Email: ${admin.email}`);

        process.exit(0);
    } catch (error) {
        console.error(`Admin update failed: ${error.message}`);
        process.exit(1);
    }
};

updateAdmin();