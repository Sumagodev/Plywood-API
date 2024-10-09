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
exports.getById = exports.deleteById = exports.updateById = exports.getProductReview = exports.addProductReview = void 0;
const country_model_1 = require("../models/country.model");
const productReview_model_1 = require("../models/productReview.model");
const product_model_1 = require("../models/product.model");
const user_model_1 = require("../models/user.model");
const UserFcmTokens_model_1 = require("../models/UserFcmTokens.model");
const Notifications_model_1 = require("../models/Notifications.model");
const constant_1 = require("../helpers/constant");
// export const addProductReview = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         console.log(req.body);
//         // const ProductReviewNameCheck = await ProductReview.findOne({
//         //     name: new RegExp(`^${req.body.name}$`, "i"), productId: req.body.productId
//         // }).exec();
//         // if (ProductReviewNameCheck) throw new Error("You have already added a review for this product");
//         console.log(req.body)
//         const newEntry = new ProductReview(req.body).save();
//         if (!newEntry) {
//             throw new Error("Unable to create ProductReview");
//         }
//         // let userObj = await User.findById(req.body?.userId).exec();
//         let reviewArr = await ProductReview.find({ userId: req.body?.userId }).exec();
//         let total = reviewArr && reviewArr.length > 0 ? reviewArr.length : 0;
//         let totalRatings = reviewArr && reviewArr.length > 0 ? reviewArr.reduce((acc, el) => acc + el.rating, 0) : 0
//         console.log(totalRatings, total, "totalRatings")
//         let rating: number = 0;
//         if (totalRatings != 0 && total != 0) {
//             rating = Math.round(totalRatings / total);
//         }
//         // Math.round((typeof (totalRatings / total) == "number" || typeof (totalRatings / total) == "bigint") ? (totalRatings / total) : 0);
//         // console.log(rating, (typeof (totalRatings / total) == "number" || typeof (totalRatings / total) == "bigint") ? (totalRatings / total) : 0, '(typeof (totalRatings / total) == "number" || typeof (totalRatings / total) == "bigint") ? (totalRatings / total) : 0');
//         await User.findByIdAndUpdate(req.body?.userId, { rating: rating }).exec();
//         // await Product.findByIdAndUpdate(req.body.productId, { "createdByObj.rating": rating }).exec();
//         let fcmTokensArr = await UserFcmToken.find({ userId: req.body.userId }).exec();
//         console.log(fcmTokensArr)
//         let obj = {
//             tokens: fcmTokensArr.map((el:any) => el.fcmToken),
//             data: { title: notification_text.review_text_obj.title, content: notification_text.review_text_obj.content }
//         }
//         let saveNotificationObj = {
//             userId: req.body.userId,
//             title: obj.data.title,
//             content: obj.data.content
//         }
//         await new Notifications(saveNotificationObj).save()
//         console.log(saveNotificationObj, "NOTIFICATION OBJ")
//         await fcmMulticastNotify(obj)
//         res.status(200).json({ message: "Review Successfully Created", success: true });
//     } catch (err) {
//         next(err);
//     }
// };
const addProductReview = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        console.log(req.body);
        // const ProductReviewNameCheck = await ProductReview.findOne({
        //     name: new RegExp(`^${req.body.name}$`, "i"), productId: req.body.productId
        // }).exec();
        // if (ProductReviewNameCheck) throw new Error("You have already added a review for this product");
        console.log(req.body);
        const { userId, name, addedby, rating, message, productId } = req.body;
        //////////
        if (!userId || typeof userId !== 'string') {
            return res.status(400).json({ message: 'User ID is required and must be a string.', success: false });
        }
        if (!productId || typeof productId !== 'string') {
            return res.status(400).json({ message: 'Product  ID is required and must be a string.', success: false });
        }
        if (!name || typeof name !== 'string') {
            return res.status(400).json({ message: 'Name is required and must be a string.', success: false });
        }
        if (!addedby || typeof addedby !== 'string') {
            return res.status(400).json({ message: 'Added By is required and must be a string.', success: false });
        }
        if (rating === undefined || typeof rating !== 'number' || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating is required and must be a number between 1 and 5.', success: false });
        }
        if (!message || typeof message !== 'string') {
            return res.status(400).json({ message: 'Message is required and must be a string.', success: false });
        }
        const newEntry = new productReview_model_1.ProductReview(req.body).save();
        if (!newEntry) {
            throw new Error("Unable to create ProductReview");
        }
        // let userObj = await User.findById(req.body?.userId).exec();
        let reviewArr = yield productReview_model_1.ProductReview.find({ userId: (_a = req.body) === null || _a === void 0 ? void 0 : _a.userId }).exec();
        let total = reviewArr && reviewArr.length > 0 ? reviewArr.length : 0;
        let totalRatings = reviewArr && reviewArr.length > 0 ? reviewArr.reduce((acc, el) => acc + el.rating, 0) : 0;
        console.log(totalRatings, total, "totalRatings");
        let ratingCal = 0;
        if (totalRatings != 0 && total != 0) {
            ratingCal = Math.round(totalRatings / total);
        }
        // Math.round((typeof (totalRatings / total) == "number" || typeof (totalRatings / total) == "bigint") ? (totalRatings / total) : 0);
        // console.log(rating, (typeof (totalRatings / total) == "number" || typeof (totalRatings / total) == "bigint") ? (totalRatings / total) : 0, '(typeof (totalRatings / total) == "number" || typeof (totalRatings / total) == "bigint") ? (totalRatings / total) : 0');
        yield user_model_1.User.findByIdAndUpdate((_b = req.body) === null || _b === void 0 ? void 0 : _b.userId, { rating: ratingCal }).exec();
        // await Product.findByIdAndUpdate(req.body.productId, { "createdByObj.rating": rating }).exec();
        let fcmTokensArr = yield UserFcmTokens_model_1.UserFcmToken.find({ userId: req.body.userId }).exec();
        console.log(fcmTokensArr);
        let obj = {
            tokens: fcmTokensArr.map((el) => el.fcmToken),
            data: { title: constant_1.notification_text.review_text_obj.title, content: constant_1.notification_text.review_text_obj.content }
        };
        // let saveNotificationObj = {
        //     userId: req.body.userId,
        //     title: obj.data.title,
        //     content: obj.data.content
        // }
        // await new Notifications(saveNotificationObj).save()
        // console.log(saveNotificationObj, "NOTIFICATION OBJ")
        // try{
        //   await fcmMulticastNotify(obj)
        // }catch(err){
        //   console.log(err)    }
        res.status(200).json({ message: "Review Successfully Created", success: true });
        let reviewerObj = yield user_model_1.User.findById(addedby);
        let prodctObj = yield product_model_1.Product.findById(productId);
        const newNotification = new Notifications_model_1.Notifications({
            userId: userId,
            type: 'product_review',
            title: 'Product Review Received',
            content: `${(_c = reviewerObj === null || reviewerObj === void 0 ? void 0 : reviewerObj.companyObj) === null || _c === void 0 ? void 0 : _c.name} has shared their thoughts on your product.`,
            sourceId: '',
            isRead: false,
            viewCount: 1,
            lastAccessTime: new Date(),
            payload: {
                userId: userId,
                addedbyUserId: addedby,
                addedbyUserObj: reviewerObj,
                addeByOrganizationName: (_d = reviewerObj === null || reviewerObj === void 0 ? void 0 : reviewerObj.companyObj) === null || _d === void 0 ? void 0 : _d.name,
                message: message,
                ratingReceived: rating,
                prodctObj: prodctObj,
                productName: prodctObj === null || prodctObj === void 0 ? void 0 : prodctObj.name
            }
        });
        try {
            yield newNotification.save();
        }
        catch (error) {
            console.error('Error saving new notification:', error);
        }
    }
    catch (err) {
        next(err);
    }
});
exports.addProductReview = addProductReview;
// export const getProductReview = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     let query: any = {};
//     // Build the query based on the request query parameters
//     if (req.query.productId) {
//       query = { ...query, productId: req.query.productId };
//     }
//     if (req.query.userId) {
//       query = { ...query, userId: req.query.userId };
//     }
//     if (req.query.startDate && req.query.endDate) {
//       query = {
//         ...query,
//         createdAt: {
//           $gte: new Date(req.query.startDate as string),
//           $lte: new Date(req.query.endDate as string),
//         },
//       };
//     }
//     if (req.query.q) {
//       query = { ...query, name: new RegExp(`${req.query.q}`, "i") };
//     }
//     // Get total count of matching product reviews
//     let categoryCount = await ProductReview.find(query).countDocuments();
//     // Pagination settings
//     let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
//     let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 1000;
//     // Fetch the reviews, populating both product and user details (including profileImage)
//     let ProductReviewArr = await ProductReview.find(query)
//       .populate("productId") // Populate product details
//       .populate({
//         path: "userId", // Populate user details
//         select: "profileImage name", // Fetch the user's profileImage and name
//         model: User, // Specify the User model
//       })
//       .skip((pageValue - 1) * limitValue)
//       .sort({ createdAt: -1 })
//       .limit(limitValue)
//       .lean()
//       .exec();
//     // Respond with the product reviews and the populated data
//     res.status(200).json({
//       message: "getProductReview",
//       data: ProductReviewArr,
//       count: categoryCount,
//       success: true,
//     });
//   } catch (err) {
//     next(err);
//   }
// };
const getProductReview = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let query = {};
        // Build the query based on the request query parameters
        if (req.query.productId) {
            query = Object.assign(Object.assign({}, query), { productId: req.query.productId });
        }
        if (req.query.userId) {
            query = Object.assign(Object.assign({}, query), { userId: req.query.userId });
        }
        if (req.query.startDate && req.query.endDate) {
            query = Object.assign(Object.assign({}, query), { createdAt: {
                    $gte: new Date(req.query.startDate),
                    $lte: new Date(req.query.endDate),
                } });
        }
        if (req.query.q) {
            query = Object.assign(Object.assign({}, query), { name: new RegExp(`${req.query.q}`, "i") });
        }
        // Get total count of matching product reviews
        let categoryCount = yield productReview_model_1.ProductReview.find(query).countDocuments();
        // Pagination settings
        let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
        let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 1000;
        // Fetch the reviews, populating both product and user details (including full user details like in VendorReview)
        let ProductReviewArr = yield productReview_model_1.ProductReview.find(query)
            .populate("productId") // Populate product details
            .populate({
            path: "userId",
            select: "profileImage companyObj.name name email phone",
            model: user_model_1.User, // Specify the User model
        })
            .populate({
            path: "addedby",
            select: "profileImage companyObj.name name",
            model: user_model_1.User, // Specify the User model
        })
            .skip((pageValue - 1) * limitValue)
            .sort({ createdAt: -1 })
            .limit(limitValue)
            .lean()
            .exec();
        // Respond with the product reviews and the populated data
        res.status(200).json({
            message: "getProductReview",
            data: ProductReviewArr,
            count: categoryCount,
            success: true,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.getProductReview = getProductReview;
const updateById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ProductReviewObj = yield productReview_model_1.ProductReview.findById(req.params.id).lean().exec();
        if (!ProductReviewObj) {
            throw new Error("Review not found");
        }
        yield productReview_model_1.ProductReview.findByIdAndUpdate(req.params.id, req.body).exec();
        res.status(200).json({ message: "Review Updated", success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.updateById = updateById;
const deleteById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ProductReviewObj = yield productReview_model_1.ProductReview.findByIdAndDelete(req.params.id).exec();
        if (!ProductReviewObj)
            throw { status: 400, message: "ProductReview Not Found" };
        res.status(200).json({ message: "Review Deleted", success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.deleteById = deleteById;
const getById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let ProductReviewObj = yield productReview_model_1.ProductReview.findById(req.params.id).lean().exec();
        if (!ProductReviewObj)
            throw { status: 400, message: "ProductReview Not Found" };
        if (ProductReviewObj.countryId) {
            console.log(ProductReviewObj.countryId, "countryIdcountryId");
            ProductReviewObj.countryObj = yield country_model_1.Country.findById(ProductReviewObj.countryId).exec();
        }
        res.status(200).json({ message: "Review Found", data: ProductReviewObj, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getById = getById;
