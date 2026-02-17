import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import {
    createMenuItem,
    updateMenuItem,
    deleteMenuItem
} from "../controllers/menu.controller.js";

const router = Router();

// Create menu item
router.post(
    "/:resturantId",
    verifyJWT,
    authorizeRoles("ADMIN"),
    createMenuItem
);

// Update menu item
router.put(
    "/item/:menuId",
    verifyJWT,
    authorizeRoles("ADMIN"),
    updateMenuItem
);

// Delete menu item
router.delete(
    "/item/:menuId",
    verifyJWT,
    authorizeRoles("ADMIN"),
    deleteMenuItem
);

export default router;
