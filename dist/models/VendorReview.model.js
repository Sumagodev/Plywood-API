"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorReview = void 0;
const mongoose_1 = require("mongoose");
const vendorReview = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    name: String,
    rating: { type: Number, default: 0 },
    message: String,
    displayOnProductPage: { type: Boolean, default: false },
    status: String,
}, { timestamps: true });
exports.VendorReview = (0, mongoose_1.model)("vendorReview", vendorReview);
