import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Order } from "../models/order.model.js";

export const createOrder = asyncHandler(async (req, res) => {
    console.log('📦 CREATE ORDER CALLED');
    console.log('📦 Request Body:', req.body);
    console.log('📦 User:', req.user);

    const { items, restaurantId, totalAmount, paymentMethod, country } = req.body;

    if (!items || items.length === 0) {
        throw new ApiError(400, "Order items required");
    }

    if (!restaurantId) {
        throw new ApiError(400, "Restaurant ID is required");
    }

    console.log('📦 Items:', items);
    console.log('📦 Restaurant ID:', restaurantId);

    const orderCountry = country || req.user?.country || "INDIA";

    console.log('📦 Order Country:', orderCountry);

    try {
        const order = await Order.create({
            user: req.user._id,
            restaurant: restaurantId,
            items: items.map(item => ({
                product: item.menuItemId,
                quantity: item.quantity,
                price: item.price
            })),
            totalAmount,
            paymentMethod: paymentMethod || "CARD",
            country: orderCountry
        });

        console.log('✅ Order created:', order);

        const populatedOrder = await Order.findById(order._id)
            .populate("restaurant")
            .populate("items.product");

        console.log('✅ Populated order:', populatedOrder);

        return res.status(201).json(
            // ✅ Fixed: (statusCode, data, message)
            new ApiResponse(201, populatedOrder, "Order created successfully")
        );
    } catch (error) {
        console.error('❌ Error creating order:', error);
        throw error;
    }
});

/*
MARK ORDER AS PAID
*/
export const placeOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const order = await Order.findOne({
        _id: orderId,
        user: req.user._id
    });

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    if (order.status !== "CREATED") {
        throw new ApiError(400, "Order already processed");
    }

    order.status = "PAID";
    await order.save();

    return res.status(200).json(
        // ✅ Fixed: (statusCode, data, message)
        new ApiResponse(200, order, "Order paid successfully")
    );
});

/*
CANCEL ORDER
*/
export const cancelOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const order = await Order.findOne({
        _id: orderId,
        user: req.user._id
    });

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    if (order.status === "PAID") {
        throw new ApiError(400, "Paid order cannot be cancelled");
    }

    order.status = "CANCELLED";
    await order.save();

    return res.status(200).json(
        // ✅ Fixed: (statusCode, data, message)
        new ApiResponse(200, order, "Order cancelled successfully")
    );
});

/*
GET MY ORDERS
*/
export const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({
        user: req.user._id
    })
        .populate("restaurant")
        .populate("items.product");

    return res.status(200).json(
        // ✅ Fixed: (statusCode, data, message)
        new ApiResponse(200, orders, "Orders fetched")
    );
});

/*
ADMIN / MANAGER - GET ALL ORDERS
*/
export const getAllOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find()
        .populate("user", "name email")
        .populate("restaurant");

    return res.status(200).json(
        // ✅ Fixed: (statusCode, data, message)
        new ApiResponse(200, orders, "All orders fetched")
    );
});

/*
GET ORDER BY ID
*/
export const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.orderId)
        .populate("items.product")
        .populate("restaurant");

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    return res.status(200).json(
        // ✅ Fixed: (statusCode, data, message)
        new ApiResponse(200, order, "Order fetched")
    );
});

/*
UPDATE PAYMENT METHOD (ADMIN ONLY)
*/
export const updatePaymentMethod = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { paymentMethod } = req.body;

    const validMethods = ["CARD", "UPI", "CASH"];
    if (!validMethods.includes(paymentMethod)) {
        throw new ApiError(400, "Invalid payment method");
    }

    const order = await Order.findById(orderId);

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    order.paymentMethod = paymentMethod;
    await order.save();

    return res.status(200).json(
        // ✅ Fixed: (statusCode, data, message)
        new ApiResponse(200, order, "Payment method updated successfully")
    );
});