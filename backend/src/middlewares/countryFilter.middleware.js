import { ApiError } from "../utils/ApiError.js";

const countryFilter = (req, _, next) => {
    if(req.user.role === "ADMIN" || req.user.country === 'GLOBAL') {
        req.countryFilter = {};
    } else {
        req.countryFilter = { country: req.user.country };
    }

    next();
}

const applyCountryFilter = (query, user) => {
    if(user.role === "ADMIN" || user.country === 'GLOBAL') {
        return query;
    }

    return { ...query, country: user.country };
}

const canAccessCountry = (req, resourceCountry) => {
    if(req.user.role === "ADMIN" || req.user.country === 'GLOBAL') {
        return true;
    }

    return req.user.country === resourceCountry
}

const validateCountryAccess = (req, res, next) => {
    const requestedCountry = req.body.country;

    if(req.user.role === "ADMIN" || req.user.country === 'GLOBAL' || req.user.country === requestedCountry) {
        return next();
    }

    if(!requestedCountry) {
        req.body.country = req.user.country
        return next();
    }

    if(requestedCountry !== req.user.country) {
        return new ApiError(403, `User with country ${req.user.country} cannot access resources of country ${requestedCountry}`);
    }

    next()
}

export { countryFilter, applyCountryFilter, canAccessCountry, validateCountryAccess }