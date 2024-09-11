"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateDetail = void 0;
const mongoose_1 = require("mongoose");
const stateDetailSchema = new mongoose_1.Schema({
    stateId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'State',
        required: true,
    },
    image: {
        type: String,
        default: '',
    },
}, { timestamps: true });
exports.StateDetail = (0, mongoose_1.model)('StateDetail', stateDetailSchema);
