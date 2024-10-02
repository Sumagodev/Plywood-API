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
exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const constant_1 = require("../helpers/constant");
// 2. Create a Schema corresponding to the document interface.
const userSchema = new mongoose_1.Schema({
    name: String,
    email: String,
    phone: String,
    whatsapp: String,
    password: String,
    aniversaryDate: Date,
    landline: String,
    address: String,
    dob: String,
    countryId: String,
    stateId: String,
    brandNames: String,
    cityId: String,
    token: String,
    salesId: mongoose_1.Types.ObjectId,
    profileImage: String,
    bannerImage: String,
    isBlocked: { default: false, type: Boolean },
    subscriptionEndDate: Date,
    categoryArr: [
        {
            categoryId: mongoose_1.default.Types.ObjectId,
        }
    ],
    companyObj: {
        name: String,
        phone: String,
        email: String,
        address: String,
        noofepmployee: String,
        natureOfBusiness: String,
        annualTurnover: String,
        iecCode: String,
        yearOfEstablishment: String,
        legalStatus: String,
        cinNo: String,
        companyCeo: String,
        googleMapsLink: String,
        gstNumber: String,
    },
    imagesArr: [
        {
            image: String
        }
    ],
    videoArr: [
        {
            video: String
        }
    ],
    role: {
        type: String,
        default: constant_1.ROLES.USER,
    },
    approved: {
        type: Boolean,
        default: true,
    },
    accessObj: {
        manageUsers: {
            type: Boolean,
            default: false,
        },
        manageCategory: {
            type: Boolean,
            default: false,
        },
    },
    documents: [
        {
            name: String,
            image: String,
        },
    ],
    // And `Schema.Types.ObjectId` in the schema definition.
    isVerified: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    numberOfSales: { type: Number, default: 0 },
    saleDays: { type: Number, default: 0 },
    numberOfBannerImages: { type: Number, default: 0 },
    bannerimagesDays: { type: Number, default: 0 },
    numberOfOpportunities: { type: Number, default: 0 },
    OpportunitiesDays: { type: Number, default: 0 },
    numberOfAdvertisement: { type: Number, default: 0 },
    advertisementDays: { type: Number, default: 0 },
}, { timestamps: true });
exports.User = (0, mongoose_1.model)("User", userSchema);
