"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BannerImage = void 0;
const mongoose_1 = require("mongoose");
const BannerImages = new mongoose_1.Schema({
    productId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "product",
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    isVerified: { type: Boolean, default: false },
    productSlug: String,
    image: String,
    startDate: Date,
    endDate: Date,
}, { timestamps: true });
exports.BannerImage = (0, mongoose_1.model)("bannerImages", BannerImages);
