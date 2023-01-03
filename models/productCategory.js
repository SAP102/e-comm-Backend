const mongoose = require("mongoose")

const productCategorySchema = mongoose.Schema({
    category: {
        type: String,
        required: [true, "Please Enter Product Category"],
    },
       user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

module.exports = mongoose.model("ProductCategory", productCategorySchema)