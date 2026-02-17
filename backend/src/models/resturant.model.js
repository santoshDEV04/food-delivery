import mongoose from "mongoose";

const resturantSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        address: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true,
            enum: ["INDIA", "AMERICA"]
        },
        isActive: {
            type: Boolean,
            default: true
        },
        manager: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    { timestamps: true }
);

export const Resturant = mongoose.model("Resturant", resturantSchema);
