"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notifications = void 0;
const mongoose_1 = require("mongoose");
const notifications = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId
    },
    title: String,
    content: String,
    isRead: { type: Boolean, default: false },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 15 * 60 * 60 * 5, // The document will be automatically deleted after 5 minutes of its creation time
    },
});
exports.Notifications = (0, mongoose_1.model)("notifications", notifications);
