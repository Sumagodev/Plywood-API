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
exports.getById = exports.deleteById = exports.updateById = exports.getBrand = exports.addBrand = void 0;
const fileSystem_1 = require("../helpers/fileSystem");
const brand_model_1 = require("../models/brand.model");
const stringify_1 = require("../helpers/stringify");
const addBrand = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.body);
        const BrandNameCheck = yield brand_model_1.Brand.findOne({
            name: new RegExp(`^${req.body.name}$`, "i"),
        }).exec();
        if (BrandNameCheck)
            throw new Error("Entry Already exist please change brand name ");
        let obj = {};
        if (req.body.image) {
            req.body.image = yield (0, fileSystem_1.storeFileAndReturnNameBase64)(req.body.image);
        }
        if (req.body.name) {
            req.body.slug = yield (0, stringify_1.string_to_slug)(req.body.name);
        }
        const newEntry = new brand_model_1.Brand(req.body).save();
        if (!newEntry) {
            throw new Error("Unable to create Brand");
        }
        res.status(200).json({ message: "Brand Successfully Created", success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.addBrand = addBrand;
const getBrand = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let BrandArr = [];
        let query = {};
        if (req.query.status) {
            query.status = req.query.status;
        }
        if (req.query.q) {
            query = Object.assign(Object.assign({}, query), { name: new RegExp(`${req.query.q}`, 'i') });
        }
        let brandCount = yield brand_model_1.Brand.find(query).countDocuments();
        let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
        let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 10;
        BrandArr = yield brand_model_1.Brand.find(query).skip((pageValue - 1) * limitValue).limit(limitValue).lean().exec();
        res.status(200).json({ message: "getBrand", data: BrandArr, brandCount, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getBrand = getBrand;
const updateById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const BrandObj = yield brand_model_1.Brand.findById(req.params.id).lean().exec();
        if (!BrandObj) {
            throw new Error(" Brand not found");
        }
        if (req.body.image && `${req.body.image}`.includes('base64')) {
            req.body.image = yield (0, fileSystem_1.storeFileAndReturnNameBase64)(req.body.image);
        }
        yield brand_model_1.Brand.findByIdAndUpdate(req.params.id, req.body).exec();
        res.status(200).json({ message: "Brand Updated", success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.updateById = updateById;
const deleteById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const BrandObj = yield brand_model_1.Brand.findByIdAndDelete(req.params.id).exec();
        if (!BrandObj)
            throw { status: 400, message: "Brand Not Found" };
        res.status(200).json({ message: "Brand Deleted", success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.deleteById = deleteById;
const getById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const BrandObj = yield brand_model_1.Brand.findById(req.params.id).exec();
        if (!BrandObj)
            throw { status: 400, message: "Brand Not Found" };
        res.status(200).json({ message: "Brand Found", data: BrandObj, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getById = getById;
