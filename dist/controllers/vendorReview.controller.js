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
exports.getById = exports.deleteById = exports.updateById = exports.getVendorReview = exports.addVendorReview = void 0;
const country_model_1 = require("../models/country.model");
const VendorReview_model_1 = require("../models/VendorReview.model");
const user_model_1 = require("../models/user.model");
const UserFcmTokens_model_1 = require("../models/UserFcmTokens.model");
const fcmNotify_1 = require("../helpers/fcmNotify");
const constant_1 = require("../helpers/constant");
const addVendorReview = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        console.log(req.body);
        console.log(req.body);
        const newEntry = new VendorReview_model_1.VendorReview(req.body).save();
        if (!newEntry) {
            throw new Error("Unable to create VendorReview");
        }
        // let userObj = await User.findById(req.body?.userId).exec();
        let reviewArr = yield VendorReview_model_1.VendorReview.find({ userId: (_a = req.body) === null || _a === void 0 ? void 0 : _a.userId }).exec();
        let total = reviewArr && reviewArr.length > 0 ? reviewArr.length : 0;
        let totalRatings = reviewArr && reviewArr.length > 0 ? reviewArr.reduce((acc, el) => acc + el.rating, 0) : 0;
        console.log(totalRatings, total, "totalRatings");
        let rating = 0;
        if (totalRatings != 0 && total != 0) {
            rating = Math.round(totalRatings / total);
        }
        // Math.round((typeof (totalRatings / total) == "number" || typeof (totalRatings / total) == "bigint") ? (totalRatings / total) : 0);
        // console.log(rating, (typeof (totalRatings / total) == "number" || typeof (totalRatings / total) == "bigint") ? (totalRatings / total) : 0, '(typeof (totalRatings / total) == "number" || typeof (totalRatings / total) == "bigint") ? (totalRatings / total) : 0');
        yield user_model_1.User.findByIdAndUpdate((_b = req.body) === null || _b === void 0 ? void 0 : _b.userId, { rating: rating }).exec();
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
        yield (0, fcmNotify_1.fcmMulticastNotify)(obj);
        res.status(200).json({ message: "Review Successfully Created", success: true });
        //   const newNotification = new Notifications({
        //     userId: user._id,         
        //     type: 'profile_completion',
        //     title: 'Profile Completed',  
        //     content: `Thanks for joining us! To get started and make the most of our features, please complete your profile setup.`,
        //     sourceId:'',             
        //     isRead: false,                      
        //     viewCount: 1,
        //     lastAccessTime: new Date(),           // Set initial last access time
        //     payload: {                            // Dynamic payload data
        //        userId:user._id
        //     }
        // });
        // // Save the new notification to the database
        // try {
        //     await newNotification.save();
        // } catch (error) {
        //     console.error('Error saving new notification:', error);
        // }
    }
    catch (err) {
        next(err);
    }
});
exports.addVendorReview = addVendorReview;
// export const getVendorReview = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     let query: any = {};
//     // Build the query based on the request query parameters
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
//     let categoryCount = await VendorReview.find(query).countDocuments();
//     // Pagination settings
//     let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
//     let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 1000;
//     // Fetch the reviews, populating both product and user details (including profileImage)
//     let VendorReviewArr = await VendorReview.find(query)
//       .populate({
//         path: "userId", // Populate user details
//         select: "profileImage companyName name", // Fetch the user's profileImage and name
//         model: User, // Specify the User model
//       })
//       .populate({
//         path: "addedby", // Populate user details
//         select: "profileImage companyName name", // Fetch the user's profileImage and name
//         model: User, // Specify the User model
//       })
//       .skip((pageValue - 1) * limitValue)
//       .sort({ createdAt: -1 })
//       .limit(limitValue)
//       .lean()
//       .exec();
//     // Respond with the product reviews and the populated data
//     res.status(200).json({
//       message: "getVendorReview",
//       data: VendorReviewArr,
//       count: categoryCount,
//       success: true,
//     });
//   } catch (err) {
//     next(err);
//   }
// };
const getVendorReview = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let query = {};
        // Build the query based on the request query parameters
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
        const categoryCount = yield VendorReview_model_1.VendorReview.find(query).countDocuments();
        // Pagination settings
        const pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
        const limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 1000;
        // Fetch the reviews
        const vendorReviews = yield VendorReview_model_1.VendorReview.find(query)
            .skip((pageValue - 1) * limitValue)
            .sort({ createdAt: -1 })
            .limit(limitValue)
            .lean()
            .exec();
        // Fetch users corresponding to the userIds in the reviews
        const userIds = vendorReviews.map(review => review.userId);
        const users = yield user_model_1.User.find({ _id: { $in: userIds } }).lean();
        // Create a map of users for easy lookup
        const userMap = new Map(users.map(user => [
            user._id.toString(),
            {
                name: user.name,
                profileImage: user.profileImage,
                companyName: user.companyObj.name, // Fetching the name from companyObj
            },
        ]));
        // Log the userMap for debugging
        console.log("User Map:", userMap);
        // Enrich the reviews with user information
        const enrichedReviews = vendorReviews.map(review => {
            const userInfo = userMap.get(review.userId.toString());
            console.log("Review UserId:", review.userId.toString());
            console.log("Mapped User:", userInfo);
            return Object.assign(Object.assign({}, review), { userName: (userInfo === null || userInfo === void 0 ? void 0 : userInfo.name) || "Unknown User", userProfileImage: (userInfo === null || userInfo === void 0 ? void 0 : userInfo.profileImage) || "No Image", companyName: (userInfo === null || userInfo === void 0 ? void 0 : userInfo.companyName) || "No Company" });
        });
        // Respond with the enriched reviews
        res.status(200).json({
            message: "getVendorReview",
            data: enrichedReviews,
            count: categoryCount,
            success: true,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.getVendorReview = getVendorReview;
const updateById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const VendorReviewObj = yield VendorReview_model_1.VendorReview.findById(req.params.id).lean().exec();
        if (!VendorReviewObj) {
            throw new Error("Review not found");
        }
        yield VendorReview_model_1.VendorReview.findByIdAndUpdate(req.params.id, req.body).exec();
        res.status(200).json({ message: "Review Updated", success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.updateById = updateById;
const deleteById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const VendorReviewObj = yield VendorReview_model_1.VendorReview.findByIdAndDelete(req.params.id).exec();
        if (!VendorReviewObj)
            throw { status: 400, message: "VendorReview Not Found" };
        res.status(200).json({ message: "Review Deleted", success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.deleteById = deleteById;
const getById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let VendorReviewObj = yield VendorReview_model_1.VendorReview.findById(req.params.id).lean().exec();
        if (!VendorReviewObj)
            throw { status: 400, message: "VendorReview Not Found" };
        if (VendorReviewObj.countryId) {
            console.log(VendorReviewObj.countryId, "countryIdcountryId");
            VendorReviewObj.countryObj = yield country_model_1.Country.findById(VendorReviewObj.countryId).exec();
        }
        res.status(200).json({ message: "Review Found", data: VendorReviewObj, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getById = getById;
