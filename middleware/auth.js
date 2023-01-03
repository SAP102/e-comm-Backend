const ErrorHander = require("./errorhander");
const catchAsyncErrors = require("../errors/catchAsyncErrors")
const { isTokenValid } = require("../utils");

const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const authenticateUser = catchAsyncErrors(async (req, res, next) => {

    const { token } = req.cookies;

    if (!token) {
        return next(new ErrorHander("Please Login to access this resource"))
    }

    const { name, userId, role } = isTokenValid({ token });
    req.user = { name, userId, role };


    next()
})

const authorizePermission = (...roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return next( new ErrorHander(`${req.user.role} is note allowed to access this resouce`,403));
      }
      next();
    };
  };

module.exports = {
    authenticateUser,
    authorizePermission
}