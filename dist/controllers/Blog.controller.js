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
exports.getById = exports.deleteById = exports.updateById = exports.getBlogsForHomepage = exports.getBlogs = exports.addBlogs = void 0;
const fileSystem_1 = require("../helpers/fileSystem");
const Blog_model_1 = require("../models/Blog.model");
const addBlogs = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.body);
        const BlogsCheck = yield Blog_model_1.Blogs.findOne({
            name: new RegExp(`${req.body.name}`, "i")
        }).exec();
        if (BlogsCheck)
            throw new Error("Entry Already exist, cannot create new Blogs please change heading to create one ");
        if (req.body.image) {
            req.body.image = yield (0, fileSystem_1.storeFileAndReturnNameBase64)(req.body.image);
        }
        const newEntry = new Blog_model_1.Blogs(req.body).save();
        if (!newEntry) {
            throw new Error("Unable to create Blogs Subscription");
        }
        res.status(200).json({ message: "Blogs Successfully Created", success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.addBlogs = addBlogs;
const getBlogs = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let BlogsArr = [];
        let query = {};
        if (req.query.userId) {
            query.userId = req.query.userId;
        }
        if (req.query.q) {
            query.name = new RegExp(`${req.query.q}`, "i");
        }
        let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
        let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 1000;
        let BlogsCount = yield Blog_model_1.Blogs.find(query).countDocuments();
        BlogsArr = yield Blog_model_1.Blogs.find(query).skip((pageValue - 1) * limitValue).limit(limitValue).lean().sort({ createdAt: -1 }).exec();
        // for (let Blogs of BlogsArr) {
        //   if (Blogs.BlogsId) {
        //     console.log(Blogs.BlogsId, "BlogsIdBlogsId")
        //     Blogs.BlogsObj = await Blogs.findById(Blogs.BlogsId).exec();
        //   }
        // }
        res.status(200).json({ message: "get Blogs Subscription", data: BlogsArr, BlogsCount, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getBlogs = getBlogs;
const getBlogsForHomepage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let BlogsArr = [];
        let query = {};
        let today = new Date();
        today.setHours(23, 59, 59, 59);
        console.log(req.query, "req.query.q");
        if (req.query.q) {
            query.name = new RegExp(`${req.query.q}`, "i");
        }
        BlogsArr = yield Blog_model_1.Blogs.find().lean().exec();
        // for (let Blogs of BlogsArr) {
        //   if (Blogs.BlogsId) {
        //     console.log(Blogs.BlogsId, "BlogsIdBlogsId")
        //     Blogs.BlogsObj = await Blogs.findById(Blogs.BlogsId).exec();
        //   }
        // }
        res.status(200).json({ message: "get Blogs Subscription", data: BlogsArr, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getBlogsForHomepage = getBlogsForHomepage;
const updateById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const BlogsObj = yield Blog_model_1.Blogs.findById(req.params.id).lean().exec();
        if (!BlogsObj) {
            throw new Error("Blogs Subscription not found");
        }
        let existsCheck = yield Blog_model_1.Blogs.findOne({ $and: [{ name: new RegExp(`^${req.body.name}%`, "i") }, { _id: { $ne: req.params.id } }] }).exec();
        console.log(existsCheck, "existsCheck");
        if (existsCheck) {
            throw new Error("Entry Already exist, cannot create new Blogs please change heading to create one ");
        }
        if (req.body.image && req.body.image.includes("base64")) {
            req.body.image = yield (0, fileSystem_1.storeFileAndReturnNameBase64)(req.body.image);
        }
        yield Blog_model_1.Blogs.findByIdAndUpdate(req.params.id, req.body).exec();
        res.status(200).json({ message: "Blogs Subscription Updated", success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.updateById = updateById;
const deleteById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const BlogsObj = yield Blog_model_1.Blogs.findByIdAndDelete(req.params.id).exec();
        if (!BlogsObj)
            throw { status: 400, message: "Blogs Subscription Not Found" };
        res.status(200).json({ message: "Blogs Subscription Deleted", success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.deleteById = deleteById;
const getById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let BlogsObj = yield Blog_model_1.Blogs.findById(req.params.id).lean().exec();
        if (!BlogsObj)
            throw { status: 400, message: "Blogs Subscription Not Found" };
        res.status(200).json({ message: "Blogs Subscription Found", data: BlogsObj, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getById = getById;
