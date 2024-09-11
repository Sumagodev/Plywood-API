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
exports.getById = exports.deleteById = exports.updateById = exports.getCountry = exports.addCountry = void 0;
const country_model_1 = require("../models/country.model");
const addCountry = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.body);
        const CountryNameCheck = yield country_model_1.Country.findOne({
            name: new RegExp(`^${req.body.name}$`, "i"),
        }).exec();
        if (CountryNameCheck)
            throw new Error("Entry Already exist please change brand name ");
        const newEntry = new country_model_1.Country(req.body).save();
        if (!newEntry) {
            throw new Error("Unable to create Country");
        }
        res.status(200).json({ message: "Country Successfully Created", success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.addCountry = addCountry;
const getCountry = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let CountryArr = [];
        let query = {};
        if (req.query.status) {
            query.status = req.query.status;
        }
        if (req.query.q) {
            query = Object.assign(Object.assign({}, query), { name: new RegExp(`${req.query.q}`, 'i') });
        }
        let countryCount = yield country_model_1.Country.find(query).countDocuments();
        let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
        let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 10;
        CountryArr = yield country_model_1.Country.find(query).skip((pageValue - 1) * limitValue).limit(limitValue).lean().exec();
        res.status(200).json({ message: "getCountry", data: CountryArr, countryCount: countryCount, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getCountry = getCountry;
const updateById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const CountryObj = yield country_model_1.Country.findById(req.params.id).lean().exec();
        if (!CountryObj) {
            throw new Error(" Country not found");
        }
        yield country_model_1.Country.findByIdAndUpdate(req.params.id, req.body).exec();
        res.status(200).json({ message: "Country Updated", success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.updateById = updateById;
const deleteById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const CountryObj = yield country_model_1.Country.findByIdAndDelete(req.params.id).exec();
        if (!CountryObj)
            throw { status: 400, message: "Country Not Found" };
        res.status(200).json({ message: "Country Deleted", success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.deleteById = deleteById;
const getById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const CountryObj = yield country_model_1.Country.findById(req.params.id).exec();
        if (!CountryObj)
            throw { status: 400, message: "Country Not Found" };
        res.status(200).json({ message: "Country Found", data: CountryObj, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getById = getById;
