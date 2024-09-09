"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = void 0;
const mongoose_1 = require("mongoose");
const category = new mongoose_1.Schema({
    name: String,
    slug: String,
    parentCategoryId: String,
    parentCategoryArr: [
        {
            parentId: String,
        },
    ],
    level: {
        type: Number,
        default: 1,
    },
    image: { type: String, default: "" },
    bannerImage: { type: String, default: "" },
    status: { type: Boolean, default: false },
}, { timestamps: true });
exports.Category = (0, mongoose_1.model)("category", category);
