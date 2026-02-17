import {ApiError} from "../utils/ApiError.js";

export const authorizeRoles = (...allowedRoles) => {
    return (req, _, next) => {

        if(!req.user) {
            throw new ApiError(401, "Unauthorized request");
        }

        const userRole = req.user.role;

        if(!allowedRoles.includes(userRole)) {
            throw new ApiError(403, `Role ${userRole} is not allowed to access this resource`);
        }

        next();

    }
}