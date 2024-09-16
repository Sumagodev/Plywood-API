"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserFcmToken = void 0;
const mongoose_1 = require("mongoose");
const userFcmTokens = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId
    },
    fcmToken: String
}, { timestamps: true });
exports.UserFcmToken = (0, mongoose_1.model)("userFcmToken", userFcmTokens);
