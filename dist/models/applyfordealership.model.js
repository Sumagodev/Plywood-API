"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DealershipApplication = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Create the schema with cityId as an array
const dealershipApplicationSchema = new mongoose_1.Schema({
    Organisation_name: { type: String, required: true },
    Type: { type: String, required: true },
    Product: { type: String, required: true },
    Brand: { type: String, required: true },
    productId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Product",
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    dealershipOwnerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'DealershipOwner',
        required: true,
    },
    image: { type: String },
    countryId: { type: String },
    stateId: { type: String },
    cityId: [{ type: String }], // Define cityId as an array of strings
}, { timestamps: true });
// Correct model export
exports.DealershipApplication = mongoose_1.default.models.DealershipApplication || (0, mongoose_1.model)("DealershipApplication", dealershipApplicationSchema);
