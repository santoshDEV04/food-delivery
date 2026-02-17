import "../config/env.js";
import connectDB from "../db/DBconn.js";

import seedUsers from "./user.seed.js";
import seedResturants from "./resturant.seed.js";
import seedMenuItems from "./menuItem.seed.js";
import seedOrders from "./order.seed.js";
import seedProducts from "./product.seed.js";
import payment from "./payment.seed.js";

const seedAll = async () => {
    try {
        await connectDB();

        console.log("Seeding started...");

        await seedUsers();
        await payment();
        await seedResturants();
        await seedProducts();
        await seedMenuItems();
        await seedOrders();

        console.log("Seeding completed.");
        process.exit(0);
    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
};

seedAll();
