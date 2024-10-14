"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentWebhook = void 0;
const mongoose_1 = require("mongoose");
const webhook = new mongoose_1.Schema({
    payload: Object,
}, { timestamps: true });
exports.PaymentWebhook = (0, mongoose_1.model)("PaymentWebhook", webhook);
