"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Country = void 0;
const mongoose_1 = require("mongoose");
const country = new mongoose_1.Schema({
    name: String,
    status: { type: Boolean, default: false },
}, { timestamps: true });
exports.Country = (0, mongoose_1.model)("country", country);
