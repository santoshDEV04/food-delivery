import mongoose, {Schema} from 'mongoose';

const ProductSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    resturant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Resturant",
    },
    description: {
        type: String,
        required: true,
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
},
{
    timestamps: true
},
)


export const Product = mongoose.model('Product', ProductSchema);