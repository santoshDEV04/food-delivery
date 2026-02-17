import {ApiError} from "../utils/ApiError.js";

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if(!req.user) {
            return new ApiError(401, "Not authorized");
        }

        if(!roles.includes(req.user.role)) {
            return new ApiError(403, `User role ${req.user.role} is not authorized to access this resource`)
        }
        next();
    }
}


const checkPermission = (action) => {
    return (req, res, next) => {
        const { role } = req.user;

        const permissions = {
            'view_resturant': ['ADMIN', 'MANAGER', 'MEMBER'],
            'create_order': ['ADMIN', 'MANAGER', 'MEMBER'],
            'place_order': ['ADMIN', 'MANAGER'],
            'cancel_order':['ADMIN', 'MANAGER'],
            'update_payment':['ADMIN']
        }

        if(!permissions[action] || !permissions[action].includes(role)) {
            return new ApiError(403, `User role ${role} does not have permission to perform this action`)
        }

        next();
    }
}


export { authorizeRoles, checkPermission };