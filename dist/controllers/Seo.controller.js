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
exports.getById = exports.deleteById = exports.updateById = exports.getSeoForHomepage = exports.getSeo = exports.addSeo = void 0;
const fileSystem_1 = require("../helpers/fileSystem");
const seo_model_1 = require("../models/seo.model");
const addSeo = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.body);
        const FlashSaleCheck = yield seo_model_1.Seo.findOne({
            name: new RegExp(`${req.body.name}`, "i")
        }).exec();
        if (FlashSaleCheck)
            throw new Error("Entry Already exist, cannot create new Seo please change heading to create one ");
        if (req.body.image) {
            req.body.image = yield (0, fileSystem_1.storeFileAndReturnNameBase64)(req.body.image);
        }
        const newEntry = new seo_model_1.Seo(req.body).save();
        if (!newEntry) {
            throw new Error("Unable to create Seo ");
        }
        res.status(200).json({ message: "Seo Successfully Created", success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.addSeo = addSeo;
const getSeo = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let SeoArr = [];
        let query = {};
        if (req.query.userId) {
            query.userId = req.query.userId;
        }
        if (req.query.q) {
            query.name = new RegExp(`${req.query.q}`, "i");
        }
        let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
        let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 1000;
        let SeoCount = yield seo_model_1.Seo.find(query).countDocuments();
        SeoArr = yield seo_model_1.Seo.find(query).skip((pageValue - 1) * limitValue).limit(limitValue).lean().sort({ createdAt: -1 }).exec();
        // for (let Seo of SeoArr) {
        //   if (Seo.SeoId) {
        //     console.log(Seo.SeoId, "SeoIdSeoId")
        //     Seo.SeoObj = await Seo.findById(Seo.SeoId).exec();
        //   }
        // }
        res.status(200).json({ message: "get Seo Subscription", data: SeoArr, SeoCount, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getSeo = getSeo;
const getSeoForHomepage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let SeoArr = [];
        SeoArr = yield seo_model_1.Seo.find().lean().exec();
        // for (let Seo of SeoArr) {
        //   if (Seo.SeoId) {
        //     console.log(Seo.SeoId, "SeoIdSeoId")
        //     Seo.SeoObj = await Seo.findById(Seo.SeoId).exec();
        //   }
        // }
        res.status(200).json({ message: "get Seo Subscription", data: SeoArr, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getSeoForHomepage = getSeoForHomepage;
const updateById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const SeoObj = yield seo_model_1.Seo.findById(req.params.id).lean().exec();
        if (!SeoObj) {
            throw new Error("Seo Subscription not found");
        }
        let existsCheck = yield seo_model_1.Seo.findOne({ $and: [{ name: new RegExp(`^${req.body.name}%`, "i") }, { _id: { $ne: req.params.id } }] }).exec();
        console.log(existsCheck, "existsCheck");
        if (existsCheck) {
            throw new Error("Entry Already exist, cannot create new Seo please change heading to create one ");
        }
        if (req.body.image && `${req.body.image}`.includes('base64')) {
            req.body.image = yield (0, fileSystem_1.storeFileAndReturnNameBase64)(req.body.image);
        }
        yield seo_model_1.Seo.findByIdAndUpdate(req.params.id, req.body).exec();
        res.status(200).json({ message: "Seo Subscription Updated", success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.updateById = updateById;
const deleteById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const SeoObj = yield seo_model_1.Seo.findByIdAndDelete(req.params.id).exec();
        if (!SeoObj)
            throw { status: 400, message: "Seo Subscription Not Found" };
        res.status(200).json({ message: "Seo Subscription Deleted", success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.deleteById = deleteById;
const getById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let SeoObj = yield seo_model_1.Seo.findById(req.params.id).lean().exec();
        if (!SeoObj)
            throw { status: 400, message: "Seo Subscription Not Found" };
        res.status(200).json({ message: "Seo Subscription Found", data: SeoObj, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getById = getById;
