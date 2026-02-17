import dotenv from "dotenv";
import { User } from "../models/user.model.js";

dotenv.config();

const seedUsers = async () => {
    if (process.env.NODE_ENV === "production") {
        throw new Error("Seeding is not allowed in production");
    }

    try {
        await User.deleteMany({});

        const users = [
            {
                name: "Santosh Kumar Dash",
                email: "dashsantosh2004@gmail.com",
                password: "Admin@123",
                role: "ADMIN",
                country: "INDIA",
            },
            // 🔹 Managers
            {
                name: "Captain Marvel",
                email: "captainmarvel@india.com",
                password: "Manager@123",
                role: "MANAGER",
                country: "INDIA",
            },
            {
                name: "Captain America",
                email: "captainamerica@america.com",
                password: "Manager@123",
                role: "MANAGER",
                country: "AMERICA",
            },

            // 🔹 Team Members
            {
                name: "Thanos",
                email: "thanos@india.com",
                password: "Member@123",
                role: "MEMBER",
                country: "INDIA",
            },
            {
                name: "Thor",
                email: "thor@india.com",
                password: "Member@123",
                role: "MEMBER",
                country: "INDIA",
            },
            {
                name: "Travis",
                email: "travis@america.com",
                password: "Member@123",
                role: "MEMBER",
                country: "AMERICA",
            },
        ];

        await User.create(users);

        console.log("🌱 Users seeded successfully");
    } catch (error) {
        console.error("❌ Seeding failed:", error);
    }
};

export default seedUsers;
