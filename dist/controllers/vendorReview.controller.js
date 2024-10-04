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
const Notifications_model_1 = require("../models/Notifications.model");
const addVendorReview = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        console.log(req.body);
        console.log(req.body);
        const { userId, name, addedby, rating, message } = req.body;
        // Manual validation checks
        if (!userId || typeof userId !== 'string') {
            return res.status(400).json({ message: 'User ID is required and must be a string.', success: false });
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
        const newEntry = new VendorReview_model_1.VendorReview(req.body).save();
        if (!newEntry) {
            throw new Error("Unable to create VendorReview");
        }
        // let userObj = await User.findById(req.body?.userId).exec();
        let reviewArr = yield VendorReview_model_1.VendorReview.find({ userId: (_a = req.body) === null || _a === void 0 ? void 0 : _a.userId }).exec();
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
        res.status(200).json({ message: "Review Successfully added", success: true });
        let reviewerObj = yield user_model_1.User.findById(addedby);
        const newNotification = new Notifications_model_1.Notifications({
            userId: userId,
            type: 'vendor_review',
            title: 'Profile Review Received',
            content: `${(_c = reviewerObj === null || reviewerObj === void 0 ? void 0 : reviewerObj.companyObj) === null || _c === void 0 ? void 0 : _c.name} has shared their thoughts on your Profile.`,
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
                ratingReceived: rating
            }
        });
        // Save the new notification to the database
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
exports.addVendorReview = addVendorReview;
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
        let categoryCount = yield VendorReview_model_1.VendorReview.find(query).countDocuments();
        // Pagination settings
        let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
        let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 1000;
        // Fetch the reviews, populating both product and user details (including profileImage)
        let VendorReviewArr = yield VendorReview_model_1.VendorReview.find(query)
            .populate({
            path: "userId",
            select: "profileImage companyObj.name name ",
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
            message: "getVendorReview",
            data: VendorReviewArr,
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
