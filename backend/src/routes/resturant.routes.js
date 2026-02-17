import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { countryFilter, validateCountryAccess } from "../middlewares/countryFilter.middleware.js";
import {
    viewResturantsAndMenu,
    getResturantById,
    createResturant,
    updateResturant,
    deleteResturant
} from "../controllers/resturant.controller.js";


const router = Router();


router.get(
    '/',
    verifyJWT,
    countryFilter,
    viewResturantsAndMenu
);

router.get(
    '/:id',
    verifyJWT,
    getResturantById
);


router.post(
    '/',
    verifyJWT,
    authorizeRoles("ADMIN"),
    validateCountryAccess,
    createResturant
);

router.put(
    '/:id',
    verifyJWT,
    authorizeRoles("ADMIN"),
    validateCountryAccess,
    updateResturant
);

router.delete(
    '/:id',
    verifyJWT,
    authorizeRoles("ADMIN"),
    deleteResturant
);

export default router;