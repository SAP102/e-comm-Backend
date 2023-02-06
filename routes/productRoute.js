const express = require('express')

const {
    getAllProducts,
    getProductDetails,
    createProduct,
    updateProduct,
    deleteProduct,
    creatProductReview,
    getAllReview,
    deleteReview,
    getAllProductslimit,
    getProductCategoryDetails
} = require('../controller/productController')

const {
    authenticateUser,
    authorizePermission
} = require('../middleware/auth')

const router = express.Router()

router.route("/products").get(getAllProducts)
router.route("/productslimit").get(getAllProductslimit)

router.route("/admin/products/new")
    .post(authenticateUser, authorizePermission("admin"), createProduct)

router
    .route("/admin/products/:id")
    .put(authenticateUser, authorizePermission("admin"), updateProduct)
    .delete(authenticateUser, authorizePermission("admin"), deleteProduct)

router
    .route("/product/:id").get(getProductDetails)

router
    .route("/productfindbcategory/:id").get(getProductCategoryDetails)

router.route("/review").put(authenticateUser, creatProductReview)

router
    .route("/review")
    .get(getAllReview)
    .delete(authenticateUser, deleteReview)

module.exports = router