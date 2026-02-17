import { axiosInstance } from "./axios";

export const login = async (data) => {
    const response = await axiosInstance.post("/users/login", data);
    return response.data;
};


export const register = async (data) => {
    const response = await axiosInstance.post("/register", data);
    return response.data;
};


export const logout = async () => {
    const response = await axiosInstance.post("/users/logout");
    return response.data;
}