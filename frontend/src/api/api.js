import axios from 'axios'
import axiosInstance from './axios.js'

const getResturants = async () => {
    const response = await axiosInstance.get('/resturants')
    return response.data
}

const login = async (loginData) => {
    const response = await axiosInstance.post('/users/login', loginData)
    return response.data
}

export {getResturants, login}