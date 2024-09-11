"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Seo = void 0;
const mongoose_1 = require("mongoose");
const seos = new mongoose_1.Schema({
    name: String,
    url: String,
    description: String,
    keywords: String,
    title: String,
    image: { type: String, default: "" },
    status: { type: Boolean, default: false },
}, { timestamps: true });
exports.Seo = (0, mongoose_1.model)("Seo", seos);
