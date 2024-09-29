"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Topup = void 0;
const mongoose_1 = require("mongoose");
const topup = new mongoose_1.Schema({
    name: String,
    description: String,
    role: String,
    price: Number,
    includesFlashSales: Boolean,
    includesAdvertisements: Boolean,
    includesOpportunities: Boolean,
    includesBannerImages: Boolean,
    numberOfAdvertisement: { type: Number, default: 0 },
    advertisementDays: { type: Number, default: 0 },
    numberOfSales: { type: Number, default: 0 },
    saleDays: { type: Number, default: 0 },
    numberOfOpportunity: { type: Number, default: 0 },
    opportunityDays: { type: Number, default: 0 },
    numberOfBannerImages: { type: Number, default: 0 },
    bannerimagesDays: { type: Number, default: 0 },
    messageArr: Array
}, { timestamps: true });
exports.Topup = (0, mongoose_1.model)("topup", topup);
