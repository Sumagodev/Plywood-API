"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notifications = void 0;
const mongoose_1 = require("mongoose");
const notifications = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
    },
    title: String,
    reach: String,
    content: String,
    type: String,
    isRead: { type: Boolean, default: false },
    viewCount: { type: Number, default: 1 },
    lastAccessTime: { type: Date, default: Date.now },
    payload: {
        type: Object,
        default: {} // Keep payload for dynamic data
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 1296000,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true, // Automatically handle createdAt and updatedAt
});
exports.Notifications = (0, mongoose_1.model)("notifications", notifications);
