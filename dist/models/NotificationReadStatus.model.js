"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationReadStatus = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema } = mongoose_1.default;
const NotificationReadStatusSchema = new Schema({
    notificationId: { type: Schema.Types.ObjectId, required: true, ref: 'Notification' },
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    readAt: { type: Date, default: Date.now }
});
// Create a compound index to speed up lookups
NotificationReadStatusSchema.index({ notificationId: 1, userId: 1 }, { unique: true });
exports.NotificationReadStatus = mongoose_1.default.model('NotificationReadStatus', NotificationReadStatusSchema);
