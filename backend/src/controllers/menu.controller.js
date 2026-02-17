import mongoose from "mongoose";
import { MenuItem } from "../models/menuItem.model.js";
import { Resturant } from "../models/resturant.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * Create Menu Item (ADMIN)
 */
export const createMenuItem = asyncHandler(async (req, res) => {
    const { resturantId } = req.params;
    const { name, description, price } = req.body;

    if (!mongoose.Types.ObjectId.isValid(resturantId)) {
        throw new ApiError(400, "Invalid restaurant ID");
    }

    const restaurant = await Resturant.findById(resturantId);
    if (!restaurant) {
        throw new ApiError(404, "Restaurant not found");
    }

    const menuItem = await MenuItem.create({
        resturant: resturantId,
        name,
        description,
        price
    });

    res.status(201).json(
        new ApiResponse(201, menuItem, "Menu item created successfully")
    );
});


/**
 * Update Menu Item (ADMIN)
 */
export const updateMenuItem = asyncHandler(async (req, res) => {
    const { menuId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(menuId)) {
        throw new ApiError(400, "Invalid menu ID");
    }

    const updated = await MenuItem.findByIdAndUpdate(
        menuId,
        req.body,
        { new: true }
    );

    if (!updated) {
        throw new ApiError(404, "Menu item not found");
    }

    res.status(200).json(
        new ApiResponse(200, updated, "Menu updated successfully")
    );
});


/**
 * Delete Menu Item (ADMIN)
 */
export const deleteMenuItem = asyncHandler(async (req, res) => {
    const { menuId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(menuId)) {
        throw new ApiError(400, "Invalid menu ID");
    }

    const menu = await MenuItem.findById(menuId);
    if (!menu) {
        throw new ApiError(404, "Menu item not found");
    }

    await menu.deleteOne();

    res.status(200).json(
        new ApiResponse(200, null, "Menu item deleted successfully")
    );
});
