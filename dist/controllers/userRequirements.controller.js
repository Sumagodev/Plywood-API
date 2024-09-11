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
exports.deleteById = exports.getById = exports.getUserRequirement = exports.addUserRequirement = void 0;
const userRequirement_model_1 = require("../models/userRequirement.model");
const validiator_1 = require("../helpers/validiator");
const sipCrm_service_1 = require("../service/sipCrm.service");
const addUserRequirement = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        if (!req.body.userId) {
        }
        if (!(0, validiator_1.ValidatePhone)(req.body.phone)) {
            throw new Error("Phone number is not valid !!!!");
        }
        let userRequestObj = yield new userRequirement_model_1.UserRequirement(req.body).save();
        let crmObj = {
            PersonName: userRequestObj === null || userRequestObj === void 0 ? void 0 : userRequestObj.name,
            MobileNo: userRequestObj === null || userRequestObj === void 0 ? void 0 : userRequestObj.phone,
            OfficeAddress: `${userRequestObj === null || userRequestObj === void 0 ? void 0 : userRequestObj.address}`,
            MediumName: "Requirements ",
            InitialRemarks: `${userRequestObj === null || userRequestObj === void 0 ? void 0 : userRequestObj.productName}`,
            SourceName: "app",
        };
        if ((_a = req.body) === null || _a === void 0 ? void 0 : _a.SourceName) {
            crmObj.SourceName = (_b = req.body) === null || _b === void 0 ? void 0 : _b.SourceName;
        }
        yield (0, sipCrm_service_1.postSpiCrmLead)(crmObj);
        res.status(200).json({ message: "User Requirement Sucessfully Created", success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.addUserRequirement = addUserRequirement;
const getUserRequirement = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let userRequestArr = [];
        let query = {};
        if (req.query.status) {
            query.status = req.query.status;
        }
        if (req.query.countryId) {
            query.countryId = req.query.countryId;
        }
        if (req.query.q) {
            query = Object.assign(Object.assign({}, query), { name: new RegExp(`${req.query.q}`, "i") });
        }
        let totalCounts = yield userRequirement_model_1.UserRequirement.find(query).countDocuments();
        let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
        let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 10;
        userRequestArr = yield userRequirement_model_1.UserRequirement.find(query)
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
exports.getUserRequirement = getUserRequirement;
const getById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let userRequestObj = yield userRequirement_model_1.UserRequirement.findById(req.params.id).exec();
        if (!userRequestObj) {
            throw new Error("User Request not found");
        }
        yield userRequirement_model_1.UserRequirement.findByIdAndUpdate(req.params.id, req.body).exec();
        res.status(200).json({ message: "State Found", data: userRequestObj, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getById = getById;
const deleteById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const TopupObj = yield userRequirement_model_1.UserRequirement.findByIdAndDelete(req.params.id).exec();
        if (!TopupObj)
            throw { status: 400, message: "UserRequirement Not Found" };
        res.status(200).json({ message: "UserRequirement Deleted", success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.deleteById = deleteById;
