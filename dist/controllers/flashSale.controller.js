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
exports.getById = exports.deleteById = exports.updateById = exports.getAllFlashSales = exports.getFlashSale = exports.addFlashSale = void 0;
const dateUtils_1 = require("../helpers/dateUtils");
const FlashSale_model_1 = require("../models/FlashSale.model");
const user_model_1 = require("../models/user.model");
const Notifications_model_1 = require("../models/Notifications.model");
const product_model_1 = require("../models/product.model");
const addFlashSale = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        let today = new Date();
        // const FlashSaleCheck = await FlashSale.findOne({
        //     productId: req.body.productId, userId: req.body.userId, $or: [
        //         { startDate: { $lte: req.body.startDate }, endDate: { $gte: req.body.startDate } },
        //         { startDate: { $lte: req.body.endDate }, endDate: { $gte: req.body.endDate } },
        //         { startDate: { $gt: req.body.startDate }, endDate: { $lt: req.body.endDate } }
        //     ]
        // }).exec();
        const FlashSaleCheck = yield FlashSale_model_1.FlashSale.findOne({
            productId: req.body.productId,
            $or: [
                { startDate: { $lte: req.body.startDate }, endDate: { $gte: req.body.startDate } },
                { startDate: { $lte: req.body.endDate }, endDate: { $gte: req.body.endDate } },
                { startDate: { $gt: req.body.startDate }, endDate: { $lt: req.body.endDate } },
            ],
        }).exec();
        if (FlashSaleCheck)
            throw new Error("Entry Already exist , cannot create new flash sale please change product or end date to create one ");
        let userObj = yield user_model_1.User.findById(req.body.userId).exec();
        if (!userObj) {
            throw new Error("User not found !!!");
        }
        let dateDiff = (0, dateUtils_1.dateDifference)(req.body.startDate, req.body.endDate);
        if (userObj.saleDays - dateDiff <= 0) {
            throw new Error("You do not have enough flash sales days left in you account to create this sale please reduce the duration of the sale or purchase a topup.");
        }
        yield user_model_1.User.findByIdAndUpdate(userObj === null || userObj === void 0 ? void 0 : userObj._id, { $inc: { numberOfSales: -1, saleDays: -dateDiff } }).exec();
        console.log(req.body, "body");
        const newEntry = new FlashSale_model_1.FlashSale(req.body).save();
        if (!newEntry) {
            throw new Error("Unable to create FlashSale");
        }
        res.status(200).json({ message: "FlashSale Successfully Created", success: true });
        let flashProduct = yield product_model_1.Product.findById(req.body.productId);
        const newNotification = new Notifications_model_1.Notifications({
            userId: req.params.userId,
            type: 'flash_sale',
            title: 'Flash sale created',
            sourceId: ((_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.productSlug) || '',
            isRead: false,
            viewCount: 1,
            lastAccessTime: new Date(),
            payload: {
                reach: 'all',
                accessTime: new Date(),
                slug: flashProduct === null || flashProduct === void 0 ? void 0 : flashProduct.slug,
                productName: flashProduct === null || flashProduct === void 0 ? void 0 : flashProduct.name,
                flashSaleDetails: req.body
            }
        });
        // Save the new notification to the database
        try {
            yield newNotification.save();
            console.log('New notification created with viewCount and lastAccessTime');
        }
        catch (error) {
            console.error('Error saving new notification:', error);
        }
    }
    catch (err) {
        next(err);
    }
});
exports.addFlashSale = addFlashSale;
const getFlashSale = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let FlashSaleArr = [];
        FlashSaleArr = yield FlashSale_model_1.FlashSale.find({ userId: req.params.id })
            .populate("productId")
            .populate("userId")
            .lean()
            .exec();
        res.status(200).json({ message: "getFlashSale", data: FlashSaleArr, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getFlashSale = getFlashSale;
// export const getAllFlashSales = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     let FlashSaleArr: any = [];
//     let query: any = {};
//     let saleCount = await FlashSale.find(query).countDocuments();
//     let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
//     let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 1000;
//     let pipeLine: any = [
//       {
//         "$lookup": {
//           "from": "users",
//           "localField": "userId",
//           "foreignField": "_id",
//           "as": "userId",
//         },
//       },
//       {
//         "$lookup": {
//           "from": "products",
//           "localField": "productId",
//           "foreignField": "_id",
//           "as": "productId",
//         },
//       },
//       {
//         "$unwind": {
//           "path": "$productId",
//           "preserveNullAndEmptyArrays": false,
//         },
//       },
//       {
//         "$unwind": {
//           "path": "$userId",
//           "preserveNullAndEmptyArrays": false,
//         },
//       },
//     ];
//     if (req.query.q) {
//       pipeLine.push({
//         "$match": {
//           "$or": [
//             {
//               "userId.name": new RegExp(`^${req.query.q}`, "i"),
//             },
//             {
//               "productId.name": new RegExp(`^${req.query.q}`, "i"),
//             },
//           ],
//         },
//       });
//     }
//     if (req.query.endDate) {
//       pipeLine.push({
//         "$match": 
//             {
//               "endDate":{
//                 "$gte": new Date(`${req.query.endDate}`)
//               } 
//             },
//         },
//       );
//     }
//     pipeLine.push(
//       {
//         "$skip": (pageValue - 1) * limitValue,
//       },
//       {
//         "$limit": limitValue,
//       }
//     );
//     FlashSaleArr = await FlashSale.aggregate(pipeLine).exec();
//     // FlashSaleArr = await FlashSale.find(query).skip((pageValue - 1) * limitValue).limit(limitValue).populate('productId').populate('userId').lean().exec();
//     res.status(200).json({ message: "getFlashSale", data: FlashSaleArr, totalPages: saleCount, success: true });
//   } catch (err) {
//     next(err);
//   }
// };
const getAllFlashSales = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let FlashSaleArr = [];
        let query = {};
        // Count total flash sales
        let saleCount = yield FlashSale_model_1.FlashSale.find(query).countDocuments();
        // Pagination values
        let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
        let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 1000;
        let pipeLine = [
            {
                "$lookup": {
                    "from": "users",
                    "localField": "userId",
                    "foreignField": "_id",
                    "as": "userId",
                },
            },
            {
                "$lookup": {
                    "from": "products",
                    "localField": "productId",
                    "foreignField": "_id",
                    "as": "productId",
                },
            },
            {
                "$unwind": {
                    "path": "$productId",
                    "preserveNullAndEmptyArrays": false,
                },
            },
            {
                "$unwind": {
                    "path": "$userId",
                    "preserveNullAndEmptyArrays": false,
                },
            },
            // Exclude expired flash sales where endDate is less than current date
            {
                "$match": {
                    "endDate": { "$gte": new Date() }
                },
            },
        ];
        // Optional search query
        if (req.query.q) {
            pipeLine.push({
                "$match": {
                    "$or": [
                        { "userId.name": new RegExp(`^${req.query.q}`, "i") },
                        { "productId.name": new RegExp(`^${req.query.q}`, "i") },
                    ],
                },
            });
        }
        // Optional endDate filtering (if user provides an end date)
        if (req.query.endDate) {
            pipeLine.push({
                "$match": {
                    "endDate": { "$gte": new Date(`${req.query.endDate}`) },
                },
            });
        }
        // Pagination
        pipeLine.push({ "$skip": (pageValue - 1) * limitValue }, { "$limit": limitValue });
        // Execute the aggregation pipeline
        FlashSaleArr = yield FlashSale_model_1.FlashSale.aggregate(pipeLine).exec();
        res.status(200).json({ message: "getFlashSale", data: FlashSaleArr, totalPages: saleCount, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getAllFlashSales = getAllFlashSales;
const updateById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const FlashSaleObj = yield FlashSale_model_1.FlashSale.findById(req.params.id).lean().exec();
        if (!FlashSaleObj) {
            throw new Error("FlashSale not found");
        }
        yield FlashSale_model_1.FlashSale.findByIdAndUpdate(req.params.id, req.body).exec();
        res.status(200).json({ message: "FlashSale Updated", success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.updateById = updateById;
const deleteById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const FlashSaleObj = yield FlashSale_model_1.FlashSale.findByIdAndDelete(req.params.id).exec();
        if (!FlashSaleObj)
            throw { status: 400, message: "FlashSale Not Found" };
        res.status(200).json({ message: "FlashSale Deleted", success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.deleteById = deleteById;
const getById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let FlashSalesObj = yield FlashSale_model_1.FlashSale.findOne({ _id: req.params.id })
            .populate("productId")
            .populate("userId")
            .lean()
            .exec();
        if (!FlashSalesObj)
            throw { status: 400, message: "FlashSale Not Found" };
        res.status(200).json({ message: "FlashSale Found", data: FlashSalesObj, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getById = getById;
