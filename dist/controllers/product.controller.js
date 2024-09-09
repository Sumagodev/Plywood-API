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
exports.getTopSellingProducts = exports.updateAppById = exports.searchProductWithQuery = exports.getAllProductsBySupplierId = exports.getSimilarProducts = exports.getProductById = exports.getById = exports.deleteById = exports.updateById = exports.getProduct = exports.addProduct = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const fileSystem_1 = require("../helpers/fileSystem");
const product_model_1 = require("../models/product.model");
const stringify_1 = require("../helpers/stringify");
const category_model_1 = require("../models/category.model");
const brand_model_1 = require("../models/brand.model");
const user_model_1 = require("../models/user.model");
const FlashSale_model_1 = require("../models/FlashSale.model");
const addProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        console.log(req.user, "useruseruseruser");
        // const ProductNameCheck = await Product.findOne({
        //   name: new RegExp(`^${req.body.name}$`, "i"),
        // }).exec();
        // if (ProductNameCheck) throw new Error("Entry Already exist please change product name ");
        let obj = {};
        if (req.body.image) {
            req.body.mainImage = yield (0, fileSystem_1.storeFileAndReturnNameBase64)(req.body.image);
        }
        if (req.body.name) {
            req.body.slug = yield (0, stringify_1.string_to_slug)(req.body.name);
        }
        let userDataObj = yield user_model_1.User.findById((_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.userId).exec();
        if (!userDataObj) {
            throw new Error("You are not authorised to create this product");
        }
        if (req.user) {
            let userobj = Object.assign(Object.assign({}, userDataObj), { role: req.user.role });
            console.log(req.user.userId, "req.user.userId", req.user, "req.user");
            req.body.createdById = req.user.userId;
            req.body.createdByObj = userobj;
            console.log(userDataObj === null || userDataObj === void 0 ? void 0 : userDataObj.subscriptionEndDate, "userObjuserObjuserObj");
            if (userDataObj === null || userDataObj === void 0 ? void 0 : userDataObj.subscriptionEndDate) {
                let subscriptionEndDate = new Date(userDataObj === null || userDataObj === void 0 ? void 0 : userDataObj.subscriptionEndDate);
                let currentDate = new Date();
                if ((subscriptionEndDate.getTime() < currentDate.getTime())) {
                    req.body.status = true;
                }
            }
        }
        if (req.body.categoryArr) {
            for (let el of req.body.categoryArr) {
                let categoryObj = yield category_model_1.Category.findById(el.categoryId).lean().exec();
                if (!categoryObj)
                    throw { message: "Product Category not found" };
            }
        }
        if (req.body.imageArr) {
            if (req.body.imageArr && req.body.imageArr.length > 3) {
                throw new Error("Cannot add more than 3 images");
            }
            for (const el of req.body.imageArr) {
                if (el.image != "") {
                    el.image = yield (0, fileSystem_1.storeFileAndReturnNameBase64)(el.image);
                }
            }
        }
        const newEntry = new product_model_1.Product(req.body).save();
        if (!newEntry) {
            throw new Error("Unable to create Product");
        }
        res.status(200).json({ message: "Product Successfully Created", success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.addProduct = addProduct;
const getProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let ProductArr = [];
        let query = {};
        if (req.query.userId) {
            query.createdById = req.query.userId;
        }
        if (req.query.searchQuery) {
            query = Object.assign(Object.assign({}, query), { name: new RegExp(`${req.query.searchQuery}`, "i") });
        }
        if (req.query.q) {
            query = Object.assign(Object.assign({}, query), { name: new RegExp(`${req.query.q}`, "i") });
        }
        let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
        let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 1000;
        if (req.query.category) {
            query = Object.assign(Object.assign({}, query), { "categoryArr.categoryId": req.query.category });
        }
        if (req.query.role && req.query.role != null && req.query.role != "null") {
            query = Object.assign(Object.assign({}, query), { "createdByObj.role": { $ne: req.query.role } });
        }
        if (req.query.users) {
            let usersArr = `${req.query.users}`.split(",");
            console.log(usersArr, "usersArr");
            query = Object.assign(Object.assign({}, query), { "createdById": { $in: [...usersArr.map(el => new mongoose_1.default.Types.ObjectId(el))] } });
        }
        if (req.query.categories) {
            let categoryArr = `${req.query.categories}`.split(",");
            query = Object.assign(Object.assign({}, query), { "categoryArr.categoryId": { $in: [...categoryArr] } });
        }
        if (req.query.locations) {
            let locationArr = `${req.query.locations}`.split(",");
            query = Object.assign(Object.assign({}, query), { "createdByObj.cityId": { $in: [...locationArr] } });
        }
        if (req.query.city) {
            let locationArr = `${req.query.city}`.split(",");
            query = Object.assign(Object.assign({}, query), { "createdByObj.state": { $in: [...locationArr] } });
        }
        if (req.query.rating) {
            let ratingValue = +req.query.rating;
            query = Object.assign(Object.assign({}, query), { "createdByObj.rating": { $gte: ratingValue } });
        }
        if (req.query.vendors) {
            let vendorArr = `${req.query.vendors}`.split(",");
            query = Object.assign(Object.assign({}, query), { $or: vendorArr.map((el) => ({ "brand": el })) });
        }
        if (req.query.minPrice) {
            if (query.sellingprice) {
                query = Object.assign(Object.assign({}, query), { sellingprice: Object.assign(Object.assign({}, query.sellingprice), { $gte: req.query.minPrice }) });
            }
            else {
                query = Object.assign(Object.assign({}, query), { sellingprice: { $gte: req.query.minPrice } });
            }
        }
        if (req.query.maxPrice) {
            let maxPrice = +req.query.maxPrice;
            if (query.sellingprice) {
                query = Object.assign(Object.assign({}, query), { sellingprice: Object.assign(Object.assign({}, query.sellingprice), { $lte: maxPrice }) });
            }
            else {
                query = Object.assign(Object.assign({}, query), { sellingprice: { $lte: maxPrice } });
            }
        }
        console.log(query);
        ProductArr = yield product_model_1.Product.find(query).skip((pageValue - 1) * limitValue).limit(limitValue).exec();
        let totalElements = yield product_model_1.Product.find(query).count().exec();
        console.log(totalElements, ProductArr === null || ProductArr === void 0 ? void 0 : ProductArr.length);
        res.status(200).json({ message: "getProduct", data: ProductArr, totalElements: totalElements, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getProduct = getProduct;
const updateById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.body);
        const ProductObj = yield product_model_1.Product.findById(req.params.id).lean().exec();
        if (!ProductObj) {
            throw new Error(" Product not found");
        }
        let obj = {};
        if (req.body.image && `${req.body.image}`.includes("base64")) {
            req.body.mainImage = yield (0, fileSystem_1.storeFileAndReturnNameBase64)(req.body.image);
        }
        if (req.body.name) {
            req.body.slug = yield (0, stringify_1.string_to_slug)(req.body.name);
        }
        if (req.body.categoryArr) {
            for (let el of req.body.categoryArr) {
                let categoryObj = yield category_model_1.Category.findById(el.categoryId).lean().exec();
                if (!categoryObj)
                    throw { message: "Product Category not found" };
            }
        }
        if (req.body.imageArr && req.body.imageArr.length > 0) {
            if (req.body.imageArr && req.body.imageArr > 3) {
                throw new Error("Cannot add more than 3 images");
            }
            for (const el of req.body.imageArr) {
                if (el.image != "" && `${el.image}`.includes("base64")) {
                    console.log(`${el.image}`.includes("base64"), `${el.image}`.includes("base64"));
                    el.image = yield (0, fileSystem_1.storeFileAndReturnNameBase64)(el.image);
                }
                else {
                    if (el.image == "") {
                        req.body.imageArr.splice(req.body.imageArr.findIndex((a) => a.id === el.id), 1);
                    }
                }
            }
        }
        else {
            delete req.body.imageArr;
        }
        console.log(req.body.bannerImage, "req.body.bannerImage");
        if (req.body.bannerImage && req.body.bannerImage != "" && `${req.body.bannerImage}`.includes("base64")) {
            console.log("ASDASDASDASDAS");
            req.body.bannerImage = yield (0, fileSystem_1.storeFileAndReturnNameBase64)(req.body.bannerImage);
        }
        if (req.body.image && req.body.image != "" && `${req.body.image}`.includes("base64")) {
            req.body.bannerImage = yield (0, fileSystem_1.storeFileAndReturnNameBase64)(req.body.image);
        }
        yield product_model_1.Product.findByIdAndUpdate(req.params.id, req.body).exec();
        res.status(200).json({ message: "Product Updated", success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.updateById = updateById;
const deleteById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ProductObj = yield product_model_1.Product.findByIdAndDelete(req.params.id).exec();
        if (!ProductObj)
            throw { status: 400, message: "Product Not Found" };
        res.status(200).json({ message: "Product Deleted", success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.deleteById = deleteById;
const getById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ProductObj = yield product_model_1.Product.findById(req.params.id).exec();
        console.log(ProductObj);
        if (!ProductObj)
            throw { status: 400, message: "Product Not Found" };
        res.status(200).json({ message: "Product Found", data: ProductObj, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getById = getById;
const getProductById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const today = new Date();
        let ProductObj = yield product_model_1.Product.findOne({ slug: req.params.id }).lean().exec();
        if (!ProductObj)
            throw { status: 400, message: "Product Not Found" };
        console.log(ProductObj.brandId, "ProductObj.brandObjProductObj.brandObj");
        if (ProductObj.brand) {
            ProductObj.brandObj = yield brand_model_1.Brand.findById(ProductObj.brand).lean().exec();
        }
        if (ProductObj === null || ProductObj === void 0 ? void 0 : ProductObj.createdByObj._id) {
            ProductObj.createdByObj.userObj = yield user_model_1.User.findById((_b = ProductObj === null || ProductObj === void 0 ? void 0 : ProductObj.createdByObj) === null || _b === void 0 ? void 0 : _b._id).lean().exec();
        }
        console.log(ProductObj._id, "CHECK THIS");
        const flashSaleObj = yield FlashSale_model_1.FlashSale.findOne({ productId: ProductObj._id, startDate: { $gte: today } })
            .lean()
            .exec();
        if (flashSaleObj) {
            ProductObj.flashSaleObj = flashSaleObj;
            console.log(flashSaleObj);
            ProductObj.sellingprice = flashSaleObj === null || flashSaleObj === void 0 ? void 0 : flashSaleObj.salePrice;
        }
        res.status(200).json({ message: "Product Found", data: ProductObj, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getProductById = getProductById;
const getSimilarProducts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productArr = yield product_model_1.Product.find({ categoryId: new mongoose_1.default.Types.ObjectId(req.params.id) }).exec();
        if (!productArr)
            throw new Error("Products not found");
        res.status(200).json({ message: "Products", data: productArr, success: true });
    }
    catch (error) {
        next(error);
    }
});
exports.getSimilarProducts = getSimilarProducts;
const getAllProductsBySupplierId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("!@@");
        const productArr = yield product_model_1.Product.find({ createdById: req.params.id, approved: "APPROVED" }).exec();
        if (!productArr)
            throw new Error("Products not found");
        res.status(200).json({ message: "Products", data: productArr, success: true });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllProductsBySupplierId = getAllProductsBySupplierId;
const searchProductWithQuery = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let query = {};
        if (req.query.role && !req.query.role == null) {
            query = Object.assign(Object.assign({}, query), { "createdByObj.role": { $ne: req.query.role } });
        }
        if (req.query.name) {
            query = Object.assign(Object.assign({}, query), { $or: [
                    { name: new RegExp(`${req.query.name}`, "i") },
                    { "createdByObj.name": new RegExp(`${req.query.name}`, "i") },
                    { "shortDescription": new RegExp(`${req.query.name}`, "i") },
                    { "longDescription": new RegExp(`${req.query.name}`, "i") },
                ] });
            // { "brandId": new RegExp(`${req.query.name}`, "i") },
            let brandArr = yield brand_model_1.Brand.find({ name: new RegExp(`${req.query.name}`, "i") }).exec();
            if (brandArr && brandArr.length > 0) {
                query = Object.assign(Object.assign({}, query), { $or: [
                        { name: new RegExp(`${req.query.name}`, "i") },
                        { "createdByObj.name": new RegExp(`${req.query.name}`, "i") },
                        { "shortDescription": new RegExp(`${req.query.name}`, "i") },
                        { "longDescription": new RegExp(`${req.query.name}`, "i") },
                        { "brand": { $in: [...brandArr.map(el => `${el._id}`)] } },
                    ] });
            }
        }
        console.log(JSON.stringify(query, null, 2), "query");
        const arr = yield product_model_1.Product.find(query).select({ name: 1, _id: 1, slug: 1 })
            .lean()
            .exec();
        res.status(200).json({ message: "Arr", data: arr, success: true });
    }
    catch (error) {
        next(error);
    }
});
exports.searchProductWithQuery = searchProductWithQuery;
const updateAppById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ProductObj = yield product_model_1.Product.findById(req.params.id).lean().exec();
        if (!ProductObj) {
            throw new Error(" Product not found");
        }
        let obj = {};
        if (req.body.image && `${req.body.image}`.includes("data:image")) {
            req.body.mainImage = yield (0, fileSystem_1.storeFileAndReturnNameBase64)(req.body.image);
        }
        if (req.body.name) {
            req.body.slug = yield (0, stringify_1.string_to_slug)(req.body.name);
        }
        if (req.body.categoryArr) {
            for (let el of req.body.categoryArr) {
                let categoryObj = yield category_model_1.Category.findById(el.categoryId).lean().exec();
                if (!categoryObj)
                    throw { message: "Product Category not found" };
            }
        }
        if (req.body.imageArr && req.body.imageArr.length > 0) {
            if (req.body.imageArr && req.body.imageArr > 3) {
                throw new Error("Cannot add more than 3 images");
            }
            for (const el of req.body.imageArr) {
                if (el.image != "" && `${el.image}`.includes("base64")) {
                    console.log(`${el.image}`.includes("base64"), `${el.image}`.includes("base64"));
                    el.image = yield (0, fileSystem_1.storeFileAndReturnNameBase64)(el.image);
                }
                else {
                    if (el.image == "") {
                        req.body.imageArr.splice(req.body.imageArr.findIndex((a) => a.id === el.id), 1);
                    }
                }
            }
        }
        else {
            delete req.body.imageArr;
        }
        if (req.body.bannerImage && `${req.body.bannerImage}`.includes("data:image")) {
            req.body.bannerImage = yield (0, fileSystem_1.storeFileAndReturnNameBase64)(req.body.bannerImage);
        }
        yield product_model_1.Product.findByIdAndUpdate(req.params.id, req.body).exec();
        res.status(200).json({ message: "Product Updated", success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.updateAppById = updateAppById;
const getTopSellingProducts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const topSellingProducts = yield product_model_1.Product.find()
            .sort({ sellingprice: -1 }) // Sort by sellingprice in descending order
            .limit(10); // Limit to top 10 products (or however many you want)
        res.status(200).json({ message: "Top Selling Products", data: topSellingProducts, success: true });
    }
    catch (error) {
        next(error);
    }
});
exports.getTopSellingProducts = getTopSellingProducts;
