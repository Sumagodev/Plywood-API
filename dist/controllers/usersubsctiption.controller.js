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
exports.sendMailById = exports.getById = exports.getAllSubscriptionbyUserId = exports.getSubscriptionSubscribedbyUserId = exports.getSubscription = exports.phonepePaymentStatusCheck = exports.buySubscription = void 0;
const userSubscription_model_1 = require("../models/userSubscription.model");
const user_model_1 = require("../models/user.model");
const moment_1 = __importDefault(require("moment"));
const phonepay_1 = require("../helpers/phonepay");
const Payment_model_1 = require("../models/Payment.model");
const mailer_1 = require("../helpers/mailer");
const country_model_1 = require("../models/country.model");
const State_model_1 = require("../models/State.model");
const City_model_1 = require("../models/City.model");
const sipCrm_service_1 = require("../service/sipCrm.service");
const constant_1 = require("../helpers/constant");
const buySubscription = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
    try {
        let existsCheck = yield userSubscription_model_1.UserSubscription.findOne({ userId: (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.userId }).sort({ endDate: -1 }).exec();
        console.log(existsCheck, "existsCheck");
        let tempStartDate = new Date();
        let tempEndDate = new Date();
        if (((_b = req.body) === null || _b === void 0 ? void 0 : _b.noOfMonth) > 0) {
            if (existsCheck && existsCheck.endDate) {
                tempStartDate = new Date(existsCheck.endDate);
                tempEndDate = (0, moment_1.default)(existsCheck.endDate).add({ months: (_c = req.body) === null || _c === void 0 ? void 0 : _c.noOfMonth });
            }
            else {
                tempEndDate = (0, moment_1.default)(tempEndDate).add({ months: (_d = req.body) === null || _d === void 0 ? void 0 : _d.noOfMonth });
            }
        }
        else if (existsCheck && existsCheck.endDate) {
            tempEndDate = existsCheck.endDate;
        }
        else {
            tempEndDate = undefined;
        }
        let obj = {
            userId: (_e = req === null || req === void 0 ? void 0 : req.user) === null || _e === void 0 ? void 0 : _e.userId,
            subscriptionId: req.body._id,
            name: (_f = req.body) === null || _f === void 0 ? void 0 : _f.name,
            description: (_g = req.body) === null || _g === void 0 ? void 0 : _g.description,
            price: (_h = req.body) === null || _h === void 0 ? void 0 : _h.price,
            startDate: tempStartDate,
            numberOfSales: ((_j = req === null || req === void 0 ? void 0 : req.body) === null || _j === void 0 ? void 0 : _j.numberOfSales) ? (_k = req === null || req === void 0 ? void 0 : req.body) === null || _k === void 0 ? void 0 : _k.numberOfSales : 0,
            saleDays: ((_l = req === null || req === void 0 ? void 0 : req.body) === null || _l === void 0 ? void 0 : _l.saleDays) ? (_m = req === null || req === void 0 ? void 0 : req.body) === null || _m === void 0 ? void 0 : _m.saleDays : 0,
            numberOfAdvertisement: ((_o = req === null || req === void 0 ? void 0 : req.body) === null || _o === void 0 ? void 0 : _o.numberOfAdvertisement) ? (_p = req === null || req === void 0 ? void 0 : req.body) === null || _p === void 0 ? void 0 : _p.numberOfAdvertisement : 0,
            advertisementDays: ((_q = req === null || req === void 0 ? void 0 : req.body) === null || _q === void 0 ? void 0 : _q.advertisementDays) ? (_r = req === null || req === void 0 ? void 0 : req.body) === null || _r === void 0 ? void 0 : _r.advertisementDays : 0,
            isExpired: false,
            endDate: null,
        };
        if (tempEndDate) {
            obj.endDate = tempEndDate;
        }
        let userObj = yield user_model_1.User.findById((_s = req === null || req === void 0 ? void 0 : req.user) === null || _s === void 0 ? void 0 : _s.userId).exec();
        if (!(userObj || userObj._id)) {
            throw new Error("Could not find user please contact admin !!!");
        }
        // Add GST
        obj.price = obj.price + Math.round(obj.price * 0.18);
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
        options.successUrl = `${process.env.BASE_URL}/usersubscription/phonepePaymentStatusCheck/` + paymentObjResponse._id;
        options.payfrom = req.body.patfrom;
        let phoResone = yield (0, phonepay_1.createPhonePaymentOrder)(options);
        console.log(phoResone, "phoResone");
        if (phoResone && !(phoResone === null || phoResone === void 0 ? void 0 : phoResone.sucess)) {
            throw new Error(`Phonepe is not working.Please Try Some another Payment Method`);
        }
        let orderPaymentObj = phoResone === null || phoResone === void 0 ? void 0 : phoResone.data;
        let obj1 = yield Payment_model_1.Payment.findByIdAndUpdate(paymentObjResponse._id, {
            "gatwayPaymentObj": orderPaymentObj,
        })
            .lean()
            .exec();
        // await User.findByIdAndUpdate(req?.user?.userId, { $inc: { numberOfSales: obj.numberOfSales, saleDays: obj?.saleDays, numberOfAdvertisement: obj?.numberOfAdvertisement, advertisementDays: obj?.advertisementDays }, subscriptionEndDate: obj.endDate }).exec();
        // await new UserSubscription(obj).save()
        res.status(200).json({
            message: "UserSubscription Successfully Created",
            data: orderPaymentObj,
            orderId: paymentObjResponse._id,
            success: true,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.buySubscription = buySubscription;
const phonepePaymentStatusCheck = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _t, _u, _v, _w, _x, _y, _z;
    try {
        console.log(req.body, "-------------------------------------------------");
        // const userObj = await User.findById(req.user.userId).lean().exec();
        let orderObj = yield Payment_model_1.Payment.findById(req.params.orderId).exec();
        if (!orderObj)
            throw new Error("Order Not Found");
        if ((orderObj === null || orderObj === void 0 ? void 0 : orderObj.paymentChk) == 1) {
            // throw new Error("Payment is already Done");
            console.log(req.body, "Payment is already Done");
            res.redirect(`${process.env.APP_URL}/Payment/${orderObj._id}?msg=Payment is already Done`);
            // res.json({ message: "Payment is already Done ", success: true, orderId: orderObj._id, data: orderObj });
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
        phoneObj.paymentInstrument = (_t = checkPaymentStatus === null || checkPaymentStatus === void 0 ? void 0 : checkPaymentStatus.data) === null || _t === void 0 ? void 0 : _t.paymentInstrument;
        orderObj = yield Payment_model_1.Payment.findByIdAndUpdate(req.params.orderId, {
            "paymentChk": 1,
            "gatwayPaymentObj": phoneObj,
        })
            .lean()
            .exec();
        let userObj = yield user_model_1.User.findById((_u = orderObj === null || orderObj === void 0 ? void 0 : orderObj.orderObj) === null || _u === void 0 ? void 0 : _u.userId).exec();
        let patObj = orderObj === null || orderObj === void 0 ? void 0 : orderObj.orderObj;
        let totalSubscription = yield userSubscription_model_1.UserSubscription.countDocuments({});
        let invoiceId = (0, constant_1.getSubscriptionSequence)(totalSubscription + 1);
        patObj.orderId = invoiceId;
        yield user_model_1.User.findByIdAndUpdate((_v = orderObj === null || orderObj === void 0 ? void 0 : orderObj.orderObj) === null || _v === void 0 ? void 0 : _v.userId, {
            $inc: {
                numberOfSales: patObj.numberOfSales,
                saleDays: patObj === null || patObj === void 0 ? void 0 : patObj.saleDays,
                numberOfAdvertisement: patObj === null || patObj === void 0 ? void 0 : patObj.numberOfAdvertisement,
                advertisementDays: patObj === null || patObj === void 0 ? void 0 : patObj.advertisementDays,
            },
            subscriptionEndDate: patObj.endDate,
        }).exec();
        orderObj = yield new userSubscription_model_1.UserSubscription(patObj).save();
        let email = (userObj === null || userObj === void 0 ? void 0 : userObj.email) ? userObj === null || userObj === void 0 ? void 0 : userObj.email : (_w = userObj === null || userObj === void 0 ? void 0 : userObj.companyObj) === null || _w === void 0 ? void 0 : _w.email;
        let name = userObj === null || userObj === void 0 ? void 0 : userObj.name;
        let orderId = orderObj === null || orderObj === void 0 ? void 0 : orderObj.orderId;
        let emailArr = [
            {
                name,
                email,
            },
        ];
        let customerTitle = `Subscription has been confirmed ${orderId}`;
        let adminTitle = `New Subscription ${orderId} -  ${name}`;
        orderObj.user = userObj;
        let obj3 = Object.assign({}, orderObj);
        console.log(obj3);
        obj3.order_id = invoiceId;
        obj3.createdAtDate2 = new Date(orderObj.createdAt).toDateString();
        yield (0, mailer_1.sendMail)(emailArr, orderObj._id, customerTitle, orderObj);
        let emailAr2 = [{ name: "Plywood Bazar", email: "admin@plywoodbazar.com" }];
        yield (0, mailer_1.sendMail)(emailAr2, orderObj._id, adminTitle, orderObj);
        console.log("asdsadad", process.env.APP_URL);
        let crmObj = {
            PersonName: userObj === null || userObj === void 0 ? void 0 : userObj.name,
            MobileNo: userObj === null || userObj === void 0 ? void 0 : userObj.phone,
            EmailID: userObj === null || userObj === void 0 ? void 0 : userObj.email,
            CompanyName: `${(_x = userObj === null || userObj === void 0 ? void 0 : userObj.companyObj) === null || _x === void 0 ? void 0 : _x.name}`,
            OfficeAddress: `${userObj === null || userObj === void 0 ? void 0 : userObj.address}`,
            MediumName: "Subscribed",
            CampaignName: orderObj === null || orderObj === void 0 ? void 0 : orderObj.name,
            Country: "",
            State: "",
            City: "",
            SourceName: "app",
            InitialRemarks: `Start Date  : ${orderObj === null || orderObj === void 0 ? void 0 : orderObj.startDate}, End Date : ${orderObj === null || orderObj === void 0 ? void 0 : orderObj.endDate}`,
        };
        if ((_y = req.body) === null || _y === void 0 ? void 0 : _y.SourceName) {
            crmObj.SourceName = (_z = req.body) === null || _z === void 0 ? void 0 : _z.SourceName;
        }
        if (userObj.countryId) {
            let countryObj = yield country_model_1.Country.findById(userObj.countryId).exec();
            crmObj.Country = (countryObj === null || countryObj === void 0 ? void 0 : countryObj.name) ? countryObj === null || countryObj === void 0 ? void 0 : countryObj.name : "";
        }
        if (userObj.stateId) {
            let stateObj = yield State_model_1.State.findById(userObj.stateId).exec();
            crmObj.State = (stateObj === null || stateObj === void 0 ? void 0 : stateObj.name) ? stateObj === null || stateObj === void 0 ? void 0 : stateObj.name : "";
        }
        if (userObj.cityId) {
            let cityObj = yield City_model_1.City.findById(userObj.cityId).exec();
            crmObj.City = (cityObj === null || cityObj === void 0 ? void 0 : cityObj.name) ? cityObj === null || cityObj === void 0 ? void 0 : cityObj.name : "";
        }
        yield (0, sipCrm_service_1.postSpiCrmLead)(crmObj);
        res.redirect(`${process.env.APP_URL}/Payment/${orderObj._id}`);
        // res.json({ message: "Payment Successfull", success: true, orderId: orderObj._id, data: phoneObj });
    }
    catch (err) {
        next(err);
    }
});
exports.phonepePaymentStatusCheck = phonepePaymentStatusCheck;
const getSubscription = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // let SubscriptionArr: any = [];
        // let query: any = {}
        // console.log(req.query, "req.query.q")
        // if (req.query.q) {
        //     query.name = new RegExp(`${req.query.q}`, "i");
        // }
        // // if (req.query.SubscriptionId) {
        // //   query.SubscriptionId = req.query.SubscriptionId;
        // // }
        // SubscriptionArr = await UserSubscription.find(query).lean().exec();
        // // for (let UserSubscription of SubscriptionArr) {
        // //   if (UserSubscription.SubscriptionId) {
        // //     console.log(UserSubscription.SubscriptionId, "SubscriptionIdSubscriptionId")
        // //     UserSubscription.SubscriptionObj = await UserSubscription.findById(UserSubscription.SubscriptionId).exec();
        // //   }
        // // }
        res.status(200).json({ message: "getSubscription", success: true });
        // res.status(200).json({ message: "getSubscription", data: SubscriptionArr, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getSubscription = getSubscription;
const getSubscriptionSubscribedbyUserId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
        let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 1000;
        let pipeline = [
            {
                "$match": {
                    "subscriptionId": "643e355aecef4e188270bb68",
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
                    "usersArr.subscriptionEndDate": 1,
                    "usersArr.price": 1,
                    "usersArr.startDate": 1,
                    "usersArr.endDate": 1,
                    "usersArr.createdAt": 1,
                },
            },
        ];
        let SubscriptionArr = [];
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
        // // if (req.query.SubscriptionId) {
        // //   query.SubscriptionId = req.query.SubscriptionId;
        // // }
        SubscriptionArr = yield userSubscription_model_1.UserSubscription.aggregate(pipeline).exec();
        // // for (let UserSubscription of SubscriptionArr) {
        // //   if (UserSubscription.SubscriptionId) {
        // //     console.log(UserSubscription.SubscriptionId, "SubscriptionIdSubscriptionId")
        // //     UserSubscription.SubscriptionObj = await UserSubscription.findById(UserSubscription.SubscriptionId).exec();
        // //   }
        // // }
        console.log(JSON.stringify(SubscriptionArr, null, 2), "SubscriptionArr");
        res.status(200).json({ message: "getSubscription", data: SubscriptionArr, success: true });
        // res.status(200).json({ message: "getSubscription", data: SubscriptionArr, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getSubscriptionSubscribedbyUserId = getSubscriptionSubscribedbyUserId;
const getAllSubscriptionbyUserId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _0, _1, _2, _3;
    try {
        let SubscriptionArr = [];
        // let query: any = {}
        // console.log(req.query, "req.query.q")
        // if (req.query.q) {
        //     query.name = new RegExp(`${req.query.q}`, "i");
        // }
        // // if (req.query.SubscriptionId) {
        // //   query.SubscriptionId = req.query.SubscriptionId;
        // // }
        console.log(req.query);
        let pageValue = req.query.currentPage ? parseInt(`${req.query.currentPage}`) : 1;
        let limitValue = req.query.rowsPerPage ? parseInt(`${req.query.rowsPerPage}`) : 10;
        const totalCount = yield userSubscription_model_1.UserSubscription.find({
            $or: [{ userId: (_0 = req.user) === null || _0 === void 0 ? void 0 : _0.userId }, { userId: (_1 = req.query) === null || _1 === void 0 ? void 0 : _1.userId }],
        }).countDocuments();
        SubscriptionArr = yield userSubscription_model_1.UserSubscription.find({
            $or: [{ userId: (_2 = req.user) === null || _2 === void 0 ? void 0 : _2.userId }, { userId: (_3 = req.query) === null || _3 === void 0 ? void 0 : _3.userId }],
        })
            .skip((pageValue - 1) * limitValue)
            .limit(limitValue)
            .lean()
            .sort({ endDate: -1 })
            .exec();
        // // for (let UserSubscription of SubscriptionArr) {
        // //   if (UserSubscription.SubscriptionId) {
        // //     console.log(UserSubscription.SubscriptionId, "SubscriptionIdSubscriptionId")
        // //     UserSubscription.SubscriptionObj = await UserSubscription.findById(UserSubscription.SubscriptionId).exec();
        // //   }
        // // }
        res
            .status(200)
            .json({ message: "getAllSubscriptionbyUserId", data: SubscriptionArr, totalCount: totalCount, success: true });
        // res.status(200).json({ message: "getSubscription", data: SubscriptionArr, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getAllSubscriptionbyUserId = getAllSubscriptionbyUserId;
const getById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // let SubscriptionObj: any = await UserSubscription.findById(req.params.id).lean().exec();
        // if (!SubscriptionObj) throw { status: 400, message: "UserSubscription Not Found" };
        res.status(200).json({ message: "UserSubscription Found", success: true });
        // res.status(200).json({ message: "UserSubscription Found", data: SubscriptionObj, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getById = getById;
const sendMailById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _4;
    try {
        // let SubscriptionObj: any = await UserSubscription.findById(req.params.id).lean().exec();
        // if (!SubscriptionObj) throw { status: 400, message: "UserSubscription Not Found" };
        console.log(req.params.id, "req.params.idreq.params.idreq.params.id");
        let userOrderObj = yield userSubscription_model_1.UserSubscription.findById(`${req.params.id}`).exec();
        if (!userOrderObj)
            throw new Error("Order Not Found");
        let userObj = yield user_model_1.User.findById(userOrderObj === null || userOrderObj === void 0 ? void 0 : userOrderObj.userId).exec();
        let email = (userObj === null || userObj === void 0 ? void 0 : userObj.email) ? userObj === null || userObj === void 0 ? void 0 : userObj.email : (_4 = userObj === null || userObj === void 0 ? void 0 : userObj.companyObj) === null || _4 === void 0 ? void 0 : _4.email;
        let name = userObj === null || userObj === void 0 ? void 0 : userObj.name;
        let orderId = userOrderObj === null || userOrderObj === void 0 ? void 0 : userOrderObj._id;
        let emailArr = [
            {
                name,
                email,
            },
        ];
        let customerTitle = `Subscription with ${orderId}`;
        userOrderObj.user = userObj;
        let obj3 = Object.assign({}, userOrderObj);
        console.log(obj3);
        obj3.order_id = orderId;
        obj3.createdAtDate2 = new Date(userOrderObj.createdAt).toDateString();
        yield (0, mailer_1.sendMail)(emailArr, userOrderObj._id, customerTitle, userOrderObj);
        let adminTitle = ` Subscription ${orderId} -  ${name}`;
        let emailAr2 = [{ name: "Plywood Bazar", email: "admin@plywoodbazar.com" }];
        yield (0, mailer_1.sendMail)(emailAr2, userOrderObj._id, adminTitle, userOrderObj);
        res.status(200).json({ message: "Mail Send Successfully ", success: true });
        // res.status(200).json({ message: "UserSubscription Found", data: SubscriptionObj, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.sendMailById = sendMailById;
