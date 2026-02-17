import { axiosInstance } from "./axios";

export const createRestaurant = async (data) => {
    const res = await axiosInstance.post("/resturants", data);
    return res.data.data;
};

export const updateRestaurant = async (id, data) => {
    const res = await axiosInstance.put(`/resturants/${id}`, data);
    return res.data.data;
};

export const deleteRestaurant = async (id) => {
    const res = await axiosInstance.delete(`/resturants/${id}`);
    return res.data.data;
};
