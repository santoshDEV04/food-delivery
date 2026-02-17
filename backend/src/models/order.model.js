import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        restaurant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Resturant",
            required: true
        },

        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "MenuItem", // ✅ Fixed: was "Product", model is actually "MenuItem"
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true
                },
                price: {
                    type: Number,
                    required: true
                }
            }
        ],

        status: {
            type: String,
            enum: ["CREATED", "PAID", "CANCELLED"],
            default: "CREATED"
        },

        totalAmount: {
            type: Number,
            required: true
        },

        paymentMethod: {
            type: String,
            enum: ["CARD", "UPI", "CASH"],
            default: "CARD"
        },

        country: {
            type: String,
            enum: ["INDIA", "AMERICA"],
            required: true
        }
    },
    {
        timestamps: true
    }
);

export const Order = mongoose.model("Order", OrderSchema);