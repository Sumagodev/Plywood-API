"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductReview = void 0;
const mongoose_1 = require("mongoose");
const productReview = new mongoose_1.Schema({
    userId: String,
    name: String,
    rating: { type: Number, default: 0 },
    message: String,
    productId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "product",
    },
    displayOnProductPage: { type: Boolean, default: false },
    status: String,
    addedBy: String,
    productIdExtra: String
}, { timestamps: true });
exports.ProductReview = (0, mongoose_1.model)("productReview", productReview);
