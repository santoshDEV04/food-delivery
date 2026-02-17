import dotenv from "dotenv";
import { Product } from "../models/product.model.js";
import { Resturant } from "../models/resturant.model.js";

dotenv.config();

const seedProducts = async () => {
    try {
        if (process.env.NODE_ENV === "production") {
            throw new Error("Seeding not allowed in production");
        }

        await Product.deleteMany({});

        const resturant = await Resturant.findOne({ name: "Spicy Hub" });
        if (!resturant) {
            throw new Error("No restaurant found. Seed restaurants first.");
        }

        const products = [
            {
                name: "Chicken Biryani",
                price: 250,
                description: "Authentic hyderabadi chicken biryani",
                resturant: resturant._id,
            },
            {
                name: "Paneer Butter Masala",
                price: 220,
                description: "Creamy paneer curry with rich tomato gravy",
                resturant: resturant._id,
            },
            {
                name: "Veg Fried Rice",
                price: 180,
                description: "Stir fried rice with fresh vegetables",
                resturant: resturant._id,
            },
        ];

        await Product.insertMany(products);

        console.log("🍔 Products seeded successfully");
    } catch (error) {
        console.error("❌ Product seeding failed");
        console.error(error);
        throw error; // 👈 IMPORTANT so seedAll stops
    }
};

export default seedProducts;
