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
exports.getById = exports.deleteById = exports.updateById = exports.getLeadsBycreatedById = exports.getLeadForAdmin = exports.getLeadsForAdmin = exports.getLead = exports.addLead = void 0;
const leads_model_1 = require("../models/leads.model");
const product_model_1 = require("../models/product.model");
const user_model_1 = require("../models/user.model");
const userSubscription_model_1 = require("../models/userSubscription.model");
const UserFcmTokens_model_1 = require("../models/UserFcmTokens.model");
const constant_1 = require("../helpers/constant");
const Notifications_model_1 = require("../models/Notifications.model");
const fcmNotify_1 = require("../helpers/fcmNotify");
const country_model_1 = require("../models/country.model");
const State_model_1 = require("../models/State.model");
const City_model_1 = require("../models/City.model");
const sipCrm_service_1 = require("../service/sipCrm.service");
const addLead = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    try {
        console.log("ADDING LEAD", req.body);
        if (req.body.userId == req.body.createdById) {
            throw new Error("You cannot contact yourself");
        }
        let userObj = yield user_model_1.User.findById(req.body.createdById).exec();
        console.log(userObj === null || userObj === void 0 ? void 0 : userObj.subscriptionEndDate, "userObjuserObjuserObj");
        if (!(userObj === null || userObj === void 0 ? void 0 : userObj.subscriptionEndDate)) {
            throw new Error("You do not have a valid subscription to create a lead.");
        }
        if (userObj.isBlocked) {
            throw new Error("Your subscription is blocked please contact admin");
        }
        let subscriptionEndDate = new Date(userObj === null || userObj === void 0 ? void 0 : userObj.subscriptionEndDate);
        let currentDate = new Date();
        if (subscriptionEndDate.getTime() < currentDate.getTime()) {
            throw new Error("You do not have a valid subscription to create a lead.");
        }
        let productName = "";
        let productObj = yield product_model_1.Product.findById(req.body.productId).exec();
        if (productObj && productObj.name) {
            productName = productObj.name;
        }
        const newEntry = new leads_model_1.Lead(req.body).save();
        if (!newEntry) {
            throw new Error("Unable to create Lead");
        }
        let crmObj = {
            PersonName: userObj === null || userObj === void 0 ? void 0 : userObj.name,
            MobileNo: userObj === null || userObj === void 0 ? void 0 : userObj.phone,
            EmailID: userObj === null || userObj === void 0 ? void 0 : userObj.email,
            CompanyName: `${(_a = userObj === null || userObj === void 0 ? void 0 : userObj.companyObj) === null || _a === void 0 ? void 0 : _a.name}`,
            OfficeAddress: `${userObj === null || userObj === void 0 ? void 0 : userObj.address}`,
            MediumName: "Contact Supplier",
            Country: "",
            State: "",
            City: "",
            SourceName: "app",
            InitialRemarks: productName,
        };
        if ((_b = req.body) === null || _b === void 0 ? void 0 : _b.SourceName) {
            crmObj.SourceName = (_c = req.body) === null || _c === void 0 ? void 0 : _c.SourceName;
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
        let fcmTokensArr = yield UserFcmTokens_model_1.UserFcmToken.find({ userId: req.body.userId, fcmToken: { $ne: null } }).exec();
        if (fcmTokensArr && (fcmTokensArr === null || fcmTokensArr === void 0 ? void 0 : fcmTokensArr.length) > 0) {
            let obj = {
                tokens: fcmTokensArr.map((el) => el.fcmToken),
                data: {
                    title: constant_1.notification_text.lead_notification_text_obj.title,
                    content: `${constant_1.notification_text.lead_notification_text_obj.content} ${productName ? "on " + productName : ""}`,
                },
            };
            let saveNotificationObj = {
                userId: req.body.createdById,
                title: obj.data.title,
                content: obj.data.content,
            };
            yield new Notifications_model_1.Notifications(saveNotificationObj).save();
            if ((obj === null || obj === void 0 ? void 0 : obj.tokens) && ((_d = obj === null || obj === void 0 ? void 0 : obj.tokens) === null || _d === void 0 ? void 0 : _d.length) > 0) {
                console.log(saveNotificationObj, "NOTIFICATION OBJ");
                yield (0, fcmNotify_1.fcmMulticastNotify)(obj);
            }
        }
        res.status(200).json({ message: "Lead Successfully Created", success: true });
        let visitorUserId = req.body.userId;
        let leadUser = yield user_model_1.User.findById(req.body.userId).lean().exec();
        if (!leadUser)
            throw new Error("Lead User Not Found");
        const newNotification = new Notifications_model_1.Notifications({
            userId: req.body.createdById,
            type: 'contact',
            title: 'Someone tried to contact you',
            content: `Someone tried to contact you  => user ${visitorUserId}`,
            isRead: false,
            payload: {
                accessedBy: visitorUserId,
                accessTime: new Date(),
                organizationName: ((_e = leadUser === null || leadUser === void 0 ? void 0 : leadUser.companyObj) === null || _e === void 0 ? void 0 : _e.name) || 'Unknown',
                phone: leadUser === null || leadUser === void 0 ? void 0 : leadUser.phone,
                productObj: productObj,
                name: leadUser === null || leadUser === void 0 ? void 0 : leadUser.name,
                leadUserObj: leadUser,
            }
        });
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
exports.addLead = addLead;
const getLead = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let LeadArr = [];
        let query = {};
        console.log(req.query, "req.query.q");
        if (req.query.q) {
            query.name = new RegExp(`${req.query.q}`, "i");
        }
        // if (req.query.LeadId) {
        //   query.LeadId = req.query.LeadId;
        // }
        LeadArr = yield leads_model_1.Lead.find(query).lean().exec();
        // for (let Lead of LeadArr) {
        //   if (Lead.LeadId) {
        //     console.log(Lead.LeadId, "LeadIdLeadId")
        //     Lead.LeadObj = await Lead.findById(Lead.LeadId).exec();
        //   }
        // }
        res.status(200).json({ message: "getLead", data: LeadArr, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getLead = getLead;
const getLeadsForAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let LeadArr = [];
        let query = {};
        // if (req.query.q) {
        //   query.name = new RegExp(`${req.query.q}`, "i");
        // }
        let pipeline = [
            {
                "$addFields": {
                    "userId": {
                        "$toObjectId": "$userId",
                    },
                    "productId": {
                        "$toObjectId": "$productId",
                    },
                    "createdById": {
                        "$toObjectId": "$createdById",
                    },
                },
            },
            {
                "$lookup": {
                    "from": "users",
                    "localField": "userId",
                    "foreignField": "_id",
                    "as": "userObj",
                },
            },
            {
                "$lookup": {
                    "from": "products",
                    "localField": "productId",
                    "foreignField": "_id",
                    "as": "productObj",
                },
            },
            {
                "$lookup": {
                    "from": "users",
                    "localField": "createdById",
                    "foreignField": "_id",
                    "as": "createdByObj",
                },
            },
            {
                "$unwind": {
                    "path": "$userObj",
                    "preserveNullAndEmptyArrays": false,
                },
            },
            {
                "$unwind": {
                    "path": "$productObj",
                    "preserveNullAndEmptyArrays": true,
                },
            },
            {
                "$unwind": {
                    "path": "$createdByObj",
                    "preserveNullAndEmptyArrays": false,
                },
            },
        ];
        let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
        let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 1000;
        if (req.query.q) {
            query["$or"] = [
                {
                    "userObj.name": new RegExp(`${req.query.q}`, "i"),
                },
                {
                    "productObj.name": new RegExp(`${req.query.q}`, "i"),
                },
                {
                    "createdByObj.name": new RegExp(`${req.query.q}`, "i"),
                },
            ];
        }
        if (req.query.endDate) {
            query = Object.assign(Object.assign({}, query), { createdAt: { $lte: req.query.endDate, $gte: req.query.startDate } });
        }
        if (req.query.startDate) {
            query = Object.assign(Object.assign({}, query), { createdAt: { $gte: req.query.startDate } });
        }
        if (query) {
            pipeline.push({
                "$match": query
            });
        }
        pipeline.push({
            "$skip": (pageValue - 1) * limitValue,
        });
        pipeline.push({
            "$limit": limitValue,
        });
        // if (req.query.LeadId) {
        //   query.LeadId = req.query.LeadId;
        // }
        let totalPages = yield leads_model_1.Lead.find(query).countDocuments();
        LeadArr = yield leads_model_1.Lead.aggregate(pipeline).exec();
        console.log(LeadArr, "leadArr");
        // for (let Lead of LeadArr) {
        //   if (Lead.LeadId) {
        //     console.log(Lead.LeadId, "LeadIdLeadId")
        //     Lead.LeadObj = await Lead.findById(Lead.LeadId).exec();
        //   }
        // }
        res.status(200).json({ message: "getLead", data: LeadArr, totalPages, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getLeadsForAdmin = getLeadsForAdmin;
const getLeadForAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let pipeline = [
            {
                "$addFields": {
                    "userID": {
                        "$toObjectId": "$userId",
                    },
                    "productID": {
                        "$toObjectId": "$productId",
                    },
                },
            },
            {
                "$lookup": {
                    "from": "users",
                    "localField": "userID",
                    "foreignField": "_id",
                    "as": "userObj",
                },
            },
            {
                "$lookup": {
                    "from": "products",
                    "localField": "productID",
                    "foreignField": "_id",
                    "as": "productObj",
                },
            },
            {
                "$unwind": {
                    "path": "$userObj",
                    "preserveNullAndEmptyArrays": false,
                },
            },
            {
                "$unwind": {
                    "path": "$productObj",
                    "preserveNullAndEmptyArrays": false,
                },
            },
        ];
        let LeadArr = [];
        let query = {};
        console.log(req.query, "req.query.q");
        if (req.query.q) {
            query.name = new RegExp(`${req.query.q}`, "i");
        }
        // if (req.query.LeadId) {
        //   query.LeadId = req.query.LeadId;
        // }
        LeadArr = yield leads_model_1.Lead.find(query).lean().exec();
        // for (let Lead of LeadArr) {
        //   if (Lead.LeadId) {
        //     console.log(Lead.LeadId, "LeadIdLeadId")
        //     Lead.LeadObj = await Lead.findById(Lead.LeadId).exec();
        //   }
        // }
        res.status(200).json({ message: "getLead", data: LeadArr, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getLeadForAdmin = getLeadForAdmin;
const getLeadsBycreatedById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _f, _g;
    try {
        let LeadArr = [];
        let latestSubscription = yield userSubscription_model_1.UserSubscription.findOne({ userId: (_f = req.params) === null || _f === void 0 ? void 0 : _f.id }).exec();
        LeadArr = yield leads_model_1.Lead.find({ createdById: (_g = req.params) === null || _g === void 0 ? void 0 : _g.id }).sort({ createdAt: -1 }).lean().exec();
        for (const el of LeadArr) {
            let productObj = yield product_model_1.Product.findById(el.productId).exec();
            if (productObj) {
                el.productObj = productObj;
            }
            let userObj = yield user_model_1.User.findById(el.userId).exec();
            if (userObj) {
                el.userObj = userObj;
            }
        }
        if (!LeadArr)
            throw { status: 400, message: "Lead Not Found" };
        // for (let Lead of LeadArr) {
        //   if (Lead.LeadId) {
        //     console.log(Lead.LeadId, "LeadIdLeadId")
        //     Lead.LeadObj = await Lead.findById(Lead.LeadId).exec();
        //   }
        // }
        console.log(LeadArr, LeadArr.length, "sad");
        res.status(200).json({ message: "getLead", data: LeadArr, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getLeadsBycreatedById = getLeadsBycreatedById;
const updateById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const LeadObj = yield leads_model_1.Lead.findById(req.params.id).lean().exec();
        if (!LeadObj) {
            throw new Error("Lead not found");
        }
        yield leads_model_1.Lead.findByIdAndUpdate(req.params.id, req.body).exec();
        res.status(200).json({ message: "Lead Updated", success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.updateById = updateById;
const deleteById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const LeadObj = yield leads_model_1.Lead.findByIdAndDelete(req.params.id).exec();
        if (!LeadObj)
            throw { status: 400, message: "Lead Not Found" };
        res.status(200).json({ message: "Lead Deleted", success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.deleteById = deleteById;
const getById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let LeadsArr = yield leads_model_1.Lead.find({ userId: req.params.id }).lean().exec();
        for (const el of LeadsArr) {
            let productObj = yield product_model_1.Product.findById(el.productId).exec();
            if (productObj) {
                el.productObj = productObj;
            }
            let userObj = yield user_model_1.User.findById(el.createdById).exec();
            if (userObj) {
                el.userObj = userObj;
            }
        }
        if (!LeadsArr)
            throw { status: 400, message: "Lead Not Found" };
        res.status(200).json({ message: "Lead Found", data: LeadsArr, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getById = getById;
