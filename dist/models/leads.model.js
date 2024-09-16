"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lead = void 0;
const mongoose_1 = require("mongoose");
const lead = new mongoose_1.Schema({
    userId: String,
    phone: String,
    email: String,
    name: String,
    productId: String,
    status: String,
    createdById: String,
}, { timestamps: true });
exports.Lead = (0, mongoose_1.model)("lead", lead);
