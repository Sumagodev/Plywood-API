"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsLetter = void 0;
const mongoose_1 = require("mongoose");
const newsLetter = new mongoose_1.Schema({
    email: String,
}, { timestamps: true });
exports.NewsLetter = (0, mongoose_1.model)("newsLetter", newsLetter);
