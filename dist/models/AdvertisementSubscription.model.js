"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Advertisement = void 0;
const mongoose_1 = require("mongoose");
const advertisements = new mongoose_1.Schema({
    productId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "product",
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    isVideo: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    productSlug: String,
    image: String,
    message: String,
    startDate: Date,
    endDate: Date,
}, { timestamps: true });
exports.Advertisement = (0, mongoose_1.model)("advertisement", advertisements);
