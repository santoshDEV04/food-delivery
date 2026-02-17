import mongoose, { Schema } from "mongoose";

const paymentSchema = new Schema(
    {
        order: {
            type: Schema.Types.ObjectId,
            ref: "Order",
            required: true
        },

        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        amount: {
            type: Number,
            required: true
        },

        currency: {
            type: String,
            default: "INR"
        },

        paymentMethod: {
            type: String,
            enum: ["CARD", "UPI", "NET_BANKING", "COD", "WALLET"],
            required: true
        },

        paymentStatus: {
            type: String,
            enum: ["PENDING", "SUCCESS", "FAILED", "REFUNDED"],
            default: "PENDING"
        },

        transactionId: {
            type: String,
            unique: true,
            sparse: true
        },

        gateway: {
            type: String,
            enum: ["RAZORPAY", "STRIPE", "PAYTM", "CASH"],
            required: true
        },

        gatewayResponse: {
            type: Object
        },

        paidAt: {
            type: Date
        }
    },
    { timestamps: true }
);

export const Payment = mongoose.model("Payment", paymentSchema);
