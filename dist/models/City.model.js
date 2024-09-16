"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.City = void 0;
const mongoose_1 = require("mongoose");
const city = new mongoose_1.Schema({
    name: String,
    stateId: String,
    countryId: String,
    image: String,
    status: { type: Boolean, default: false },
}, { timestamps: true });
exports.City = (0, mongoose_1.model)("city", city);
