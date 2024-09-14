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
exports.getProductYouMayLike = exports.updateAppById = exports.searchProductWithQuery = exports.getAllProductsBySupplierId = exports.getSimilarProducts = exports.getProductById = exports.getById = exports.deleteById = exports.updateById = exports.addProduct = exports.getProduct = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const fileSystem_1 = require("../helpers/fileSystem");
const product_model_1 = require("../models/product.model");
const stringify_1 = require("../helpers/stringify");
const category_model_1 = require("../models/category.model");
const brand_model_1 = require("../models/brand.model");
const user_model_1 = require("../models/user.model");
const City_model_1 = require("../models/City.model");
const State_model_1 = require("../models/State.model");
const FlashSale_model_1 = require("../models/FlashSale.model");
const getProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
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
        if (req.query.role && req.query.role != "null") {
            query = Object.assign(Object.assign({}, query), { "createdByObj.role": { $ne: req.query.role } });
        }
        if (req.query.users) {
            let usersArr = `${req.query.users}`.split(",");
            query = Object.assign(Object.assign({}, query), { "createdById": { $in: usersArr.map(el => new mongoose_1.default.Types.ObjectId(el)) } });
        }
        if (req.query.categories) {
            let categoryArr = `${req.query.categories}`.split(",");
            query = Object.assign(Object.assign({}, query), { "categoryArr.categoryId": { $in: categoryArr } });
        }
        if (req.query.locations) {
            let locationArr = `${req.query.locations}`.split(",");
            query = Object.assign(Object.assign({}, query), { "createdByObj.cityId": { $in: locationArr } });
        }
        if (req.query.city) {
            let locationArr = `${req.query.city}`.split(",");
            query = Object.assign(Object.assign({}, query), { "createdByObj.state": { $in: locationArr } });
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
            query.sellingprice = query.sellingprice || {};
            query.sellingprice.$gte = req.query.minPrice;
        }
        if (req.query.maxPrice) {
            query.sellingprice = query.sellingprice || {};
            query.sellingprice.$lte = +req.query.maxPrice;
        }
        // Fetch the products based on the query
        const products = yield product_model_1.Product.find(query).skip((pageValue - 1) * limitValue).limit(limitValue).lean().exec();
        const userIds = products.map(product => product === null || product === void 0 ? void 0 : product.createdById).filter(Boolean); // Ensure no undefined values
        // Fetch users based on the createdById in the products
        const users = yield user_model_1.User.find({ _id: { $in: userIds } }).lean().exec();
        // Create maps for city and state names
        const cityIds = Array.from(new Set(users.map(user => user === null || user === void 0 ? void 0 : user.cityId).filter(Boolean)));
        const stateIds = Array.from(new Set(users.map(user => user === null || user === void 0 ? void 0 : user.stateId).filter(Boolean)));
        const cities = yield City_model_1.City.find({ _id: { $in: cityIds } }).lean().exec();
        const states = yield State_model_1.State.find({ _id: { $in: stateIds } }).lean().exec();
        const cityNameMap = new Map(cities.map(city => [city._id.toString(), city.name]));
        const stateNameMap = new Map(states.map(state => [state._id.toString(), state.name]));
        // Add city and state names, product image, price, verification status, and phone to the products
        const populatedProducts = products.map(product => {
            var _a, _b, _c;
            const createdByUser = users.find(user => { var _a; return (user === null || user === void 0 ? void 0 : user._id.toString()) === ((_a = product === null || product === void 0 ? void 0 : product.createdById) === null || _a === void 0 ? void 0 : _a.toString()); });
            const cityName = createdByUser ? cityNameMap.get((_a = createdByUser === null || createdByUser === void 0 ? void 0 : createdByUser.cityId) === null || _a === void 0 ? void 0 : _a.toString()) : "Unknown City";
            const stateName = createdByUser ? stateNameMap.get((_b = createdByUser === null || createdByUser === void 0 ? void 0 : createdByUser.stateId) === null || _b === void 0 ? void 0 : _b.toString()) : "Unknown State";
            const phone = (createdByUser === null || createdByUser === void 0 ? void 0 : createdByUser.phone) || "Unknown Phone";
            const isVerified = (createdByUser === null || createdByUser === void 0 ? void 0 : createdByUser.isVerified) || false;
            const productImg = ((_c = product === null || product === void 0 ? void 0 : product.imageArr) === null || _c === void 0 ? void 0 : _c.length) > 0 ? product.imageArr[0] : "No Image Available";
            return Object.assign({ cityName,
                stateName,
                productImg, productPrice: product === null || product === void 0 ? void 0 : product.sellingprice, // Assuming 'sellingprice' is the field for the product price
                isVerified,
                phone }, product);
        });
        const totalElements = yield product_model_1.Product.find(query).countDocuments().exec();
        res.status(200).json({ message: "getProduct", data: populatedProducts, totalElements, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getProduct = getProduct;
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
// export const getProduct = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     let ProductArr: any = [];
//     let query: any = {};
//     if (req.query.userId) {
//       query.createdById = req.query.userId;
//     }
//     if (req.query.searchQuery) {
//       query = { ...query, name: new RegExp(`${req.query.searchQuery}`, "i") };
//     }
//     if (req.query.q) {
//       query = { ...query, name: new RegExp(`${req.query.q}`, "i") };
//     }
//     let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
//     let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 1000;
//     if (req.query.category) {
//       query = { ...query, "categoryArr.categoryId": req.query.category };
//     }
//     if (req.query.role && req.query.role != null && req.query.role != "null") {
//       query = { ...query, "createdByObj.role": { $ne: req.query.role } };
//     }
//     if (req.query.users) {
//       let usersArr = `${req.query.users}`.split(",");
//       console.log(usersArr, "usersArr")
//       query = { ...query, "createdById": { $in: [...usersArr.map(el => new mongoose.Types.ObjectId(el))] } };
//     }
//     if (req.query.categories) {
//       let categoryArr = `${req.query.categories}`.split(",");
//       query = { ...query, "categoryArr.categoryId": { $in: [...categoryArr] } };
//     }
//     if (req.query.locations) {
//       let locationArr = `${req.query.locations}`.split(",");
//       query = { ...query, "createdByObj.cityId": { $in: [...locationArr] } };
//     }
//     if (req.query.city) {
//       let locationArr = `${req.query.city}`.split(",");
//       query = { ...query, "createdByObj.state": { $in: [...locationArr] } };
//     }
//     if (req.query.rating) {
//       let ratingValue: number = +req.query.rating;
//       query = { ...query, "createdByObj.rating": { $gte: ratingValue } };
//     }
//     if (req.query.vendors) {
//       let vendorArr: any = `${req.query.vendors}`.split(",");
//       query = { ...query, $or: vendorArr.map((el: any) => ({ "brand": el })) };
//     }
//     if (req.query.minPrice) {
//       if (query.sellingprice) {
//         query = { ...query, sellingprice: { ...query.sellingprice, $gte: req.query.minPrice } };
//       } else {
//         query = { ...query, sellingprice: { $gte: req.query.minPrice } };
//       }
//     }
//     if (req.query.maxPrice) {
//       let maxPrice: number = +req.query.maxPrice;
//       if (query.sellingprice) {
//         query = { ...query, sellingprice: { ...query.sellingprice, $lte: maxPrice } };
//       } else {
//         query = { ...query, sellingprice: { $lte: maxPrice } };
//       }
//     }
//     console.log(query);
//     ProductArr = await Product.find(query).skip((pageValue - 1) * limitValue).limit(limitValue).exec();
//     let totalElements = await Product.find(query).count().exec();
//     console.log(totalElements, ProductArr?.length);
//     res.status(200).json({ message: "getProduct", data: ProductArr, totalElements: totalElements, success: true });
//   } catch (err) {
//     next(err);
//   }
// };
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
        const productArr = yield product_model_1.Product.find({ categoryId: new mongoose_1.default.Types.ObjectId(req.params.id) }).lean().exec();
        if (!productArr)
            throw new Error("Products not found");
        // Extract userIds and cityIds from the products (assuming the user is linked to each product)
        const userIds = productArr.map(product => product.createdById);
        // Fetch users associated with these products
        const users = yield user_model_1.User.find({ _id: { $in: userIds } }).lean().exec();
        const cityIds = users.map(user => user.cityId);
        // Fetch the city names based on cityIds
        const cities = yield City_model_1.City.find({ _id: { $in: cityIds } }).lean().exec();
        // Create a mapping of cityId to city name
        const cityMap = new Map(cities.map(city => [city._id.toString(), city.name]));
        // Create a user map to easily get user details
        const userMap = new Map(users.map(user => [user._id.toString(), user]));
        // Map through products and include the desired fields along with city name
        const filteredProducts = productArr.map((product) => {
            const user = userMap.get(product.createdById.toString());
            const cityName = user ? cityMap.get(user.cityId.toString()) || 'Unknown City' : 'Unknown City';
            return {
                categoryId: product.categoryId,
                cityName,
                productName: product.name,
                isVerified: (user === null || user === void 0 ? void 0 : user.isVerified) || false,
                price: product.sellingprice
            };
        });
        res.status(200).json({
            message: "Filtered Products with City Names",
            data: filteredProducts,
            success: true
        });
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
// export const searchProductWithQuery: RequestHandler = async (req, res, next) => {
//   try {
//     let query: any = {};
//     if (req.query.role && !req.query.role == null) {
//       query = { ...query, "createdByObj.role": { $ne: req.query.role } };
//     }
//     if (req.query.name) {
//       query = {
//         ...query, $or: [
//           { name: new RegExp(`${req.query.name}`, "i") },
//           { "createdByObj.name": new RegExp(`${req.query.name}`, "i") },
//           { "shortDescription": new RegExp(`${req.query.name}`, "i") },
//           { "longDescription": new RegExp(`${req.query.name}`, "i") },
//         ]
//       };
//       // { "brandId": new RegExp(`${req.query.name}`, "i") },
//       let brandArr = await Brand.find({ name: new RegExp(`${req.query.name}`, "i") }).exec()
//       if (brandArr && brandArr.length > 0) {
//         query = {
//           ...query, $or: [
//             { name: new RegExp(`${req.query.name}`, "i") },
//             { "createdByObj.name": new RegExp(`${req.query.name}`, "i") },
//             { "shortDescription": new RegExp(`${req.query.name}`, "i") },
//             { "longDescription": new RegExp(`${req.query.name}`, "i") },
//             { "brand": { $in: [...brandArr.map(el => `${el._id}`)] } },
//           ]
//         }
//       }
//     }
//     console.log(JSON.stringify(query, null, 2), "query")
//     const arr = await Product.find(query).select({ name: 1, _id: 1, slug: 1 })
//       .lean()
//       .exec();
//     res.status(200).json({ message: "Arr", data: arr, success: true });
//   } catch (error) {
//     next(error);
//   }
// };
const searchProductWithQuery = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let query = {};
        // Role filter
        if (req.query.role && req.query.role !== "null") {
            query = Object.assign(Object.assign({}, query), { "createdByObj.role": { $ne: req.query.role } });
        }
        // Name, creator's name, short description, long description, and brand name filter
        if (req.query.name) {
            const regex = new RegExp(`${req.query.name}`, "i");
            let brandArr = yield brand_model_1.Brand.find({ name: regex }).exec();
            let brandIds = brandArr.length > 0 ? brandArr.map(el => `${el._id}`) : [];
            query = Object.assign(Object.assign({}, query), { $or: [
                    { name: regex },
                    { "createdByObj.name": regex },
                    { "shortDescription": regex },
                    { "longDescription": regex },
                    ...(brandIds.length > 0 ? [{ "brand": { $in: brandIds } }] : [])
                ] });
        }
        // Category filter
        if (req.query.categoryId) {
            query = Object.assign(Object.assign({}, query), { "categoryId": req.query.categoryId });
        }
        // Price filter
        if (req.query.minPrice || req.query.maxPrice) {
            const priceQuery = {};
            if (req.query.minPrice)
                priceQuery.$gte = parseFloat(req.query.minPrice);
            if (req.query.maxPrice)
                priceQuery.$lte = parseFloat(req.query.maxPrice);
            query = Object.assign(Object.assign({}, query), { "price": priceQuery });
        }
        // Selling Price filter
        if (req.query.minSellingPrice || req.query.maxSellingPrice) {
            const sellingPriceQuery = {};
            if (req.query.minSellingPrice)
                sellingPriceQuery.$gte = parseFloat(req.query.minSellingPrice);
            if (req.query.maxSellingPrice)
                sellingPriceQuery.$lte = parseFloat(req.query.maxSellingPrice);
            query = Object.assign(Object.assign({}, query), { "sellingprice": sellingPriceQuery });
        }
        // Specification filters
        if (req.query.thickness) {
            query = Object.assign(Object.assign({}, query), { "specification.thickness": new RegExp(`${req.query.thickness}`, "i") });
        }
        if (req.query.application) {
            query = Object.assign(Object.assign({}, query), { "specification.application": new RegExp(`${req.query.application}`, "i") });
        }
        if (req.query.grade) {
            query = Object.assign(Object.assign({}, query), { "specification.grade": new RegExp(`${req.query.grade}`, "i") });
        }
        if (req.query.color) {
            query = Object.assign(Object.assign({}, query), { "specification.color": new RegExp(`${req.query.color}`, "i") });
        }
        if (req.query.size) {
            query = Object.assign(Object.assign({}, query), { "specification.size": new RegExp(`${req.query.size}`, "i") });
        }
        if (req.query.wood) {
            query = Object.assign(Object.assign({}, query), { "specification.wood": new RegExp(`${req.query.wood}`, "i") });
        }
        if (req.query.glue) {
            query = Object.assign(Object.assign({}, query), { "specification.glue": new RegExp(`${req.query.glue}`, "i") });
        }
        if (req.query.warranty) {
            query = Object.assign(Object.assign({}, query), { "specification.warranty": new RegExp(`${req.query.warranty}`, "i") });
        }
        // Status filter
        if (req.query.status) {
            query = Object.assign(Object.assign({}, query), { status: req.query.status === "true" });
        }
        // Approval status filter
        if (req.query.approved) {
            query = Object.assign(Object.assign({}, query), { approved: req.query.approved });
        }
        // User filters
        if (req.query.userName || req.query.userEmail || req.query.userPhone) {
            const userQuery = {};
            if (req.query.userName) {
                userQuery.name = new RegExp(`${req.query.userName}`, "i");
            }
            if (req.query.userEmail) {
                userQuery.email = new RegExp(`${req.query.userEmail}`, "i");
            }
            if (req.query.userPhone) {
                userQuery.phone = new RegExp(`${req.query.userPhone}`, "i");
            }
            const users = yield user_model_1.User.find(userQuery).select('_id').exec();
            const userIds = users.map(user => user._id);
            query = Object.assign(Object.assign({}, query), { createdById: { $in: userIds } });
        }
        console.log(JSON.stringify(query, null, 2), "query");
        const arr = yield product_model_1.Product.find(query)
            .populate('createdById', 'name email phone')
            .select({ name: 1, _id: 1, slug: 1, price: 1, sellingprice: 1, brand: 1 })
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
const getProductYouMayLike = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const defaultCriteria = {};
        if (req.query.category) {
            defaultCriteria.categoryId = req.query.category;
        }
        if (req.query.brand) {
            defaultCriteria.brand = req.query.brand;
        }
        const products = yield product_model_1.Product.find(defaultCriteria)
            .limit(10)
            .lean()
            .exec();
        const userIds = products.map((product) => product.createdById);
        const productIds = products.map((product) => product._id);
        const [users, productDetails] = yield Promise.all([
            user_model_1.User.find({ _id: { $in: userIds } }).lean().exec(),
            product_model_1.Product.find({ _id: { $in: productIds } }).lean().exec(),
        ]);
        // Create maps for cities and states
        const cityMap = new Map();
        const stateMap = new Map();
        users.forEach((user) => {
            cityMap.set(user._id.toString(), user.cityId);
            stateMap.set(user._id.toString(), user.stateId); // Store stateId for each user
        });
        // Fetch city names
        const cityIds = Array.from(new Set(users.map((user) => user.cityId)));
        const cities = yield City_model_1.City.find({ _id: { $in: cityIds } }).lean().exec();
        const cityNameMap = new Map(cities.map((city) => [city._id.toString(), city.name]));
        // Fetch state names
        const stateIds = Array.from(new Set(users.map((user) => user.stateId)));
        const states = yield State_model_1.State.find({ _id: { $in: stateIds } }).lean().exec();
        const stateNameMap = new Map(states.map((state) => [state._id.toString(), state.name]));
        const populatedProducts = yield Promise.all(products.map((product) => __awaiter(void 0, void 0, void 0, function* () {
            if (product.brand) {
                product.brandObj = yield brand_model_1.Brand.findById(product.brand).lean().exec();
            }
            // Find the user who created the product
            const createdByObj = users.find((user) => user._id.toString() === product.createdById.toString());
            // Get city and state details
            const cityId = (createdByObj === null || createdByObj === void 0 ? void 0 : createdByObj.cityId) || null;
            const cityName = cityId ? cityNameMap.get(cityId.toString()) || "Unknown City" : "Unknown City";
            const stateId = (createdByObj === null || createdByObj === void 0 ? void 0 : createdByObj.stateId) || null;
            const stateName = stateId ? stateNameMap.get(stateId.toString()) || "Unknown State" : "Unknown State";
            const address = (createdByObj === null || createdByObj === void 0 ? void 0 : createdByObj.address) || "Unknown Address";
            // Fetch product details
            const productDetail = productDetails.find((p) => p._id.toString() === product._id.toString());
            const productName = productDetail ? productDetail.name : "Unknown Product";
            const productPrice = productDetail ? productDetail.price : "N/A";
            const productData = Object.assign({}, product); // Clone the product object
            // Remove the token field if it exists
            if (productData.createdByObj && 'token' in productData.createdByObj) {
                delete productData.createdByObj.token;
            }
            return {
                cityName,
                stateName,
                address,
                // Include address in the response
                productName,
                productPrice,
                createdByObj,
                product
            };
        })));
        res.json({ message: 'Suggested Products', data: populatedProducts });
    }
    catch (error) {
        next(error);
    }
});
exports.getProductYouMayLike = getProductYouMayLike;
