"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subscription = void 0;
const mongoose_1 = require("mongoose");
const constant_1 = require("../helpers/constant");
const subscription = new mongoose_1.Schema({
    name: String,
    description: String,
    role: String,
    noOfMonth: { type: Number, default: 0 },
    subscriptiontype: { type: String, default: constant_1.SUBSCRIPTION_TYPE.REGULAR },
    price: Number,
    includesFlashSales: Boolean,
    includesAdvertisements: Boolean,
    includesBannerImages: Boolean,
    includesValidity: Boolean,
    numberOfAdvertisement: { type: Number, default: 0 },
    advertisementDays: { type: Number, default: 0 },
    numberOfSales: { type: Number, default: 0 },
    saleDays: { type: Number, default: 0 },
    messageArr: Array
}, { timestamps: true });
exports.Subscription = (0, mongoose_1.model)("subscription", subscription);
