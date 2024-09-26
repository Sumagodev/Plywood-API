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
exports.DealershipOwner = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Create the schema with cityId as an array
const dealershipOwnerSchema = new mongoose_1.Schema({
    Organisation_name: { type: String, required: true },
    Type: { type: String, required: true },
    Product: { type: String },
    Brand: { type: String, required: true },
    productId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Product",
    },
    email: { type: String },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    categoryArr: [
        {
            categoryId: mongoose_1.default.Types.ObjectId,
        }
    ],
    image: { type: String },
    countryId: { type: String },
    stateId: { type: String },
    cityId: [{ type: String }], // Define cityId as an array of strings
}, { timestamps: true });
// Ensure the model is not redefined
exports.DealershipOwner = mongoose_1.default.models.DealershipOwner || (0, mongoose_1.model)("DealershipOwner", dealershipOwnerSchema);
