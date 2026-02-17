import { axiosInstance } from "./axios";

// Helper to extract data from API response
const extractData = (response) => {
    return response.data.data || response.data || null;
};

// ===== USER MANAGEMENT =====
export const getAllUsers = async () => {
    const res = await axiosInstance.get("/users/all-users");
    return extractData(res) || [];
};

export const deleteUser = async (id) => {
    const res = await axiosInstance.delete(`/users/delete-user/${id}`);
    return extractData(res);
};

export const createManager = async (data) => {
    const res = await axiosInstance.post("/users/create-manager", data);
    return extractData(res);
};

// ===== RESTAURANT MANAGEMENT =====
export const getRestaurants = async () => {
    const res = await axiosInstance.get("/resturants");
    return extractData(res) || [];
};

export const getMenuItems = async (restaurantId) => {
    const res = await axiosInstance.get(`/resturants/${restaurantId}`);
    const data = extractData(res);
    return data?.menu || [];
};

// ===== MENU ITEM MANAGEMENT =====
export const createMenuItem = async (restaurantId, data) => {
    const res = await axiosInstance.post(`/menu/${restaurantId}`, data);
    return extractData(res);
};

export const updateMenuItem = async (menuId, data) => {
    const res = await axiosInstance.put(`/menu/item/${menuId}`, data);
    return extractData(res);
};

export const deleteMenuItem = async (menuId) => {
    const res = await axiosInstance.delete(`/menu/item/${menuId}`);
    return extractData(res);
};

// ===== ORDER MANAGEMENT =====
export const getAllOrders = async () => {
    const res = await axiosInstance.get("/orders/all");
    return extractData(res) || [];
};

export const createOrder = async (orderData) => {
    const res = await axiosInstance.post("/orders", orderData);
    return extractData(res);
};

export const placeOrder = async (orderId, paymentData) => {
    const res = await axiosInstance.post(`/orders/${orderId}/place`, paymentData);
    return extractData(res);
};

export const cancelOrder = async (orderId) => {
    const res = await axiosInstance.delete(`/orders/${orderId}`);
    return extractData(res);
};

export const updatePaymentMethod = async (orderId, paymentMethod) => {
    const res = await axiosInstance.patch(`/orders/${orderId}/payment`, { paymentMethod });
    return extractData(res);
};