"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlashSale = void 0;
const mongoose_1 = require("mongoose");
const flashSale = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    productId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "product",
    },
    price: Number,
    salePrice: Number,
    description: String,
    pricetype: String,
    discountType: String,
    discountValue: Number,
    endDate: { type: Date, default: new Date() },
    startDate: { type: Date, default: new Date() },
}, { timestamps: true });
exports.FlashSale = (0, mongoose_1.model)("FlashSale", flashSale);
