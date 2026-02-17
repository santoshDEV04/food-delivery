import mongoose from "mongoose";
import { Payment } from "../models/payment.model.js";

const payment = async () => {
    try {
        console.log("🌱 Seeding hard-coded payments...");

        await Payment.deleteMany();

        const payments = [
            {
                order: new mongoose.Types.ObjectId("65ff11111111111111111111"),
                user: new mongoose.Types.ObjectId("65ff22222222222222222222"),
                amount: 450,
                currency: "INR",
                paymentMethod: "UPI",
                paymentStatus: "SUCCESS",
                transactionId: "TXN_UPI_001",
                gateway: "RAZORPAY",
                gatewayResponse: { status: "success" },
                paidAt: new Date()
            },
            {
                order: new mongoose.Types.ObjectId("65ff33333333333333333333"),
                user: new mongoose.Types.ObjectId("65ff44444444444444444444"),
                amount: 299,
                currency: "INR",
                paymentMethod: "CARD",
                paymentStatus: "SUCCESS",
                transactionId: "TXN_CARD_002",
                gateway: "STRIPE",
                gatewayResponse: { status: "success" },
                paidAt: new Date()
            },
            {
                order: new mongoose.Types.ObjectId("65ff55555555555555555555"),
                user: new mongoose.Types.ObjectId("65ff22222222222222222222"),
                amount: 199,
                currency: "INR",
                paymentMethod: "NET_BANKING",
                paymentStatus: "FAILED",
                transactionId: "TXN_NB_003",
                gateway: "PAYTM",
                gatewayResponse: { error: "Insufficient balance" }
            },
            {
                order: new mongoose.Types.ObjectId("65ff66666666666666666666"),
                user: new mongoose.Types.ObjectId("65ff77777777777777777777"),
                amount: 599,
                currency: "INR",
                paymentMethod: "COD",
                paymentStatus: "PENDING",
                gateway: "CASH"
            },
            {
                order: new mongoose.Types.ObjectId("65ff88888888888888888888"),
                user: new mongoose.Types.ObjectId("65ff44444444444444444444"),
                amount: 120,
                currency: "INR",
                paymentMethod: "WALLET",
                paymentStatus: "SUCCESS",
                transactionId: "TXN_WALLET_005",
                gateway: "PAYTM",
                paidAt: new Date()
            }
        ];

        await Payment.insertMany(payments);

        console.log("✅ Hard-coded payments seeded successfully");
    } catch (error) {
        console.error("❌ Payment seeding failed:", error.message);
    }
};

export default payment
