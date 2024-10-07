"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteById = exports.getById = exports.getVerifiedUser = exports.addVerifiedUser = void 0;
const VerifiedUser_model_1 = __importDefault(require("../models/VerifiedUser.model"));
const validiator_1 = require("../helpers/validiator");
const sipCrm_service_1 = require("../service/sipCrm.service");
const addVerifiedUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, phone } = req.body;
        if (!userId) {
            return res.status(400).json({ message: "UserId is required", success: false });
        }
        if (!(0, validiator_1.ValidatePhone)(phone)) {
            throw new Error("Phone number is not valid!");
        }
        const userRequestObj = yield new VerifiedUser_model_1.default(req.body).save();
        const crmObj = {
            status: userRequestObj === null || userRequestObj === void 0 ? void 0 : userRequestObj.status,
            MobileNo: userRequestObj === null || userRequestObj === void 0 ? void 0 : userRequestObj.phone,
            verifiedAt: userRequestObj === null || userRequestObj === void 0 ? void 0 : userRequestObj.verifiedAt,
        };
        yield (0, sipCrm_service_1.postSpiCrmLead)(crmObj);
        res.status(200).json({ message: "VerifiedUser successfully created", success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.addVerifiedUser = addVerifiedUser;
const getVerifiedUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let query = {};
        const totalCounts = yield VerifiedUser_model_1.default.find(query).countDocuments();
        const pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
        const limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 10;
        const totalPages = Math.ceil(totalCounts / limitValue);
        const userRequestArr = yield VerifiedUser_model_1.default.find(query)
            .skip((pageValue - 1) * limitValue)
            .limit(limitValue)
            .lean()
            .exec();
        res.status(200).json({
            message: "Verified users fetched successfully",
            data: userRequestArr,
            totalCounts,
            page: pageValue,
            limit: limitValue,
            totalPages,
            success: true,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.getVerifiedUser = getVerifiedUser;
const getById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userRequestObj = yield VerifiedUser_model_1.default.findById(req.params.id).exec();
        if (!userRequestObj) {
            return res.status(404).json({ message: "User not found", success: false });
        }
        const updatedUser = yield VerifiedUser_model_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true }).exec();
        res.status(200).json({ message: "User updated successfully", data: updatedUser, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getById = getById;
const deleteById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deletedUser = yield VerifiedUser_model_1.default.findByIdAndDelete(req.params.id).exec();
        if (!deletedUser) {
            return res.status(404).json({ message: "VerifiedUser not found", success: false });
        }
        res.status(200).json({ message: "VerifiedUser deleted", success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.deleteById = deleteById;
