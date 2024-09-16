"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserTickets = void 0;
const mongoose_1 = require("mongoose");
const userTickets = new mongoose_1.Schema({
    name: String,
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
}, { timestamps: true });
exports.UserTickets = (0, mongoose_1.model)("userTickets", userTickets);
