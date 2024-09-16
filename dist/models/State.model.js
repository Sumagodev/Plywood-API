"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.State = void 0;
const mongoose_1 = require("mongoose");
const state = new mongoose_1.Schema({
    name: String,
    countryId: String,
    status: { type: Boolean, default: false },
}, { timestamps: true });
exports.State = (0, mongoose_1.model)("state", state);
