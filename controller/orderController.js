const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const ErrorHander = require("../middleware/errorhander")
const catchAsyncErrors = require("../errors/catchAsyncErrors")
const { StatusCodes } = require("http-status-codes");

const newOrder = catchAsyncErrors(async (req, res, next) => {
    if(req.user.role === "admin"){
        return next(new ErrorHander("Order create only user", 404))
    }else{
        const { shippingInfo, orderItems, paymentInfo, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;
        const orders = await Order.create({
            shippingInfo,
            orderItems,
            paymentInfo,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            paidAt: Date.now(),
            user: req.user.userId,
        });

        res.status(StatusCodes.CREATED).json({
            success: true,
            orders,
        });
    }

  
});

// get singelOrder 

const getSingelOrder = catchAsyncErrors(async (req, res, next) => {
    const orders = await Order.findById(req.params.id).populate("user", "name email")

    if (!orders) {
        return next(new ErrorHander("Order not found with this id", 404))
    }

    res.status(StatusCodes.OK).json({
        success: true,
        orders
    })
})

// get logedin user orders

const myOrders = catchAsyncErrors(async (req, res, next) => {
    const orders = await Order.find({ user: req.user.userId });

    if (!orders) {
        return next(new ErrorHander("Order not found with this id", 404))
    }

    res.status(StatusCodes.OK).json({
        success: true,
        orders,
    });
});

// get all orders = (admin)

const getAllOrders = catchAsyncErrors(async (req, res, next) => {
    const orders = await Order.find();

    let totalAmount = 0
    orders.forEach((order) => {
        totalAmount += order.totalPrice;
    });

    res.status(StatusCodes.OK).json({
        success: true,
        totalAmount,
        orders,
    });
})

// update order status orders = (admin)

const updateOrdersStatus = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id);
    if (!order) {
        return next(new ErrorHander("Order not found with this Id", 404));
    }

    if (!order.orderStatus !== "Delivered") {
        return next(new ErrorHander("You have already delivered this order", 400))
    }
    order.orderItems.forEach(async (o) => {
        await updateStock(o.product, o.quantity);
    });

    order.orderStatus = req.body.status;

    if (req.body.status === "Delivered") {
        order.deliveredAt = Date.now();
    }

    await order.save({ validateBeforeSave: false });
    res.status(200).json({
        success: true,
    });
})

const updateStock = async (id, quantity) => {
    const product = await Product.findById(id);

    product.Stock -= quantity;

    await product.save({ validateBeforeSave: false });
}

// delete Order -- Admin

const deleteOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new ErrorHander("Order not found with this Id", 404));
    }

    await order.remove();

    res.status(200).json({
        success: true,
    });
});

module.exports = {
    newOrder,
    getSingelOrder,
    myOrders,
    getAllOrders,
    updateOrdersStatus,
    deleteOrder
}