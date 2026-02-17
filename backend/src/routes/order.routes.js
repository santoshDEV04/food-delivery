import { Router } from "express";
import {
    createOrder,
    placeOrder,
    cancelOrder,
    getMyOrders,
    getAllOrders,
    getOrderById,
    updatePaymentMethod
} from "../controllers/order.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { checkPermission } from "../middlewares/authorize.middleware.js";
import { countryFilter } from "../middlewares/countryFilter.middleware.js";

const router = Router();

// ✅ IMPORTANT: Specific routes BEFORE parameterized routes

// Get all orders (admin/manager)
router.get(
    '/all',
    verifyJWT,
    authorizeRoles("ADMIN", "MANAGER"),
    countryFilter,
    getAllOrders
);

// Get my orders
router.get(
    '/my-orders',
    verifyJWT,
    countryFilter,
    getMyOrders
);

// Create order - REMOVED validateCountryAccess and countryFilter temporarily
router.post(
    '/',
    verifyJWT,
    checkPermission('create_order'),
    createOrder
);

// Place order
router.post(
    '/:orderId/place',
    verifyJWT,
    checkPermission('place_order'),
    placeOrder
);

// Update payment method (ADMIN only)
router.patch(
    '/:orderId/payment',
    verifyJWT,
    authorizeRoles("ADMIN"),
    updatePaymentMethod
);

// Cancel order
router.delete(
    '/:orderId',
    verifyJWT,
    checkPermission('cancel_order'),
    cancelOrder
);

// Get order by ID - LAST (parameterized route)
router.get(
    '/:orderId',
    verifyJWT,
    getOrderById
);

export default router;