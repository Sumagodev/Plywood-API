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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteById = exports.getById = exports.getquickenquiry = exports.addquickenquiry = void 0;
const quickenquiry_model_1 = require("../models/quickenquiry.model");
const validiator_1 = require("../helpers/validiator");
const sipCrm_service_1 = require("../service/sipCrm.service");
const addquickenquiry = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.body.userId) {
        }
        if (!(0, validiator_1.ValidatePhone)(req.body.phone)) {
            throw new Error("Phone number is not valid !!!!");
        }
        let userRequestObj = yield new quickenquiry_model_1.quickenquiry(req.body).save();
        let crmObj = {
            PersonName: userRequestObj === null || userRequestObj === void 0 ? void 0 : userRequestObj.name,
            MobileNo: userRequestObj === null || userRequestObj === void 0 ? void 0 : userRequestObj.phone,
            OfficeAddress: `${userRequestObj === null || userRequestObj === void 0 ? void 0 : userRequestObj.meassage}`,
        };
        yield (0, sipCrm_service_1.postSpiCrmLead)(crmObj);
        res.status(200).json({ message: " quickenquiry Sucessfully Created", success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.addquickenquiry = addquickenquiry;
const getquickenquiry = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let userRequestArr = [];
        let query = {};
        let totalCounts = yield quickenquiry_model_1.quickenquiry.find(query).countDocuments();
        let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
        let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 10;
        userRequestArr = yield quickenquiry_model_1.quickenquiry.find(query)
            .skip((pageValue - 1) * limitValue)
            .limit(limitValue)
            .lean()
            .exec();
        res.status(200).json({ message: "getState", data: userRequestArr, totalCounts: totalCounts, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getquickenquiry = getquickenquiry;
const getById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let userRequestObj = yield quickenquiry_model_1.quickenquiry.findById(req.params.id).exec();
        if (!userRequestObj) {
            throw new Error("User Request not found");
        }
        yield quickenquiry_model_1.quickenquiry.findByIdAndUpdate(req.params.id, req.body).exec();
        res.status(200).json({ message: "State Found", data: userRequestObj, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getById = getById;
const deleteById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const TopupObj = yield quickenquiry_model_1.quickenquiry.findByIdAndDelete(req.params.id).exec();
        if (!TopupObj)
            throw { status: 400, message: "quickenquiry Not Found" };
        res.status(200).json({ message: "quickenquiry Deleted", success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.deleteById = deleteById;
