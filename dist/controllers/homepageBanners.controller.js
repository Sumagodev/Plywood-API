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
exports.getById = exports.deleteById = exports.getHomepageBanners = exports.UpdateHomepageBanners = exports.CreateHomepageBanners = void 0;
const fileSystem_1 = require("../helpers/fileSystem");
const homepageBanners_model_1 = require("../models/homepageBanners.model");
const CreateHomepageBanners = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.body.image && req.body.image.includes("base64")) {
            let temp = yield (0, fileSystem_1.storeFileAndReturnNameBase64)(req.body.image);
            yield new homepageBanners_model_1.HomepageBanners({ image: temp }).save();
            res.status(200).json({ message: "Added", success: true });
        }
    }
    catch (err) {
        next(err);
    }
});
exports.CreateHomepageBanners = CreateHomepageBanners;
const UpdateHomepageBanners = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let existsCheck = yield homepageBanners_model_1.HomepageBanners.findById(req.params.id).exec();
        if (!existsCheck) {
            throw new Error("Banner not available or deleted by someone else");
        }
        if (req.body.image && req.body.image.includes("base64")) {
            let temp = yield (0, fileSystem_1.storeFileAndReturnNameBase64)(req.body.image);
            yield homepageBanners_model_1.HomepageBanners.findByIdAndUpdate(req.params.id, { image: temp }).exec();
            res.status(200).json({ message: "Updated", success: true });
        }
    }
    catch (err) {
        next(err);
    }
});
exports.UpdateHomepageBanners = UpdateHomepageBanners;
const getHomepageBanners = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let query = {};
        if (req.query.q) {
            query = Object.assign(Object.assign({}, query), { name: new RegExp(`${req.query.q}`, 'i') });
        }
        let totalCount = yield homepageBanners_model_1.HomepageBanners.find(query).countDocuments();
        let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
        let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 1000;
        let HomepageBannersArr = [];
        HomepageBannersArr = yield homepageBanners_model_1.HomepageBanners.find(query).skip((pageValue - 1) * limitValue).limit(limitValue).lean().exec();
        // let HomepageBannersArr = await HomepageBanners.find({}).exec();
        console.log(HomepageBannersArr, "HomepageBannersArr");
        res.status(200).json({ message: "getUserTicket", data: HomepageBannersArr, totalCount, success: true });
        // res.status(200).json({ message: "getUserTicket", data: UserTicketArr, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getHomepageBanners = getHomepageBanners;
const deleteById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const HomepageBannersObj = yield homepageBanners_model_1.HomepageBanners.findByIdAndDelete(req.params.id).exec();
        if (!HomepageBannersObj)
            throw { status: 400, message: "HomepageBanners Not Found" };
        res.status(200).json({ message: "HomepageBanners Deleted", success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.deleteById = deleteById;
const getById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let HomepageBannerssObj = yield homepageBanners_model_1.HomepageBanners.findOne({ _id: req.params.id }).lean().exec();
        if (!HomepageBannerssObj)
            throw { status: 400, message: "Homepage Banner Not Found" };
        res.status(200).json({ message: "HomepageBanner Found", data: HomepageBannerssObj, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getById = getById;
