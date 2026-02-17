import mongoose from "mongoose";
import { Resturant } from "../models/resturant.model.js";
import { MenuItem } from "../models/menuItem.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * View all restaurants with menus (optimized)
 */
export const viewResturantsAndMenu = asyncHandler(async (req, res) => {
    const userCountry = req.user.country;

    const resturants = await Resturant.find({
        country: userCountry,
        isActive: true
    }).populate("manager", "name email");

    const resturantIds = resturants.map(r => r._id);

    const menus = await MenuItem.find({
        resturant: { $in: resturantIds },
        isAvailable: true
    });

    const resturantsWithMenu = resturants.map(resturant => {
        const menu = menus.filter(
            m => m.resturant.toString() === resturant._id.toString()
        );

        return {
            ...resturant.toObject(),
            menu
        };
    });

    res.status(200).json(
        new ApiResponse(200, resturantsWithMenu, "Restaurants fetched successfully")
    );
});


/**
 * Get single restaurant by ID with its menu
 */
export const getResturantById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid restaurant ID");
    }

    // ✅ Fixed: removed country filter so any authenticated user can fetch by ID
    const resturant = await Resturant.findOne({
        _id: id,
        isActive: true
    }).populate("manager", "name email");

    if (!resturant) {
        throw new ApiError(404, "Restaurant not found");
    }

    const menu = await MenuItem.find({
        resturant: id,
        isAvailable: true
    });

    res.status(200).json(
        new ApiResponse(
            200,
            { ...resturant.toObject(), menu },
            "Restaurant fetched successfully"
        )
    );
});


/**
 * Create restaurant
 */
export const createResturant = asyncHandler(async (req, res) => {
    const { name, country, address, manager } = req.body;

    if (!name || !country || !address || !manager) {
        throw new ApiError(400, "All fields are required");
    }

    if (!mongoose.Types.ObjectId.isValid(manager)) {
        throw new ApiError(400, "Invalid manager ID");
    }

    const managerUser = await User.findById(manager);

    if (!managerUser) {
        throw new ApiError(404, "Manager not found");
    }

    if (managerUser.role !== "MANAGER") {
        throw new ApiError(400, "Assigned user is not a manager");
    }

    if (managerUser.country !== country) {
        throw new ApiError(400, "Manager country must match restaurant country");
    }

    const resturant = await Resturant.create({
        name,
        country,
        address,
        manager
    });

    res.status(201).json(
        new ApiResponse(201, resturant, "Restaurant created successfully")
    );
});


/**
 * Update restaurant (secure)
 */
export const updateResturant = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userCountry = req.user.country;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid restaurant ID");
    }

    const resturant = await Resturant.findOne({
        _id: id,
        country: userCountry,
        isActive: true
    });

    if (!resturant) {
        throw new ApiError(404, "Restaurant not found or not accessible");
    }

    if (req.body.country && req.body.country !== resturant.country) {
        throw new ApiError(400, "Country cannot be changed");
    }

    if (req.body.manager) {
        if (!mongoose.Types.ObjectId.isValid(req.body.manager)) {
            throw new ApiError(400, "Invalid manager ID");
        }

        const managerUser = await User.findById(req.body.manager);

        if (!managerUser) {
            throw new ApiError(404, "Manager not found");
        }

        if (managerUser.role !== "MANAGER") {
            throw new ApiError(400, "Assigned user is not a manager");
        }

        if (managerUser.country !== resturant.country) {
            throw new ApiError(400, "Manager country must match restaurant country");
        }
    }

    const updatedResturant = await Resturant.findByIdAndUpdate(
        id,
        req.body,
        { new: true }
    );

    res.status(200).json(
        new ApiResponse(200, updatedResturant, "Restaurant updated successfully")
    );
});


/**
 * Soft delete restaurant
 */
export const deleteResturant = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userCountry = req.user.country;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid restaurant ID");
    }

    const resturant = await Resturant.findOne({
        _id: id,
        country: userCountry,
        isActive: true
    });

    if (!resturant) {
        throw new ApiError(404, "Restaurant not found or not accessible");
    }

    resturant.isActive = false;
    await resturant.save();

    res.status(200).json(
        new ApiResponse(200, null, "Restaurant deactivated successfully")
    );
});