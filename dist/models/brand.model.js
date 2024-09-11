"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Brand = void 0;
const mongoose_1 = require("mongoose");
const brand = new mongoose_1.Schema({
    name: String,
    slug: String,
    image: { type: String, default: "" },
    status: { type: Boolean, default: false },
}, { timestamps: true });
exports.Brand = (0, mongoose_1.model)("brand", brand);
