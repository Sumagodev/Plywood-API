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
exports.getById = exports.deleteById = exports.updateById = exports.getAdvertisementSubscriptionForHomepage = exports.getAdvertisementSubscription = exports.addAdvertisementSubscription = void 0;
const dateUtils_1 = require("../helpers/dateUtils");
const fileSystem_1 = require("../helpers/fileSystem");
const AdvertisementSubscription_model_1 = require("../models/AdvertisementSubscription.model");
const user_model_1 = require("../models/user.model");
const City_model_1 = require("../models/City.model");
const product_model_1 = require("../models/product.model");
const addAdvertisementSubscription = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.body);
        // const AdvertisementSubscriptionNameCheck = await AdvertisementSubscription.findOne({
        //     name: new RegExp(`^${req.body.name}$`, "i"),
        // }).exec();
        // if (AdvertisementSubscriptionNameCheck) throw new Error("Entry Already exist please change name ");
        const FlashSaleCheck = yield AdvertisementSubscription_model_1.Advertisement.findOne({
            productId: req.body.productId, userId: req.body.userId, $or: [
                { startDate: { $lte: req.body.startDate }, endDate: { $gte: req.body.startDate } },
                { startDate: { $lte: req.body.endDate }, endDate: { $gte: req.body.endDate } },
                { startDate: { $gt: req.body.startDate }, endDate: { $lt: req.body.endDate } }
            ]
        }).exec();
        if (FlashSaleCheck)
            throw new Error("Entry Already exist, cannot create new advertisement please change product or dates to create one ");
        let userObj = yield user_model_1.User.findById(req.body.userId).exec();
        if (!userObj) {
            throw new Error("User not found !!!");
        }
        if (req.body.image) {
            req.body.image = yield (0, fileSystem_1.storeFileAndReturnNameBase64)(req.body.image);
        }
        let dateDiff = (0, dateUtils_1.dateDifference)(req.body.startDate, req.body.endDate);
        if ((userObj.advertisementDays - dateDiff) <= 0) {
            throw new Error("You do not have enough advertisement days left in you account to create this advertisement please reduce the duration of the advertisement or purchase a topup.");
        }
        yield user_model_1.User.findByIdAndUpdate(userObj === null || userObj === void 0 ? void 0 : userObj._id, { $inc: { numberOfAdvertisement: -1, advertisementDays: -dateDiff } }).exec();
        if (req.body.endDate) {
            req.body.endDate = new Date(req.body.endDate);
            req.body.endDate.setHours(23, 59, 59, 59);
        }
        if (req.body.startDate) {
            req.body.startDate = new Date(req.body.startDate);
            req.body.startDate.setHours(0, 0, 0, 0);
        }
        const newEntry = new AdvertisementSubscription_model_1.Advertisement(req.body).save();
        if (!newEntry) {
            throw new Error("Unable to create Advertisement Subscription");
        }
        res.status(200).json({ message: "Advertisement Subscription Successfully Created", success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.addAdvertisementSubscription = addAdvertisementSubscription;
const getAdvertisementSubscription = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let AdvertisementSubscriptionArr = [];
        let query = {};
        if (req.query.userId) {
            query.userId = req.query.userId;
        }
        let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
        let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 1000;
        let AdvertisementsubscriptionCount = yield AdvertisementSubscription_model_1.Advertisement.find(query).countDocuments();
        AdvertisementSubscriptionArr = yield AdvertisementSubscription_model_1.Advertisement.find(query).skip((pageValue - 1) * limitValue).limit(limitValue).lean().sort({ createdAt: -1 }).populate("productId").populate("userId").exec();
        if (req.query.q) {
            AdvertisementSubscriptionArr = AdvertisementSubscriptionArr.filter((el) => `${el.productId.name}`.toLowerCase().includes(`${req.query.q}`.toLowerCase()) || `${el.userId.name}`.toLowerCase().includes(`${req.query.q}`.toLowerCase()) || `${el.message}`.toLowerCase().includes(`${req.query.q}`.toLowerCase()));
            // query = { ...query, $or: [{ name: new RegExp(`${req.query.q}`, "i") }] };
        }
        // for (let AdvertisementSubscription of AdvertisementSubscriptionArr) {
        //   if (AdvertisementSubscription.AdvertisementSubscriptionId) {
        //     console.log(AdvertisementSubscription.AdvertisementSubscriptionId, "AdvertisementSubscriptionIdAdvertisementSubscriptionId")
        //     AdvertisementSubscription.AdvertisementSubscriptionObj = await AdvertisementSubscription.findById(AdvertisementSubscription.AdvertisementSubscriptionId).exec();
        //   }
        // }
        res.status(200).json({ message: "get Advertisement Subscription", data: AdvertisementSubscriptionArr, AdvertisementsubscriptionCount, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getAdvertisementSubscription = getAdvertisementSubscription;
// export const getAdvertisementSubscriptionForHomepage = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         let AdvertisementSubscriptionArr: any = [];
//         let query: any = {}
//         let today = new Date();
//         today.setHours(23, 59, 59, 59);
//         console.log(req.query, "req.query.q")
//         if (req.query.q) {
//             query.name = new RegExp(`${req.query.q}`, "i");
//         }
//         AdvertisementSubscriptionArr = await Advertisement.find().lean().exec();
//         // for (let AdvertisementSubscription of AdvertisementSubscriptionArr) {
//         //   if (AdvertisementSubscription.AdvertisementSubscriptionId) {
//         //     console.log(AdvertisementSubscription.AdvertisementSubscriptionId, "AdvertisementSubscriptionIdAdvertisementSubscriptionId")
//         //     AdvertisementSubscription.AdvertisementSubscriptionObj = await AdvertisementSubscription.findById(AdvertisementSubscription.AdvertisementSubscriptionId).exec();
//         //   }
//         // }
//         res.status(200).json({ message: "get Advertisement Subscription", data: AdvertisementSubscriptionArr, success: true });
//     } catch (err) {
//         next(err);
//     }
// };
const getAdvertisementSubscriptionForHomepage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Initialize variables
        let AdvertisementSubscriptionArr = [];
        let query = {};
        // Check for search query
        if (req.query.q) {
            query.name = new RegExp(req.query.q, "i");
        }
        // Find all advertisements with query
        const advertisements = yield AdvertisementSubscription_model_1.Advertisement.find(query).lean().exec();
        // Collect userIds and productIds
        const userIds = advertisements.map(ad => ad.userId);
        const productIds = advertisements.map(ad => ad.productId);
        // Fetch users and products in parallel
        const users = yield user_model_1.User.find({ _id: { $in: userIds } }).lean().exec();
        const products = yield product_model_1.Product.find({ _id: { $in: productIds } }).lean().exec();
        // Create maps for city names and product prices
        const cityMap = new Map();
        const productMap = new Map();
        // Populate cityMap
        for (const user of users) {
            cityMap.set(user._id.toString(), user.cityId.toString());
        }
        // Populate productMap
        // for (const product of products) {
        //     productMap.set(product._id.toString(), product.price);
        // }
        // Fetch cities based on city IDs
        const cityIds = Array.from(new Set(cityMap.values())); // Unique cityIds
        const cities = yield City_model_1.City.find({ _id: { $in: cityIds } }).lean().exec();
        const cityNameMap = new Map(cities.map(city => [city._id.toString(), city.name]));
        // Enhance advertisements with city names and product prices
        AdvertisementSubscriptionArr = advertisements.map(ad => {
            const cityId = cityMap.get(ad.userId.toString());
            const cityName = cityId ? cityNameMap.get(cityId) || 'Unknown City' : 'Unknown City';
            const price = productMap.get(ad.productId.toString()) || 'N/A';
            return Object.assign(Object.assign({}, ad), { cityName,
                price });
        });
        res.status(200).json({
            message: "Get Advertisement Subscription",
            data: AdvertisementSubscriptionArr,
            success: true
        });
    }
    catch (err) {
        next(err);
    }
});
exports.getAdvertisementSubscriptionForHomepage = getAdvertisementSubscriptionForHomepage;
const updateById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const AdvertisementSubscriptionObj = yield AdvertisementSubscription_model_1.Advertisement.findById(req.params.id).lean().exec();
        if (!AdvertisementSubscriptionObj) {
            throw new Error("Advertisement Subscription not found");
        }
        if (req.body.image && req.body.image.includes("base64")) {
            req.body.image = yield (0, fileSystem_1.storeFileAndReturnNameBase64)(req.body.image);
        }
        yield AdvertisementSubscription_model_1.Advertisement.findByIdAndUpdate(req.params.id, req.body).exec();
        res.status(200).json({ message: "Advertisement Subscription Updated", success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.updateById = updateById;
const deleteById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const AdvertisementSubscriptionObj = yield AdvertisementSubscription_model_1.Advertisement.findByIdAndDelete(req.params.id).exec();
        if (!AdvertisementSubscriptionObj)
            throw { status: 400, message: "Advertisement Subscription Not Found" };
        res.status(200).json({ message: "Advertisement Subscription Deleted", success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.deleteById = deleteById;
const getById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let AdvertisementSubscriptionObj = yield AdvertisementSubscription_model_1.Advertisement.findById(req.params.id).lean().exec();
        if (!AdvertisementSubscriptionObj)
            throw { status: 400, message: "Advertisement Subscription Not Found" };
        res.status(200).json({ message: "Advertisement Subscription Found", data: AdvertisementSubscriptionObj, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getById = getById;
