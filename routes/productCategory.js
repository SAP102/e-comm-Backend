const express = require("express")

const { createProductCategory, getAllProductCategory, updateProductCategory, deleteProductCtegory } = require('../controller/productCategory')

const {
    authenticateUser,
    authorizePermission
} = require('../middleware/auth')

const router = express.Router()

router.route("/admin/productCategory").get(authenticateUser,getAllProductCategory)


router.route("/admin/productCategory/new")
    .post(authenticateUser,authorizePermission("admin"), createProductCategory)

    router
    .route("/admin/productCategory/:id")
    .put(authenticateUser, authorizePermission("admin"), updateProductCategory)
    .delete(authenticateUser, authorizePermission("admin"), deleteProductCtegory)

module.exports = router