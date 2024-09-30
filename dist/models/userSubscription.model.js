"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSubscription = void 0;
const mongoose_1 = require("mongoose");
const userSubscription = new mongoose_1.Schema({
    name: String,
    orderId: String,
    description: String,
    userId: String,
    subscriptionId: String,
    price: Number,
    startDate: Date,
    numberOfSales: Number,
    includesFlashSales: Boolean,
    includesAdvertisements: Boolean,
    includesValidity: Boolean,
    numberOfAdvertisement: { type: Number, default: 0 },
    advertisementDays: { type: Number, default: 0 },
    numberOfBannerImages: { type: Number, default: 0 },
    bannerimagesDays: { type: Number, default: 0 },
    noOfMonth: Number,
    saleDays: { type: Number, default: 0 },
    endDate: Date,
    isExpired: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });
exports.UserSubscription = (0, mongoose_1.model)("UserSubscription", userSubscription);
