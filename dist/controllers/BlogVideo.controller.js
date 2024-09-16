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
exports.getById = exports.deleteById = exports.updateById = exports.getBlogVideoForHomepage = exports.getBlogVideo = exports.addBlogVideo = void 0;
const BlogVideos_model_1 = require("../models/BlogVideos.model");
const addBlogVideo = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.body);
        const FlashSaleCheck = yield BlogVideos_model_1.BlogVideos.findOne({
            name: new RegExp(`${req.body.name}`, "i")
        }).exec();
        if (FlashSaleCheck)
            throw new Error("Entry Already exist, cannot create new BlogVideo please change heading to create one ");
        const newEntry = new BlogVideos_model_1.BlogVideos(req.body).save();
        if (!newEntry) {
            throw new Error("Unable to create BlogVideo Subscription");
        }
        res.status(200).json({ message: "BlogVideo Successfully Created", success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.addBlogVideo = addBlogVideo;
const getBlogVideo = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let BlogVideoArr = [];
        let query = {};
        if (req.query.userId) {
            query.userId = req.query.userId;
        }
        if (req.query.q) {
            query.name = new RegExp(`${req.query.q}`, "i");
        }
        let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
        let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 1000;
        let BlogVideoCount = yield BlogVideos_model_1.BlogVideos.find(query).countDocuments();
        BlogVideoArr = yield BlogVideos_model_1.BlogVideos.find(query).skip((pageValue - 1) * limitValue).limit(limitValue).lean().sort({ createdAt: -1 }).exec();
        // for (let BlogVideo of BlogVideoArr) {
        //   if (BlogVideo.BlogVideoId) {
        //     console.log(BlogVideo.BlogVideoId, "BlogVideoIdBlogVideoId")
        //     BlogVideo.BlogVideoObj = await BlogVideo.findById(BlogVideo.BlogVideoId).exec();
        //   }
        // }
        res.status(200).json({ message: "get BlogVideo Subscription", data: BlogVideoArr, BlogVideoCount, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getBlogVideo = getBlogVideo;
const getBlogVideoForHomepage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let BlogVideoArr = [];
        let query = {};
        let today = new Date();
        today.setHours(23, 59, 59, 59);
        console.log(req.query, "req.query.q");
        if (req.query.q) {
            query.name = new RegExp(`${req.query.q}`, "i");
        }
        BlogVideoArr = yield BlogVideos_model_1.BlogVideos.find().lean().exec();
        // for (let BlogVideo of BlogVideoArr) {
        //   if (BlogVideo.BlogVideoId) {
        //     console.log(BlogVideo.BlogVideoId, "BlogVideoIdBlogVideoId")
        //     BlogVideo.BlogVideoObj = await BlogVideo.findById(BlogVideo.BlogVideoId).exec();
        //   }
        // }
        res.status(200).json({ message: "get BlogVideo Subscription", data: BlogVideoArr, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getBlogVideoForHomepage = getBlogVideoForHomepage;
const updateById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const BlogVideoObj = yield BlogVideos_model_1.BlogVideos.findById(req.params.id).lean().exec();
        if (!BlogVideoObj) {
            throw new Error("BlogVideo Subscription not found");
        }
        let existsCheck = yield BlogVideos_model_1.BlogVideos.findOne({ $and: [{ name: new RegExp(`^${req.body.name}%`, "i") }, { _id: { $ne: req.params.id } }] }).exec();
        console.log(existsCheck, "existsCheck");
        if (existsCheck) {
            throw new Error("Entry Already exist, cannot create new BlogVideo please change heading to create one ");
        }
        yield BlogVideos_model_1.BlogVideos.findByIdAndUpdate(req.params.id, req.body).exec();
        res.status(200).json({ message: "BlogVideo Subscription Updated", success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.updateById = updateById;
const deleteById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const BlogVideoObj = yield BlogVideos_model_1.BlogVideos.findByIdAndDelete(req.params.id).exec();
        if (!BlogVideoObj)
            throw { status: 400, message: "BlogVideo Subscription Not Found" };
        res.status(200).json({ message: "BlogVideo Subscription Deleted", success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.deleteById = deleteById;
const getById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let BlogVideoObj = yield BlogVideos_model_1.BlogVideos.findById(req.params.id).lean().exec();
        if (!BlogVideoObj)
            throw { status: 400, message: "BlogVideo Subscription Not Found" };
        res.status(200).json({ message: "BlogVideo Subscription Found", data: BlogVideoObj, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getById = getById;
