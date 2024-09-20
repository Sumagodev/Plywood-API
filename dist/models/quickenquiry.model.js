"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.quickenquiry = void 0;
const mongoose_1 = require("mongoose");
const QuickenEuiry = new mongoose_1.Schema({
    name: String,
    phone: String,
    meassage: String,
}, { timestamps: true });
exports.quickenquiry = (0, mongoose_1.model)("quickenquiry", QuickenEuiry);
