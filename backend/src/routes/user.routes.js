import { Router } from "express";
import {
    registerUser,
    loginUser,
    getAllUsers,
    deleteUser,
    createManager,
    logoutUser,
} from "../controllers/user.controller.js";
import { viewResturantsAndMenu } from "../controllers/resturant.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { checkPermission } from "../middlewares/authorize.middleware.js";
import { countryFilter } from "../middlewares/countryFilter.middleware.js";

const router = Router();


router.post('/register', registerUser);
router.post('/login', loginUser);

//protected
router.get(
    '/restaurants-menu',
    verifyJWT,
    countryFilter,
    checkPermission('view_resturant'),
    viewResturantsAndMenu
);

router.post(
    "/logout",
    verifyJWT,
    logoutUser
)

//admin
router.get(
    '/all-users',
    verifyJWT,
    authorizeRoles("ADMIN"),
    getAllUsers
);

router.delete(
    '/delete-user/:userId',
    verifyJWT,
    authorizeRoles("ADMIN"),
    deleteUser
);

router.post(
    "/create-manager",
    verifyJWT,
    authorizeRoles("ADMIN"),
    createManager
);

export default router;