import { axiosInstance } from "./axios";

export const createMenuItem = async (restaurantId, data) => {
    const res = await axiosInstance.post(`/menu/${restaurantId}`, data);
    return res.data.data;
};

export const updateMenuItem = async (menuId, data) => {
    const res = await axiosInstance.put(`/menu/item/${menuId}`, data);
    return res.data.data;
};

export const deleteMenuItem = async (menuId) => {
    const res = await axiosInstance.delete(`/menu/item/${menuId}`);
    return res.data.data;
};
