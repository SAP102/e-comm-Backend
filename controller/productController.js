const catchAsyncErrors = require("../errors/catchAsyncErrors")
const Product = require("../models/productModel")
const { StatusCodes } = require("http-status-codes");
const ApiFeatures = require("../utils/apifeatures")
const ErrorHander = require("../middleware/errorhander")

// create product  

const createProduct = catchAsyncErrors(async (req, res, next) => {
    req.body.user = req.user.userId;
    const products = await Product.create(req.body)
    res.status(StatusCodes.CREATED).json({
        success: true,
        products
    })
})

//get all Product

const getAllProductslimit = catchAsyncErrors(async (req, res, next) => {

    const productlimit = await Product.find().limit(req.query.limit)
    
        let filteredProductsCount = productlimit.length;

    res.status(StatusCodes.OK).json({
        success: true, productlimit,
        filteredProductsCount,
    })
})

const getAllProducts = catchAsyncErrors(async (req, res, next) => {

    const resultPerPage = 6
    const productCount = await Product.countDocuments()

    const apiFeature = new ApiFeatures(Product.find().populate("category",{category:1}), req.query)
        .search()
        .filter()
        .pagination(resultPerPage)
        let products = await apiFeature.query;

        let filteredProductsCount = products.length;
      
        // apiFeature.pagination(resultPerPage);
      
        // products = await apiFeature.query;

    res.status(StatusCodes.OK).json({
        success: true, products, productCount, resultPerPage,
        filteredProductsCount,
    })
})

//get singel product 

const getProductDetails = catchAsyncErrors(async (req, res, next) => {
    let product = await Product.findById(req.params.id).populate("category",{category:1})

    if (!product) {
        return next(new ErrorHander("Product note found", 404))
    }

    res.status(StatusCodes.OK).json({
        success: true,
        product,
        
    })
})

// find product by category

const getProductCategoryDetails = catchAsyncErrors(async (req, res, next) => {
   
    let product = await Product.find({category:req.params.id}).populate("category",{category:1})

    if (!product) {
        return next(new ErrorHander("Product note found", 404))
    }

    res.status(StatusCodes.OK).json({
        success: true,
        product,
        
    })
})


// updateProduct --- Admin

const updateProduct = catchAsyncErrors(async (req, res, next) => {

    let product = await Product.findById(req.params.id)

    if (!product) {
        return next(new ErrorHander("Product note found", 404))
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    res.status(StatusCodes.OK).json({
        success: true,
        product
    })
})

// delete one Product

const deleteProduct = catchAsyncErrors(async (req, res, next) => {

    const product = await Product.findById(req.params.id)

    if (!product) {
        return next(new ErrorHander("Product note found", 404))
    }

    await product.remove();

    res.status(StatusCodes.OK).json({
        success: true,
        message: "Product ddelete successfully"
    })
})

// create a new review or update the review

const creatProductReview = catchAsyncErrors(async (req, res, next) => {
    const { rating, comment, productId } = req.body;

    const review = {
        user: req.user.userId,
        name: req.user.name,
        rating: Number(rating),
        comment,
    };

    const product = await Product.findById(productId);

    const isReviewed = product.reviews.find(
        (rev) => rev.user?.toString() === req.user.userId.toString()
    );

    isReviewed ? product.reviews.forEach((rev) => {
        if (rev.user.toString() === req.user.userId.toString())
            (rev.rating = rating), (rev.comment = comment);
    }) : product.reviews.push(review);
    product.numOfReviews = product.reviews.length;


    let avg = 0;

    product.reviews.forEach((rev) => {
        avg += rev.rating;
    });

    product.ratings = avg / product.reviews.length;

    await product.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
        product
    });
})

const getAllReview = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.id)

    if (!product) {
        return next(new ErrorHander("Product not found", 404))
    }
    res.status(StatusCodes.OK).json({
        success: true,
        reviews: product.reviews,
    })
})

const deleteReview = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.productId)

    if (!product) {
        return next(new ErrorHander("Product not found", 404))
    }

    const reviews = product.reviews.filter((rev) => rev._id?.toString() !== req.query.reviewsId.toString())
    let avg = 0;

    reviews.forEach((rev) => {
        avg += rev.rating;
    });

    let ratings = 0;

    reviews.length === 0 ? ratings = 0 : ratings = avg / reviews.length

    const numOfReviews = reviews.length

    await Product.findByIdAndUpdate(
        req.query.productId,
        {
            reviews,
            ratings,
            numOfReviews,
        },
        {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        }
    );

    res.status(StatusCodes.OK).json({
        success: true,
    })
})

module.exports = {
    createProduct,
    getAllProducts,
    getAllProductslimit,
    getProductDetails,
    updateProduct,
    deleteProduct,
    creatProductReview,
    getAllReview,
    deleteReview,
    getProductCategoryDetails
}