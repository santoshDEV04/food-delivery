import { asyncHandler } from "../utils/asyncHandler.js";
import {User} from "../models/user.model.js";
import {ApiError} from "../utils/ApiError.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, _, next) => {
    const token =
        req.cookies?.accessToken ||
        req.headers.authorization?.split(" ")[1];

    if (!token) {
        throw new ApiError(401, "Unauthorized request");
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch {
        throw new ApiError(401, "Invalid or expired token");
    }

    const user = await User.findById(decoded.userId)
        .select("-password -refreshToken");

    if (!user) {
        throw new ApiError(401, "User not found");
    }

    req.user = user;
    next();
});
