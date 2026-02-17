import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../db/DBconn.js";
import { Resturant } from "../models/resturant.model.js";
import { User } from "../models/user.model.js";

dotenv.config();

const seedRestaurants = async () => {
    try {
        if (process.env.NODE_ENV === "production") {
            throw new Error("Seeding not allowed in production");
        }

        await Resturant.deleteMany({});

        // Get managers by country
        const indiaManager = await User.findOne({
            role: "MANAGER",
            country: "INDIA"
        });

        const americaManager = await User.findOne({
            role: "MANAGER",
            country: "AMERICA"
        });

        if (!indiaManager || !americaManager) {
            throw new Error("Managers for both countries must exist. Seed users first.");
        }

        const restaurants = [
            {
                name: "Spicy Hub",
                address: "Bangalore, Karnataka",
                country: "INDIA",
                manager: indiaManager._id,
            },
            {
                name: "Burger Town",
                address: "New York, USA",
                country: "AMERICA",
                manager: americaManager._id,
            },
        ];

        await Resturant.insertMany(restaurants);

        console.log("🏪 Restaurants seeded successfully");
    } catch (error) {
        console.error("❌ Restaurant seeding failed:", error.message);
    }
};

export default seedRestaurants