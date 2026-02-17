import dotenv from "dotenv";
import connectDB from "../db/DBconn.js";
import { MenuItem } from "../models/menuItem.model.js";
import { Resturant } from "../models/resturant.model.js";

dotenv.config();

const seedMenuItems = async () => {
    try {
        if (process.env.NODE_ENV === "production") {
            throw new Error("Seeding not allowed in production");
        }

        await MenuItem.deleteMany({});

        const restaurants = await Resturant.find();

        if (!restaurants.length) {
            throw new Error("No restaurants found. Seed restaurants first.");
        }

        const menuItems = [];

        for (const restaurant of restaurants) {
            if (restaurant.country === "INDIA") {
                menuItems.push(
                    {
                        resturant: restaurant._id,
                        name: "Chicken Biryani",
                        description: "Slow-cooked basmati rice with spiced chicken",
                        price: 250,
                        isAvailable: true,
                    },
                    {
                        resturant: restaurant._id,
                        name: "Paneer Butter Masala",
                        description: "Creamy paneer curry in tomato gravy",
                        price: 220,
                    }
                );
            }

            if (restaurant.country === "AMERICA") {
                menuItems.push(
                    {
                        resturant: restaurant._id,
                        name: "Classic Cheeseburger",
                        description: "Grilled beef patty with cheddar cheese",
                        price: 12,
                        isAvailable: true,
                    },
                    {
                        resturant: restaurant._id,
                        name: "French Fries",
                        description: "Crispy golden potato fries",
                        price: 5,
                    }
                );
            }
        }

        await MenuItem.insertMany(menuItems);

        console.log("📋 Menu items seeded successfully");
    } catch (error) {
        console.error("❌ Menu item seeding failed:", error.message);
    }
};

export default seedMenuItems
