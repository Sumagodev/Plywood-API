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
exports.handleJuspayPaymentForTopup = exports.initiateJuspayPaymentForTopup = exports.getById = exports.getAllTopupbyUserId = exports.getTopupSubscribedbyUserId = exports.getTopup = exports.phonepePaymentTopUpStatusCheck = exports.buyTopup = void 0;
const userTopup_model_1 = require("../models/userTopup.model");
const user_model_1 = require("../models/user.model");
const Payment_model_1 = require("../models/Payment.model");
const phonepay_1 = require("../helpers/phonepay");
const mailer_1 = require("../helpers/mailer");
const constant_1 = require("../helpers/constant");
const hdfcConfig_1 = require("../helpers/hdfcConfig");
const mongoose_1 = require("mongoose");
const Topup_model_1 = require("../models/Topup.model");
const buyTopup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y;
    try {
        console.log(req.body, req.user);
        let existsCheck = yield userTopup_model_1.UserTopup.findOne({ userId: (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.userId }).sort({ endDate: -1 }).exec();
        console.log(existsCheck, "existsCheck");
        let userObj = yield user_model_1.User.findOne({ userId: (_b = req === null || req === void 0 ? void 0 : req.user) === null || _b === void 0 ? void 0 : _b.userId }).exec();
        if (!(userObj || userObj._id)) {
            throw new Error("Could not find user please contact admin !!!");
        }
        let obj = {
            userId: (_c = req === null || req === void 0 ? void 0 : req.user) === null || _c === void 0 ? void 0 : _c.userId,
            subscriptionId: req.body._id,
            name: (_d = req.body) === null || _d === void 0 ? void 0 : _d.name,
            description: (_e = req.body) === null || _e === void 0 ? void 0 : _e.description,
            price: (_f = req.body) === null || _f === void 0 ? void 0 : _f.price,
            numberOfSales: ((_g = req === null || req === void 0 ? void 0 : req.body) === null || _g === void 0 ? void 0 : _g.numberOfSales) ? (_h = req === null || req === void 0 ? void 0 : req.body) === null || _h === void 0 ? void 0 : _h.numberOfSales : 0,
            saleDays: ((_j = req === null || req === void 0 ? void 0 : req.body) === null || _j === void 0 ? void 0 : _j.saleDays) ? (_k = req === null || req === void 0 ? void 0 : req.body) === null || _k === void 0 ? void 0 : _k.saleDays : 0,
            numberOfAdvertisement: ((_l = req === null || req === void 0 ? void 0 : req.body) === null || _l === void 0 ? void 0 : _l.numberOfAdvertisement) ? (_m = req === null || req === void 0 ? void 0 : req.body) === null || _m === void 0 ? void 0 : _m.numberOfAdvertisement : 0,
            advertisementDays: ((_o = req === null || req === void 0 ? void 0 : req.body) === null || _o === void 0 ? void 0 : _o.advertisementDays) ? (_p = req === null || req === void 0 ? void 0 : req.body) === null || _p === void 0 ? void 0 : _p.advertisementDays : 0,
            numberOfBannerImages: ((_q = req === null || req === void 0 ? void 0 : req.body) === null || _q === void 0 ? void 0 : _q.numberOfBannerImages) ? (_r = req === null || req === void 0 ? void 0 : req.body) === null || _r === void 0 ? void 0 : _r.numberOfBannerImages : 0,
            bannerimagesDays: ((_s = req === null || req === void 0 ? void 0 : req.body) === null || _s === void 0 ? void 0 : _s.bannerimagesDays) ? (_t = req === null || req === void 0 ? void 0 : req.body) === null || _t === void 0 ? void 0 : _t.bannerimagesDays : 0,
            numberOfOpportunities: ((_u = req === null || req === void 0 ? void 0 : req.body) === null || _u === void 0 ? void 0 : _u.numberOfOpportunities) ? (_v = req === null || req === void 0 ? void 0 : req.body) === null || _v === void 0 ? void 0 : _v.numberOfOpportunities : 0,
            OpportunitiesDays: ((_w = req === null || req === void 0 ? void 0 : req.body) === null || _w === void 0 ? void 0 : _w.OpportunitiesDays) ? (_x = req === null || req === void 0 ? void 0 : req.body) === null || _x === void 0 ? void 0 : _x.OpportunitiesDays : 0,
            isExpired: false,
            endDate: null,
        };
        // Add GST
        obj.price = obj.price + Math.round(obj.price * 0.18);
        yield user_model_1.User.findByIdAndUpdate((_y = req === null || req === void 0 ? void 0 : req.user) === null || _y === void 0 ? void 0 : _y.userId, {
            $inc: {
                numberOfSales: obj.numberOfSales,
                saleDays: obj === null || obj === void 0 ? void 0 : obj.saleDays,
                numberOfAdvertisement: obj === null || obj === void 0 ? void 0 : obj.numberOfAdvertisement,
                advertisementDays: obj === null || obj === void 0 ? void 0 : obj.advertisementDays,
                numberOfBannerImages: obj === null || obj === void 0 ? void 0 : obj.numberOfBannerImages,
                bannerimagesDays: obj === null || obj === void 0 ? void 0 : obj.bannerimagesDays,
                numberOfOpportunities: obj === null || obj === void 0 ? void 0 : obj.numberOfOpportunities,
                OpportunitiesDays: obj === null || obj === void 0 ? void 0 : obj.OpportunitiesDays,
            },
        }).exec();
        let options = {
            amount: obj.price * 100,
            currency: "INR",
            receipt: new Date().getTime(),
        };
        let paymentObj = {
            amount: obj.price,
            orderObj: obj,
            paymentChk: 0,
        };
        let paymentObjResponse = yield new Payment_model_1.Payment(paymentObj).save();
        options.orderId = paymentObjResponse._id;
        options.mobile = userObj === null || userObj === void 0 ? void 0 : userObj.phone;
        options.successUrl = `${process.env.BASE_URL}/userTopup/phonepePaymentStatusCheck/` + paymentObjResponse._id;
        options.payfrom = req.body.patfrom;
        let phoResone = yield (0, phonepay_1.createPhonePaymentOrder)(options);
        if (phoResone && !(phoResone === null || phoResone === void 0 ? void 0 : phoResone.sucess)) {
            throw new Error(`Phonepe is not working.Please Try Some another Payment Method`);
        }
        let orderPaymentObj = phoResone === null || phoResone === void 0 ? void 0 : phoResone.data;
        let obj1 = yield Payment_model_1.Payment.findByIdAndUpdate(paymentObjResponse._id, {
            "gatwayPaymentObj": orderPaymentObj,
        })
            .lean()
            .exec();
        res.status(200).json({
            message: "UserTopup Successfully Created",
            data: orderPaymentObj,
            orderId: paymentObjResponse._id,
            success: true,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.buyTopup = buyTopup;
const phonepePaymentTopUpStatusCheck = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _z, _0, _1, _2;
    try {
        console.log(req.body, "-------------------------------------------------");
        // const userObj = await User.findById(req.user.userId).lean().exec();
        let orderObj = yield Payment_model_1.Payment.findById(req.params.orderId).exec();
        if (!orderObj)
            throw new Error("Order Not Found");
        if ((orderObj === null || orderObj === void 0 ? void 0 : orderObj.paymentChk) == 1) {
            // throw new Error("Payment is already Done");
            res.json({ message: "Payment is already Done ", success: true, orderId: orderObj._id, data: orderObj });
            return;
        }
        let phoneObj = orderObj === null || orderObj === void 0 ? void 0 : orderObj.gatwayPaymentObj;
        let options = {
            merchantId: phoneObj === null || phoneObj === void 0 ? void 0 : phoneObj.merchantId,
            merchantTransactionId: phoneObj === null || phoneObj === void 0 ? void 0 : phoneObj.merchantTransactionId,
        };
        let checkPaymentStatus = yield (0, phonepay_1.checkStatusPhonePaymentOrder)(options);
        if (checkPaymentStatus && !(checkPaymentStatus === null || checkPaymentStatus === void 0 ? void 0 : checkPaymentStatus.sucess)) {
            throw new Error("Please Contact to Admin for payment is failed");
        }
        phoneObj.paymentInstrument = (_z = checkPaymentStatus === null || checkPaymentStatus === void 0 ? void 0 : checkPaymentStatus.data) === null || _z === void 0 ? void 0 : _z.paymentInstrument;
        orderObj = yield Payment_model_1.Payment.findByIdAndUpdate(req.params.orderId, {
            "paymentChk": 1,
            "gatwayPaymentObj": phoneObj,
        })
            .lean()
            .exec();
        let userObj = yield user_model_1.User.findById((_0 = orderObj === null || orderObj === void 0 ? void 0 : orderObj.orderObj) === null || _0 === void 0 ? void 0 : _0.userId).exec();
        let patObj = orderObj === null || orderObj === void 0 ? void 0 : orderObj.orderObj;
        let totalSubscription = yield userTopup_model_1.UserTopup.countDocuments({});
        let invoiceId = (0, constant_1.getTopUpOrderIdSequence)(totalSubscription + 1);
        patObj.orderId = invoiceId;
        yield user_model_1.User.findByIdAndUpdate((_1 = orderObj === null || orderObj === void 0 ? void 0 : orderObj.orderObj) === null || _1 === void 0 ? void 0 : _1.userId, {
            $inc: {
                numberOfSales: patObj.numberOfSales,
                saleDays: patObj === null || patObj === void 0 ? void 0 : patObj.saleDays,
                numberOfAdvertisement: patObj === null || patObj === void 0 ? void 0 : patObj.numberOfAdvertisement,
                advertisementDays: patObj === null || patObj === void 0 ? void 0 : patObj.advertisementDays,
                numberOfBannerImages: patObj === null || patObj === void 0 ? void 0 : patObj.numberOfBannerImages,
                bannerimagesDays: patObj === null || patObj === void 0 ? void 0 : patObj.bannerimagesDays,
                numberOfOpportunities: patObj === null || patObj === void 0 ? void 0 : patObj.numberOfOpportunities,
                OpportunitiesDays: patObj === null || patObj === void 0 ? void 0 : patObj.OpportunitiesDays,
            },
            subscriptionEndDate: patObj.endDate,
        }).exec();
        orderObj = yield new userTopup_model_1.UserTopup(patObj).save();
        let email = (userObj === null || userObj === void 0 ? void 0 : userObj.email) ? userObj === null || userObj === void 0 ? void 0 : userObj.email : (_2 = userObj === null || userObj === void 0 ? void 0 : userObj.companyObj) === null || _2 === void 0 ? void 0 : _2.email;
        let name = userObj === null || userObj === void 0 ? void 0 : userObj.name;
        let orderId = orderObj === null || orderObj === void 0 ? void 0 : orderObj.orderId;
        let emailArr = [
            {
                name,
                email,
            },
        ];
        let customerTitle = `Topup has been confirmed ${orderId}`;
        let adminTitle = `New Topup ${orderId} -  ${name}`;
        let obj3 = Object.assign({}, orderObj);
        console.log(obj3);
        obj3.order_id = orderId;
        obj3.createdAtDate2 = new Date(orderObj.createdAt).toDateString();
        yield (0, mailer_1.sendMail)(emailArr, orderObj._id, customerTitle, orderObj);
        let emailAr2 = [{ name: "Plywood Bazar", email: "admin@plywoodbazar.com" }];
        yield (0, mailer_1.sendMail)(emailAr2, orderObj._id, adminTitle, orderObj);
        console.log("asdsadad", process.env.APP_URL);
        res.redirect(`${process.env.APP_URL}/Payment/${orderObj._id}`);
        // res.json({ message: "Payment Successfull", success: true, orderId: orderObj._id, data: phoneObj });
    }
    catch (err) {
        next(err);
    }
});
exports.phonepePaymentTopUpStatusCheck = phonepePaymentTopUpStatusCheck;
const getTopup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // let TopupArr: any = [];
        // let query: any = {}
        // console.log(req.query, "req.query.q")
        // if (req.query.q) {
        //     query.name = new RegExp(`${req.query.q}`, "i");
        // }
        // // if (req.query.TopupId) {
        // //   query.TopupId = req.query.TopupId;
        // // }
        // TopupArr = await UserTopup.find(query).lean().exec();
        // // for (let UserTopup of TopupArr) {
        // //   if (UserTopup.TopupId) {
        // //     console.log(UserTopup.TopupId, "TopupIdTopupId")
        // //     UserTopup.TopupObj = await UserTopup.findById(UserTopup.TopupId).exec();
        // //   }
        // // }
        res.status(200).json({ message: "getTopup", success: true });
        // res.status(200).json({ message: "getTopup", data: TopupArr, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getTopup = getTopup;
const getTopupSubscribedbyUserId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
        let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 1000;
        let pipeline = [
            {
                "$match": {
                    "TopupId": "643e355aecef4e188270bb68",
                },
            },
            {
                "$addFields": {
                    "id": {
                        "$toObjectId": "$userId",
                    },
                },
            },
            {
                "$lookup": {
                    "from": "users",
                    "localField": "id",
                    "foreignField": "_id",
                    "as": "usersArr",
                },
            },
            {
                "$project": {
                    "_id": 1,
                    "name": 1,
                    "usersArr.name": 1,
                    "usersArr.email": 1,
                    "usersArr.phone": 1,
                    "usersArr.whatsapp": 1,
                    "usersArr.address": 1,
                    "usersArr.numberOfSales": 1,
                    "usersArr.saleDays": 1,
                    "usersArr.advertisementDays": 1,
                    "usersArr.numberOfAdvertisement": 1,
                    "usersArr.numberOfBannerImages": 1,
                    "usersArr.bannerimagesDays": 1,
                    "usersArr.TopupEndDate": 1,
                    "usersArr.numberOfOpportunities": 1,
                    "usersArr.OpportunitiesDays": 1,
                    "usersArr.price": 1,
                    "usersArr.startDate": 1,
                    "usersArr.endDate": 1,
                    "usersArr.createdAt": 1,
                },
            },
        ];
        let TopupArr = [];
        pipeline.push({
            "$skip": (pageValue - 1) * limitValue,
        }, {
            "$limit": limitValue,
        });
        // let query: any = {}
        // console.log(req.query, "req.query.q")
        // if (req.query.q) {
        //     query.name = new RegExp(`${req.query.q}`, "i");
        // }
        // // if (req.query.TopupId) {
        // //   query.TopupId = req.query.TopupId;
        // // }
        TopupArr = yield userTopup_model_1.UserTopup.aggregate(pipeline).exec();
        // // for (let UserTopup of TopupArr) {
        // //   if (UserTopup.TopupId) {
        // //     console.log(UserTopup.TopupId, "TopupIdTopupId")
        // //     UserTopup.TopupObj = await UserTopup.findById(UserTopup.TopupId).exec();
        // //   }
        // // }
        console.log(JSON.stringify(TopupArr, null, 2), "TopupArr");
        res.status(200).json({ message: "getTopup", data: TopupArr, success: true });
        // res.status(200).json({ message: "getTopup", data: TopupArr, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getTopupSubscribedbyUserId = getTopupSubscribedbyUserId;
const getAllTopupbyUserId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _3, _4, _5, _6;
    try {
        let TopupArr = [];
        // let query: any = {}
        // console.log(req.query, "req.query.q")
        // if (req.query.q) {
        //     query.name = new RegExp(`${req.query.q}`, "i");
        // }
        // // if (req.query.TopupId) {
        // //   query.TopupId = req.query.TopupId;
        // // }
        console.log(req.query);
        let pageValue = req.query.currentPage ? parseInt(`${req.query.currentPage}`) : 1;
        let limitValue = req.query.rowsPerPage ? parseInt(`${req.query.rowsPerPage}`) : 10;
        const totalCount = yield userTopup_model_1.UserTopup.find({
            $or: [{ userId: (_3 = req.user) === null || _3 === void 0 ? void 0 : _3.userId }, { userId: (_4 = req.query) === null || _4 === void 0 ? void 0 : _4.userId }],
        }).countDocuments();
        TopupArr = yield userTopup_model_1.UserTopup.find({ $or: [{ userId: (_5 = req.user) === null || _5 === void 0 ? void 0 : _5.userId }, { userId: (_6 = req.query) === null || _6 === void 0 ? void 0 : _6.userId }] })
            .skip((pageValue - 1) * limitValue)
            .limit(limitValue)
            .lean()
            .sort({ endDate: -1 })
            .exec();
        // // for (let UserTopup of TopupArr) {
        // //   if (UserTopup.TopupId) {
        // //     console.log(UserTopup.TopupId, "TopupIdTopupId")
        // //     UserTopup.TopupObj = await UserTopup.findById(UserTopup.TopupId).exec();
        // //   }
        // // }
        res.status(200).json({ message: "getAllTopupbyUserId", data: TopupArr, totalCount: totalCount, success: true });
        // res.status(200).json({ message: "getTopup", data: TopupArr, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getAllTopupbyUserId = getAllTopupbyUserId;
const getById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // let TopupObj: any = await UserTopup.findById(req.params.id).lean().exec();
        // if (!TopupObj) throw { status: 400, message: "UserTopup Not Found" };
        res.status(200).json({ message: "UserTopup Found", success: true });
        // res.status(200).json({ message: "UserTopup Found", data: TopupObj, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getById = getById;
const initiateJuspayPaymentForTopup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _7, _8, _9, _10, _11;
    try {
        if (!mongoose_1.Types.ObjectId.isValid(req.body._id)) {
            // Handle the invalid ObjectId case
            return res.status(400).json({ result: false, "message": "Invalid Subscription Id" });
        }
        if (!((_7 = req === null || req === void 0 ? void 0 : req.user) === null || _7 === void 0 ? void 0 : _7.userId)) {
            // Handle the invalid ObjectId case
            return res.status(404).json({ result: false, "message": "Unauthorized request" });
        }
        console.log(req.body, "ZXCV");
        let existsCheck = yield userTopup_model_1.UserTopup.findOne({ userId: (_8 = req === null || req === void 0 ? void 0 : req.user) === null || _8 === void 0 ? void 0 : _8.userId }).sort({ endDate: -1 }).exec();
        console.log(existsCheck, "existsCheck");
        let userObj = yield user_model_1.User.findOne({ userId: (_9 = req === null || req === void 0 ? void 0 : req.user) === null || _9 === void 0 ? void 0 : _9.userId }).exec();
        if (!(userObj || userObj._id)) {
            throw new Error("Could not find user please contact admin !!!");
        }
        let checkTopup = yield Topup_model_1.Topup
            .findById(req.body._id) // Find by ObjectId directly
            .exec();
        if (!checkTopup) {
            return res.status(400).json({ result: false, "message": "Topup not found" });
        }
        let obj = {
            userId: (_10 = req === null || req === void 0 ? void 0 : req.user) === null || _10 === void 0 ? void 0 : _10.userId,
            subscriptionId: req.body._id,
            name: checkTopup === null || checkTopup === void 0 ? void 0 : checkTopup.name,
            description: checkTopup === null || checkTopup === void 0 ? void 0 : checkTopup.description,
            price: checkTopup === null || checkTopup === void 0 ? void 0 : checkTopup.price,
            numberOfSales: (checkTopup === null || checkTopup === void 0 ? void 0 : checkTopup.numberOfSales) ? checkTopup === null || checkTopup === void 0 ? void 0 : checkTopup.numberOfSales : 0,
            saleDays: checkTopup.saleDays ? checkTopup === null || checkTopup === void 0 ? void 0 : checkTopup.saleDays : 0,
            numberOfAdvertisement: (checkTopup === null || checkTopup === void 0 ? void 0 : checkTopup.numberOfAdvertisement) ? checkTopup === null || checkTopup === void 0 ? void 0 : checkTopup.numberOfAdvertisement : 0,
            advertisementDays: (checkTopup === null || checkTopup === void 0 ? void 0 : checkTopup.advertisementDays) ? checkTopup === null || checkTopup === void 0 ? void 0 : checkTopup.advertisementDays : 0,
            numberOfBannerImages: (checkTopup === null || checkTopup === void 0 ? void 0 : checkTopup.numberOfBannerImages) ? checkTopup === null || checkTopup === void 0 ? void 0 : checkTopup.numberOfBannerImages : 0,
            bannerimagesDays: (checkTopup === null || checkTopup === void 0 ? void 0 : checkTopup.bannerimagesDays) ? checkTopup === null || checkTopup === void 0 ? void 0 : checkTopup.bannerimagesDays : 0,
            numberOfOpportunities: (checkTopup === null || checkTopup === void 0 ? void 0 : checkTopup.numberOfOpportunities) ? checkTopup === null || checkTopup === void 0 ? void 0 : checkTopup.numberOfOpportunities : 0,
            OpportunitiesDays: (checkTopup === null || checkTopup === void 0 ? void 0 : checkTopup.OpportunitiesDays) ? checkTopup === null || checkTopup === void 0 ? void 0 : checkTopup.OpportunitiesDays : 0,
            isExpired: false,
            endDate: null,
        };
        // Add GST
        obj.price = obj.price + Math.round(obj.price * 0.18);
        yield user_model_1.User.findByIdAndUpdate((_11 = req === null || req === void 0 ? void 0 : req.user) === null || _11 === void 0 ? void 0 : _11.userId, {
            $inc: {
                numberOfSales: obj.numberOfSales,
                saleDays: obj === null || obj === void 0 ? void 0 : obj.saleDays,
                numberOfAdvertisement: obj === null || obj === void 0 ? void 0 : obj.numberOfAdvertisement,
                advertisementDays: obj === null || obj === void 0 ? void 0 : obj.advertisementDays,
                numberOfBannerImages: obj === null || obj === void 0 ? void 0 : obj.numberOfBannerImages,
                bannerimagesDays: obj === null || obj === void 0 ? void 0 : obj.bannerimagesDays,
                numberOfOpportunities: obj === null || obj === void 0 ? void 0 : obj.numberOfOpportunities,
                OpportunitiesDays: obj === null || obj === void 0 ? void 0 : obj.OpportunitiesDays,
            },
        }).exec();
        obj.price = obj.price + Math.round(obj.price * 0.18);
        let options = {
            amount: obj.price,
            currency: "INR",
            receipt: new Date().getTime(),
        };
        let paymentObj = {
            amount: obj.price,
            orderObj: obj,
            paymentChk: 0,
        };
        let paymentObjResponse = yield new Payment_model_1.Payment(paymentObj).save();
        options.orderId = paymentObjResponse._id;
        options.mobile = userObj === null || userObj === void 0 ? void 0 : userObj.phone;
        const paymentPageClientId = hdfcConfig_1.hdfcConfig.PAYMENT_PAGE_CLIENT_ID;
        const orderId = `order_${Date.now()}`;
        // makes return url
        const returnUrl = `${process.env.BASE_URL}/userTopup/handleJuspayPaymentForTopup`;
        const sessionResponse = yield hdfcConfig_1.juspayConfig.orderSession.create({
            order_id: orderId,
            amount: options.amount,
            payment_page_client_id: paymentPageClientId,
            customer_id: options.userId,
            action: 'paymentPage',
            return_url: returnUrl,
            currency: 'INR',
            customer_phone: options.email,
            customer_email: options.mobile,
            udf6: req.body._id // [optional] default is INR
        });
        let orderPaymentObj = sessionResponse;
        let obj1 = yield Payment_model_1.Payment.findByIdAndUpdate(paymentObjResponse._id, {
            "gatwayPaymentObj": orderPaymentObj,
        })
            .lean()
            .exec();
        console.log('upadtedx', obj1);
        sessionResponse.orderIdx = paymentObjResponse._id;
        // removes http field from response, typically you won't send entire structure as response
        return res.json(makeJuspayResponse(sessionResponse));
    }
    catch (err) {
        next(err);
    }
});
exports.initiateJuspayPaymentForTopup = initiateJuspayPaymentForTopup;
const handleJuspayPaymentForTopup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _12, _13, _14;
    try {
        const orderId = req.body.order_id || req.body.orderId;
        console.log(req.body, 'XXXXXXXXX');
        if (orderId === undefined) {
            return res.status(400).json(makeError('order_id not present or cannot be empty'));
        }
        let orderObj = yield Payment_model_1.Payment.findOne({ 'gatwayPaymentObj.order_id': orderId }).exec();
        console.log('qazxc', orderObj);
        if (!orderObj) {
            return res.status(400).json(makeError('order not found'));
        }
        if ((orderObj === null || orderObj === void 0 ? void 0 : orderObj.paymentChk) == 1) {
            // throw new Error("Payment is already Done");
            console.log(req.body, "Payment is already Done");
            res.redirect(`${process.env.APP_URL}/Payment/${orderObj._id}?msg=Payment is already Done`);
            // res.json({ message: "Payment is already Done ", success: true, orderId: orderObj._id, data: orderObj });
            return;
        }
        // Call Juspay API to get order status
        const statusResponse = yield hdfcConfig_1.juspayConfig.order.status(orderId);
        const orderStatus = statusResponse.status;
        console.log('qwerty', statusResponse);
        let message = '';
        let obj1 = yield Payment_model_1.Payment.findByIdAndUpdate(orderObj._id, {
            "statusResponse": statusResponse,
        })
            .lean()
            .exec();
        if (orderStatus === "PENDING") {
            message = "order payment pending";
            res.redirect(`${process.env.APP_URL}/Payment/${orderObj._id}?result=error&message=${encodeURIComponent(message)}&orderId=${statusResponse.order_id}&orderStatus=${orderStatus}`);
        }
        if (orderStatus === "NEW") {
            message = "order pending or not completed";
            res.redirect(`${process.env.APP_URL}/Payment/${orderObj._id}?result=error&message=${encodeURIComponent(message)}&orderId=${statusResponse.order_id}&orderStatus=${orderStatus}`);
        }
        if (orderStatus === "PENDING_VBV") {
            message = "order payment pending";
            res.redirect(`${process.env.APP_URL}/Payment/${orderObj._id}?result=error&message=${encodeURIComponent(message)}&orderId=${statusResponse.order_id}&orderStatus=${orderStatus}`);
        }
        if (orderStatus === "AUTHORIZATION_FAILED") {
            message = "order payment authorization failed";
            res.redirect(`${process.env.APP_URL}/Payment/${orderObj._id}?result=error&message=${encodeURIComponent(message)}&orderId=${statusResponse.order_id}&orderStatus=${orderStatus}`);
        }
        if (orderStatus === "AUTHENTICATION_FAILED") {
            message = "order payment authentication failed";
            res.redirect(`${process.env.APP_URL}/Payment/${orderObj._id}?result=error&message=${encodeURIComponent(message)}&orderId=${statusResponse.order_id}&orderStatus=${orderStatus}`);
        }
        if (orderStatus === "PARTIAL_CHARGED") {
            message = "order partially charged";
            res.redirect(`${process.env.APP_URL}/Payment/${orderObj._id}?result=error&message=${encodeURIComponent(message)}&orderId=${statusResponse.order_id}&orderStatus=${orderStatus}`);
        }
        if (orderStatus === "AUTO_REFUNDED") {
            message = "order has been automatically refunded";
            res.redirect(`${process.env.APP_URL}/Payment/${orderObj._id}?result=error&message=${encodeURIComponent(message)}&orderId=${statusResponse.order_id}&orderStatus=${orderStatus}`);
        }
        if (orderStatus === "STARTED") {
            message = "transaction is pending, please try again later";
            res.redirect(`${process.env.APP_URL}/Payment/${orderObj._id}?result=error&message=${encodeURIComponent(message)}&orderId=${statusResponse.order_id}&orderStatus=${orderStatus}`);
        }
        if (orderStatus === "AUTHORIZING") {
            message = "transaction is currently being authorized";
            res.redirect(`${process.env.APP_URL}/Payment/${orderObj._id}?result=error&message=${encodeURIComponent(message)}&orderId=${statusResponse.order_id}&orderStatus=${orderStatus}`);
        }
        let orderIdForBlock = orderId;
        if (orderStatus === "CHARGED") {
            const updatedPayment = yield Payment_model_1.Payment.findOneAndUpdate({ 'gatwayPaymentObj.order_id': orderIdForBlock }, // Find payment by order_id in gatwayPaymentObj
            { $set: { "paymentChk": 1,
                    "gatwayPaymentObj": statusResponse }
            }, // Update order_id
            { new: true } // Return the updated document
            ).exec();
            if (updatedPayment) {
                console.log('Updated Payment:', updatedPayment);
            }
            else {
                console.log('No payment found with the given order_id.');
            }
            orderObj = updatedPayment;
            let userObj = yield user_model_1.User.findById((_12 = orderObj === null || orderObj === void 0 ? void 0 : orderObj.orderObj) === null || _12 === void 0 ? void 0 : _12.userId).exec();
            let patObj = orderObj === null || orderObj === void 0 ? void 0 : orderObj.orderObj;
            let totalSubscription = yield userTopup_model_1.UserTopup.countDocuments({});
            let invoiceId = (0, constant_1.getTopUpOrderIdSequence)(totalSubscription + 1);
            patObj.orderId = invoiceId;
            yield user_model_1.User.findByIdAndUpdate((_13 = orderObj === null || orderObj === void 0 ? void 0 : orderObj.orderObj) === null || _13 === void 0 ? void 0 : _13.userId, {
                $inc: {
                    numberOfSales: patObj.numberOfSales,
                    saleDays: patObj === null || patObj === void 0 ? void 0 : patObj.saleDays,
                    numberOfAdvertisement: patObj === null || patObj === void 0 ? void 0 : patObj.numberOfAdvertisement,
                    advertisementDays: patObj === null || patObj === void 0 ? void 0 : patObj.advertisementDays,
                    numberOfBannerImages: patObj === null || patObj === void 0 ? void 0 : patObj.numberOfBannerImages,
                    bannerimagesDays: patObj === null || patObj === void 0 ? void 0 : patObj.bannerimagesDays,
                    numberOfOpportunities: patObj === null || patObj === void 0 ? void 0 : patObj.numberOfOpportunities,
                    OpportunitiesDays: patObj === null || patObj === void 0 ? void 0 : patObj.OpportunitiesDays,
                },
                subscriptionEndDate: patObj.endDate,
            }).exec();
            orderObj = yield new userTopup_model_1.UserTopup(patObj).save();
            let email = (userObj === null || userObj === void 0 ? void 0 : userObj.email) ? userObj === null || userObj === void 0 ? void 0 : userObj.email : (_14 = userObj === null || userObj === void 0 ? void 0 : userObj.companyObj) === null || _14 === void 0 ? void 0 : _14.email;
            let name = userObj === null || userObj === void 0 ? void 0 : userObj.name;
            let orderIdForScope = orderObj === null || orderObj === void 0 ? void 0 : orderObj.orderId;
            let emailArr = [
                {
                    name,
                    email,
                },
            ];
            let customerTitle = `Topup has been confirmed ${orderIdForScope}`;
            let adminTitle = `New Topup ${orderIdForScope} -  ${name}`;
            let obj3 = Object.assign({}, orderObj);
            console.log(obj3);
            obj3.order_id = orderIdForScope;
            obj3.createdAtDate2 = new Date(orderObj.createdAt).toDateString();
            yield (0, mailer_1.sendMail)(emailArr, orderObj._id, customerTitle, orderObj);
            let emailAr2 = [{ name: "Plywood Bazar", email: "admin@plywoodbazar.com" }];
            yield (0, mailer_1.sendMail)(emailAr2, orderObj._id, adminTitle, orderObj);
            console.log("asdsadad", process.env.APP_URL);
            res.redirect(`${process.env.APP_URL}/Payment/${orderObj._id}?orderStatus=${orderStatus}&txn_id=${statusResponse.txn_id}&effective_amount=${statusResponse.effective_amount}&txn_uuid=${statusResponse.txn_uuid}&type=topup`);
        }
        else {
            message = "UNKNOWN PAYMENT STATUS";
            res.redirect(`${process.env.APP_URL}/Payment/${orderObj._id}?result=error&message=${encodeURIComponent(message)}&orderId=${statusResponse.order_id}&orderStatus=${orderStatus}`);
        }
    }
    catch (err) {
        next(err);
    }
});
exports.handleJuspayPaymentForTopup = handleJuspayPaymentForTopup;
function makeError(message) {
    return {
        message: message || 'Something went wrong'
    };
}
function makeJuspayResponse(successRspFromJuspay) {
    if (!successRspFromJuspay)
        return successRspFromJuspay;
    if (successRspFromJuspay.http !== undefined)
        delete successRspFromJuspay.http;
    return successRspFromJuspay;
}
