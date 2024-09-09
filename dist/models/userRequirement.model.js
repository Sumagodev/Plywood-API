"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRequirement = void 0;
const mongoose_1 = require("mongoose");
const userRequirement = new mongoose_1.Schema({
    name: String,
    phone: String,
    address: String,
    productName: String,
}, { timestamps: true });
exports.UserRequirement = (0, mongoose_1.model)("userRequirement", userRequirement);
