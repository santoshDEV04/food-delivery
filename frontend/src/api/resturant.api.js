import { axiosInstance } from "./axios";

// Helper to extract data from API response
const extractData = (response) => {
    return response.data.data || response.data || null;
};

// Get all restaurants
export const getRestaurants = async () => {
    const res = await axiosInstance.get("/resturants");
    return extractData(res) || [];
};

// Get menu items for a restaurant
export const getMenuItems = async (restaurantId) => {
    const res = await axiosInstance.get(`/resturants/${restaurantId}`);
    const data = extractData(res);
    return data?.menu || [];
};

// Create a new order
export const createOrder = async (orderData) => {
    const res = await axiosInstance.post("/orders", orderData);
    return extractData(res);
};

// Place order (checkout & pay)
export const placeOrder = async (orderId, paymentData) => {
    const res = await axiosInstance.post(`/orders/${orderId}/place`, paymentData);
    return extractData(res);
};

// Get user's orders
export const getUserOrders = async () => {
    const res = await axiosInstance.get("/orders/my-orders");
    const data = extractData(res);
    return Array.isArray(data) ? data : (data?.orders ?? data?.data ?? []);
};

// Cancel order
export const cancelOrder = async (orderId) => {
    const res = await axiosInstance.delete(`/orders/${orderId}`);
    return extractData(res);
};

// Update payment method (Admin only)
export const updatePaymentMethod = async (orderId, paymentMethod) => {
    const res = await axiosInstance.patch(`/orders/${orderId}/payment`, { paymentMethod });
    return extractData(res);
};