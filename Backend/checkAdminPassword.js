require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

async function checkPassword() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const user = await User.findOne({
            username: "surakshaai_admin",
        }).select("+password");

        if (!user) {
            console.log("Admin user not found");
            return;
        }

        console.log("User found:", user.username);
        console.log("Hash format:", user.password?.slice(0, 7));
        console.log(
            "Password hash looks valid:",
            /^\$2[aby]\$\d{2}\$/.test(user.password || "")
        );

        // Password yahan terminal prompt se enter karna hai.
        const readline = require("readline");

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        rl.question("Enter your current password: ", async (password) => {
            const valid = await bcrypt.compare(password, user.password);
            console.log("Password matches database:", valid);
            rl.close();
            await mongoose.disconnect();
        });
    } catch (error) {
        console.error(error.message);
        await mongoose.disconnect();
    }
}

checkPassword();