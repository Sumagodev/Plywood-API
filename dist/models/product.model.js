"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const mongoose_1 = require("mongoose");
const product = new mongoose_1.Schema({
    name: String,
    slug: String,
    brand: String,
    categoryId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "category",
    },
    categoryArr: [
        {
            categoryId: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: "category",
            },
        },
    ],
    price: String,
    sellingprice: String,
    specification: {
        thickness: String,
        application: String,
        grade: String,
        color: String,
        size: String,
        wood: String,
        glue: String,
        warranty: String,
    },
    shortDescription: String,
    longDescription: String,
    mainImage: String,
    imageArr: [],
    video: String,
    brochure: String,
    createdById: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    createdByObj: {},
    status: { type: Boolean, default: false },
    approved: { type: String, default: false },
}, { timestamps: true });
exports.Product = (0, mongoose_1.model)("product", product);
