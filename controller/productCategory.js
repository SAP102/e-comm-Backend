
const catchAsyncErrors = require("../errors/catchAsyncErrors")
const { StatusCodes } = require("http-status-codes");
const ProductCategory = require("../models/productCategory");
const ErrorHander = require("../middleware/errorhander");


const createProductCategory = catchAsyncErrors(async (req, res, next) => {
    req.body.user = req.user.userId;
    const productctegory = await ProductCategory.create(req.body)
    res.status(StatusCodes.CREATED).json({
        success: true,
        productctegory
    })
})

const getAllProductCategory = catchAsyncErrors(async (req,res, next )=>{

    const AllproductCategory = await ProductCategory.find()

    let filteredProductsCount = AllproductCategory.length;

    res.status(StatusCodes.OK).json({
        success: true, 
        AllproductCategory,
        filteredProductsCount,
    })
})

const updateProductCategory = catchAsyncErrors(async (req, res, next) => {

    let product = await ProductCategory.findById(req.params.id)

    if (!product) {
        return next(new ErrorHander("ProductCategory note found", 404))
    }

    product = await ProductCategory.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    res.status(StatusCodes.OK).json({
        success: true,
        product
    })
})


const deleteProductCtegory = catchAsyncErrors(async (req, res, next) => {

    const product = await ProductCategory.findById(req.params.id)

    if (!product) {
        return next(new ErrorHander("ProductCategory note found", 404))
    }

    await product.remove();

    res.status(StatusCodes.OK).json({
        success: true,
        message: "ProductCategory ddelete successfully"
    })
})

module.exports = {
    createProductCategory,
    getAllProductCategory,
    updateProductCategory,
    deleteProductCtegory
}