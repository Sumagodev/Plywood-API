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
exports.getNestedCategory = exports.getNameBySlug = exports.getById = exports.deleteById = exports.updateById = exports.getChildCategory = exports.getCategory = exports.addCategory = void 0;
const constant_1 = require("../helpers/constant");
const fileSystem_1 = require("../helpers/fileSystem");
const category_model_1 = require("../models/category.model");
const product_model_1 = require("../models/product.model");
const stringify_1 = require("./../helpers/stringify");
const addCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.body);
        const CategoryNameCheck = yield category_model_1.Category.findOne({
            name: new RegExp(`^${req.body.name}$`, "i"),
        }).exec();
        if (CategoryNameCheck)
            throw new Error("Entry Already exist please change name or url");
        let obj = {};
        if (req.body.image) {
            req.body.image = yield (0, fileSystem_1.storeFileAndReturnNameBase64)(req.body.image);
        }
        if (req.body.bannerImage) {
            req.body.bannerImage = yield (0, fileSystem_1.storeFileAndReturnNameBase64)(req.body.bannerImage);
        }
        if (req.body.parentCategoryId) {
            const categoryObj = yield category_model_1.Category.findById(req.body.parentCategoryId).lean().exec();
            if (!categoryObj) {
                throw new Error("Parent Category not found");
            }
            const parentCategoryArr = [...categoryObj.parentCategoryArr];
            parentCategoryArr.push({ parentId: categoryObj._id });
            if (req.body.name) {
                req.body.slug = yield (0, stringify_1.string_to_slug)(req.body.name);
            }
            obj = Object.assign(Object.assign({}, req.body), { level: categoryObj.level + 1, parentCategoryArr });
        }
        else {
            const categoryCount = yield category_model_1.Category.countDocuments({ level: 1 }).exec();
            obj = Object.assign(Object.assign({}, req.body), { order: categoryCount + 1, level: 1 });
        }
        const newEntry = new category_model_1.Category(obj).save();
        if (!newEntry) {
            throw new Error("Unable to create Category");
        }
        res.status(200).json({ message: "Category Successfully Created", success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.addCategory = addCategory;
const getCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let query = {};
        if (req.query.level) {
            query.level = req.query.level;
        }
        if (req.query.q) {
            query = Object.assign(Object.assign({}, query), { name: new RegExp(`${req.query.q}`, "i") });
        }
        let categoryCount = yield category_model_1.Category.find(query).countDocuments();
        let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
        let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 1000;
        let categoryArr = [];
        categoryArr = yield category_model_1.Category.find(query)
            .skip((pageValue - 1) * limitValue)
            .limit(limitValue)
            .lean()
            .exec();
        // if (req.query.level) {
        // } else {
        // categoryArr = await Category.find().skip((pageValue - 1) * limitValue).limit(limitValue).lean().exec();
        // }
        for (const el of categoryArr) {
            // console.log(el);
            if (el.parentCategoryId) {
                const parentObj = yield category_model_1.Category.findById(el.parentCategoryId).lean().exec();
                if (parentObj) {
                    el.parentCategoryName = parentObj.name;
                }
            }
            if (req.query.products) {
                let pquery = { "categoryArr.categoryId": el._id, approved: constant_1.APPROVED_STATUS.APPROVED };
                if (req.query.role) {
                    pquery = Object.assign(Object.assign({}, pquery), { "createdByObj.role": { $ne: req.query.role } });
                }
                let productArr = yield product_model_1.Product.find(pquery).limit(4).exec();
                el.productArr = productArr;
            }
        }
        console.log(categoryCount, "categoryCount");
        res.status(200).json({ message: "getCategory", data: categoryArr, count: categoryCount, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getCategory = getCategory;
const getChildCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let categoryArr = [];
        if (req.query.level) {
            categoryArr = yield category_model_1.Category.find({ level: `${req.query.level}` })
                .lean()
                .exec();
        }
        else {
            categoryArr = yield category_model_1.Category.find({ level: 1 }).lean().exec();
        }
        for (const el of categoryArr) {
            console.log(el);
            if (el.parentCategoryId) {
                const parentObj = yield category_model_1.Category.findById(el.parentCategoryId).lean().exec();
                if (parentObj) {
                    el.parentCategoryName = parentObj.name;
                }
            }
        }
        res.status(200).json({ message: "getCategory", data: categoryArr, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getChildCategory = getChildCategory;
const updateById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let obj = {};
        if (req.body.image && `${req.body.image}`.includes("data:image")) {
            req.body.image = yield (0, fileSystem_1.storeFileAndReturnNameBase64)(req.body.image);
        }
        if (req.body.name) {
            req.body.slug = yield (0, stringify_1.string_to_slug)(req.body.name);
        }
        if (req.body.bannerImage && `${req.body.bannerImage}`.includes("data:image")) {
            req.body.bannerImage = yield (0, fileSystem_1.storeFileAndReturnNameBase64)(req.body.bannerImage);
        }
        if (req.body.parentCategoryId) {
            const categoryObj = yield category_model_1.Category.findById(req.body.parentCategoryId).lean().exec();
            if (!categoryObj) {
                throw new Error("Parent Category not found");
            }
            const parentCategoryArr = [...categoryObj.parentCategoryArr];
            parentCategoryArr.push({ parentId: categoryObj._id });
            obj = Object.assign(Object.assign({}, req.body), { level: categoryObj.level + 1, parentCategoryArr });
        }
        else {
            const categoryCount = yield category_model_1.Category.countDocuments({ level: 1 }).exec();
            obj = Object.assign(Object.assign({}, req.body), { order: categoryCount + 1, level: 1 });
        }
        yield category_model_1.Category.findByIdAndUpdate(req.params.id, obj).exec();
        res.status(200).json({ message: "category Updated", success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.updateById = updateById;
const deleteById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categoryObj = yield category_model_1.Category.findByIdAndDelete(req.params.id).exec();
        if (!categoryObj)
            throw { status: 400, message: "category Not Found" };
        res.status(200).json({ message: "category Deleted", success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.deleteById = deleteById;
const getById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categoryObj = yield category_model_1.Category.findById(req.params.id).exec();
        if (!categoryObj)
            throw { status: 400, message: "category Not Found" };
        res.status(200).json({ message: "category Found", data: categoryObj, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getById = getById;
const getNameBySlug = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categoryObj = yield category_model_1.Category.findOne({ slug: req.params.id }).exec();
        if (!categoryObj)
            throw { status: 400, message: "category Not Found" };
        res.status(200).json({ message: "category Found", data: categoryObj, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getNameBySlug = getNameBySlug;
const getNestedCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let mainCategoryArr = yield category_model_1.Category.find().lean().exec();
        let firstFilteArr = mainCategoryArr.filter((el) => el.name == "Plywood & MDF");
        let restFilteArr = mainCategoryArr.filter((el) => el.name != "Plywood & MDF");
        mainCategoryArr = [...firstFilteArr, ...restFilteArr];
        // console.log(mainCategoryArr, "mainCategoryArr");
        const setSubcategoryArr = (id) => {
            if (!id)
                return [];
            const tempArr = mainCategoryArr.filter((el) => el.parentCategoryId == `${id}`);
            if (tempArr.length == 0)
                return [];
            return tempArr.map((el) => {
                const obj = Object.assign(Object.assign({}, el), { label: el.name, value: el._id, subCategoryArr: setSubcategoryArr(el._id), isExpanded: true });
                return obj;
            });
        };
        const finalArr = mainCategoryArr
            .filter((el) => el.level == 1)
            .map((el) => {
            const obj = Object.assign(Object.assign({}, el), { label: el.name, value: el._id, subCategoryArr: setSubcategoryArr(el._id), isExpanded: true });
            return obj;
        });
        res.status(200).json({ message: "Category Arr", data: finalArr, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getNestedCategory = getNestedCategory;
