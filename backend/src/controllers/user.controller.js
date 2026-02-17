import mongoose from 'mongoose';
import { User } from '../models/user.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import jwt from 'jsonwebtoken';
import { Resturant } from '../models/resturant.model.js';
import { MenuItem } from '../models/menuItem.model.js';

const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Error generating tokens");
    }
}

export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        throw new ApiError(400, "All fields are required");
    }

    const existingUser = await User.findOne({
        email: email,
    })

    if (existingUser) {
        throw new ApiError(409, "User with this email already exists");
    }

    const user = await User.create({
        name,
        email,
        password,
        role
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    res.status(201).json(new ApiResponse(true, "User registered successfully", createdUser))
})

export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required!");
    }

    const user = await User.findOne({ email }).select("+password +refreshToken");

    if (!user) {
        throw new ApiError(401, "Invalid email or password!");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password)

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid email or password");
    }

    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    }

    res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(true, "User logged in successfully", {
                user: loggedInUser,
                accessToken,
                refreshToken
            })
        )
})

export const createManager = asyncHandler(async (req, res) => {
    const { name, email, password, country } = req.body;

    if (!name || !email || !password || !country) {
        throw new ApiError(400, "All fields are required");
    }

    const existingUser = await User.findOne({ email })

    if (existingUser) {
        throw new ApiError(409, "User already exists.")
    }

    const manager = await User.create({
        name,
        email,
        password,
        role: "MANAGER",
        country
    })

    const createdManager = manager.toObject()
    delete createdManager.password;
    delete createdManager.refreshToken;

    res.status(201).json(new ApiResponse(true, "Manager created successfully", createdManager))
})

export const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select("-password -refreshToken");

    res.status(200).json(
        new ApiResponse(200, users || [], "Users fetched successfully.")
    );
});


export const deleteUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (req.user._id.toString() === userId) {
        throw new ApiError(400, "You cannot delete your own account");
    }

    const userToDelete = await User.findById(userId);

    if (!userToDelete) {
        throw new ApiError(404, "User not found");
    }

    await userToDelete.deleteOne();

    res.status(200).json(new ApiResponse(true, "User deleted successfully"))
})

export const logoutUser = asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user) {
        throw new ApiError(400, "User not authenticated");
    }

    const updatedUser = await User.findByIdAndUpdate(
        user._id,
        { refreshToken: undefined },
        { new: true }
    );

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
    }

    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, null, "Logged out successfully"));
})