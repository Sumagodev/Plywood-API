"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogVideos = void 0;
const mongoose_1 = require("mongoose");
const blogVideos = new mongoose_1.Schema({
    url: String,
    name: String,
    status: { type: Boolean, default: false },
}, { timestamps: true });
exports.BlogVideos = (0, mongoose_1.model)("BlogVideos", blogVideos);
