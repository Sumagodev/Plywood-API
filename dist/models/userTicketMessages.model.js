"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserTicketsMessage = void 0;
const mongoose_1 = require("mongoose");
const userTicketsMessage = new mongoose_1.Schema({
    message: String,
    userTicketsId: String,
    userId: String,
}, { timestamps: true });
exports.UserTicketsMessage = (0, mongoose_1.model)("userTicketsMessage", userTicketsMessage);
