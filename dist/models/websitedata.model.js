"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsiteData = void 0;
const mongoose_1 = require("mongoose");
const websiteData = new mongoose_1.Schema({
    shopImage: String,
}, { timestamps: true });
exports.WebsiteData = (0, mongoose_1.model)("websiteData", websiteData);
