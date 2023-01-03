const express = require('express')
const { newOrder, getSingelOrder, myOrders, getAllOrders, updateOrdersStatus, deleteOrder } = require('../controller/orderController')
const router = express.Router()
const {
    authenticateUser,
    authorizePermission
} = require('../middleware/auth')

router.route("/order/new").post(authenticateUser, newOrder)
router.route("/orders/me").get(authenticateUser, myOrders)
router.route("/order/:id").get(authenticateUser, getSingelOrder)

router
    .route("/admin/orders")
    .get(authenticateUser, authorizePermission("admin"), getAllOrders)
router
    .route("/admin/order/:id")
    .put(authenticateUser, authorizePermission("admin"), updateOrdersStatus)
    .delete(authenticateUser, authorizePermission("admin"), deleteOrder)

module.exports = router