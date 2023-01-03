const ErrorHander = require("../middleware/errorhander")
const catchAsyncErrors = require("../errors/catchAsyncErrors")
const User = require("../models/userModel");
const { StatusCodes } = require("http-status-codes");
const crypto = require("crypto")
const sendEmail = require("../utils/SendEmail")
const cloudinary = require('cloudinary')
const ejs = require("ejs");
const path = require("path");

const {
    attachCookiesToResponse,
    createTokenUser,
    // sendOTP,
} = require("../utils");

// create 

const registerUser = catchAsyncErrors(async (req, res, next) => {
    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "avatars",
        width: 150,
        crop: "scale"
    })

    const { name, email, password } = req.body;

    const user = await User.create({
        name, email, password,
        avatar: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        }
    });
    const tokenUser = createTokenUser(user);
    const Token = attachCookiesToResponse({ res, user: tokenUser });
    res
        .status(StatusCodes.CREATED)
        .json({ message: "user created success", Token });

})


const loginUser = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorHander("Please Enter Email & Password", 400));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        return next(new ErrorHander("Invalid email or password", 401));
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new ErrorHander("Invalid email or password", 401));
    }
    const tokenUser = createTokenUser(user);
    const Token = attachCookiesToResponse({ res, user: tokenUser });
    res.status(StatusCodes.OK).json({ user: tokenUser, Token });

    // sendToken(user, 200, res);
});


const logout = catchAsyncErrors(async (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })

    res.status(StatusCodes.OK).json({
        success: true,
        message: "Logged Out"
    })
})

// forgot password

const frogotPassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email })
    if (!user) {
        return next(new ErrorHander("User not found", 404))
    }
    const resetToken = user.getResetPassword()
    await user.save({ validateBeforeSave: false })

    const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`
    const message = `Your password reset token is :- \n\n ${resetPasswordUrl}`

    const data = await ejs.renderFile(
        path.join(__dirname, "../views/forgotPassEmail.ejs"), { email: user.email,restPass: resetPasswordUrl }
    );
    try {
        await sendEmail({
            email: user.email,
            subject: `Ecommerce password Recovery`,
            data
        })
        res.status(StatusCodes.OK).json({
            success: true,
            message: `Email sent to ${user.email}`
        })
    } catch (error) {
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined
        await user.save({ validateBeforeSave: false })
        return next(new ErrorHander(error.message, 500))
    }
})

//reset password

const resetPassword = catchAsyncErrors(async (req, res, next) => {
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex")
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    })
    if (!user) {
        return next(new ErrorHander("Reset Password Token is invelid or has been expired", 400))
    }
    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHander("password does not Password", 400))
    }
    user.password = req.body.password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    const tokenUser = createTokenUser(user);
    const Token = attachCookiesToResponse({ res, user: tokenUser });

    await user.save();
    res.status(StatusCodes.OK).json({ user, Token });
})

const getUserDetails = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.userId);
    if (!user) {
        return next(new ErrorHander(`cannote find this id: ${req.user.userId}`, 404))
    }
    res.status(StatusCodes.OK).json({
        success: true,
        user,
    });
});

const updatePassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.userId).select("+password");

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if (!isPasswordMatched) {
        return next(new ErrorHander("oldPassword is incorrect", 400));
    }
    if (req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHander("Password does not match", 400));
    }
    user.password = req.body.newPassword
    await user.save()
    const tokenUser = createTokenUser(user);
    const Token = attachCookiesToResponse({ res, user: tokenUser });

    await user.save();
    res.status(StatusCodes.OK).json({ user, Token });
});

//updateProfile

const updateProfile = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email
    }

    if (req.body.avatar !== "undefined") {
        // console.log("🚀 ~ file: userController.js:180 ~ updateProfile ~ req.body.avatar", req.body.avatar)
        // const user = await User.findById(req.user.userId)

        const imageId = user.avatar.public_id

        await cloudinary.v2.uploader.destroy(imageId)

        const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
            folder: "avatars",
            width: 150,
            crop: "scale"
        })

        newUserData.avatar = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        }
    }
    const user = await User.findByIdAndUpdate(req.user.userId, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })
    res.status(StatusCodes.OK).json({
        success: true,
        user
    })
})

// get all user(admin)
const getAllUser = async (req, res) => {
    const users = await User.find().select("-password");
    res.status(StatusCodes.OK).json({ users, count: users.length });
};

// get singel user (admin)  

const getSingelUser = async (req, res, next) => {
    const user = await User.findById(req.params.id)

    if (!user) {
        return next(new ErrorHander(`User dose not exist with Id:${req.params.id}`))
    }
    res.status(StatusCodes.OK).json({
        success: true,
        user
    })
}

// update user role (admin)

const updateUserRole = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }
    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })
    res.status(StatusCodes.OK).json({
        success: true,
        user
    })
})

const deleteUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id)

    if (!user) {
        return next(new ErrorHander(`User dose not exist with Id:${req.params.id}`))
    }
    await user.remove()

    res.status(StatusCodes.OK).json({
        success: true,
        message: "user removed successfully"
    })
})




module.exports = {
    registerUser,
    loginUser,
    logout,
    frogotPassword,
    resetPassword,
    getUserDetails,
    updatePassword,
    updateProfile,
    getAllUser,
    getSingelUser,
    updateUserRole,
    deleteUser
}