import dotenv from "dotenv";
import { Order } from "../models/order.model.js";
import { User } from "../models/user.model.js";
import { Resturant } from "../models/resturant.model.js";
import { Product } from "../models/product.model.js";

dotenv.config();

const seedOrders = async () => {
    try {
        if (process.env.NODE_ENV === "production") {
            throw new Error("Seeding not allowed in production");
        }

        await Order.deleteMany({});

        const user = await User.findOne({ role: "MEMBER" });
        if (!user) throw new Error("❌ MEMBER user not found");

        const resturant = await Resturant.findOne({ name: "Spicy Hub" });
        if (!resturant) throw new Error("❌ No restaurant found");

        const products = await Product.find({ resturant: resturant._id });
        if (!products.length) throw new Error("❌ No products found for this restaurant");

        const items = [
            { product: products[0]._id, quantity: 2 },
            { product: products[1]?._id || products[0]._id, quantity: 1 },
        ];

        const totalAmount = items.reduce((sum, item) => {
            const product = products.find(p => p._id.equals(item.product));
            return sum + product.price * item.quantity;
        }, 0);

        const orders = [
            {
                user: user._id,
                resturant: resturant._id,
                items,
                totalAmount,
                status: "CREATED",
                paymentMethod: "UPI",
                country: resturant.country,
            },
        ];

        await Order.insertMany(orders);

        console.log("📦 Orders seeded successfully");
    } catch (error) {
        console.error("❌ Order seeding failed");
        console.error(error); // 👈 FULL error
    }
};

export default seedOrders;