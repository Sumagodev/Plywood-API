"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Blogs = void 0;
const mongoose_1 = require("mongoose");
const blogs = new mongoose_1.Schema({
    name: String,
    slug: String,
    description: String,
    image: { type: String, default: "" },
    status: { type: Boolean, default: false },
}, { timestamps: true });
exports.Blogs = (0, mongoose_1.model)("Blogs", blogs);
