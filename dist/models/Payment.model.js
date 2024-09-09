"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = void 0;
const mongoose_1 = require("mongoose");
const payment = new mongoose_1.Schema({
    paymentId: String,
    amount: String,
    gatwayPaymentObj: Object,
    orderObj: Object,
    paymentChk: {
        // 0 means payment has not occured ,1 means payment successful, -1 means payment failed ,2 for cod,3,partial paid,4,paid by other
        type: Number,
        default: 0, // if payment is not 1 then it wont be able to proceed
    },
    gatewayPaymentArr: Array,
}, { timestamps: true });
exports.Payment = (0, mongoose_1.model)("payment", payment);
