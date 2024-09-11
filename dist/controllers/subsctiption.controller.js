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
exports.getById = exports.deleteById = exports.updateById = exports.getSubscriptionWithSubscriberCountApi = exports.getSubscription = exports.addSubscription = void 0;
const Subscription_model_1 = require("../models/Subscription.model");
const addSubscription = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.body);
        const SubscriptionNameCheck = yield Subscription_model_1.Subscription.findOne({
            name: new RegExp(`^${req.body.name}$`, "i"),
        }).exec();
        if (SubscriptionNameCheck)
            throw new Error("Entry Already exist please change name ");
        const newEntry = new Subscription_model_1.Subscription(req.body).save();
        if (!newEntry) {
            throw new Error("Unable to create Subscription");
        }
        res.status(200).json({ message: "Subscription Successfully Created", success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.addSubscription = addSubscription;
const getSubscription = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let SubscriptionArr = [];
        let query = {};
        console.log(req.query, "req.query.q");
        if (req.query.q) {
            query.name = new RegExp(`${req.query.q}`, "i");
        }
        // if (req.query.SubscriptionId) {
        //   query.SubscriptionId = req.query.SubscriptionId;
        // }
        if (req.query.role) {
            query.role = req.query.role;
        }
        let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
        let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 10;
        let subscriptionCount = yield Subscription_model_1.Subscription.find(query).countDocuments();
        SubscriptionArr = yield Subscription_model_1.Subscription.find(query).skip((pageValue - 1) * limitValue).limit(limitValue).lean().exec();
        // for (let Subscription of SubscriptionArr) {
        //   if (Subscription.SubscriptionId) {
        //     console.log(Subscription.SubscriptionId, "SubscriptionIdSubscriptionId")
        //     Subscription.SubscriptionObj = await Subscription.findById(Subscription.SubscriptionId).exec();
        //   }
        // }
        res.status(200).json({ message: "getSubscription", data: SubscriptionArr, subscriptionCount, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getSubscription = getSubscription;
const getSubscriptionWithSubscriberCountApi = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let pipeLine = [
            {
                '$addFields': {
                    'id': {
                        '$toString': '$_id'
                    }
                }
            }, {
                '$lookup': {
                    'from': 'usersubscriptions',
                    'localField': 'id',
                    'foreignField': 'subscriptionId',
                    'as': 'usersArr'
                }
            }, {
                '$project': {
                    'name': 1,
                    'description': 1,
                    'noOfMonth': 1,
                    'price': 1,
                    'numberOfSales': 1,
                    'saleDays': 1,
                    'advertisementDays': 1,
                    'numberOfAdvertisement': 1,
                    'usersCount': 1,
                    'usersArr': {
                        '$setUnion': '$usersArr.userId'
                    }
                }
            }, {
                '$addFields': {
                    'usersCount': {
                        '$size': '$usersArr'
                    }
                }
            }, {
                '$project': {
                    'name': 1,
                    'description': 1,
                    'noOfMonth': 1,
                    'price': 1,
                    'numberOfSales': 1,
                    'saleDays': 1,
                    'advertisementDays': 1,
                    'numberOfAdvertisement': 1,
                    'usersCount': 1
                }
            }
        ];
        if (req.query.q) {
            pipeLine.push({
                '$match': {
                    'name': new RegExp(`${req.query.q}`, "i")
                }
            });
        }
        let SubscriptionArr = [];
        let query = {};
        console.log(req.query, "req.query.q");
        if (req.query.q) {
            query.name = new RegExp(`${req.query.q}`, "i");
        }
        // if (req.query.SubscriptionId) {
        //   query.SubscriptionId = req.query.SubscriptionId;
        // }
        let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
        let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 10;
        pipeLine.push({
            '$skip': ((pageValue - 1) * limitValue),
        });
        pipeLine.push({
            '$limit': limitValue,
        });
        let subscriptionCount = yield Subscription_model_1.Subscription.find(query).countDocuments();
        SubscriptionArr = yield Subscription_model_1.Subscription.aggregate(pipeLine);
        // for (let Subscription of SubscriptionArr) {
        //   if (Subscription.SubscriptionId) {
        //     console.log(Subscription.SubscriptionId, "SubscriptionIdSubscriptionId")
        //     Subscription.SubscriptionObj = await Subscription.findById(Subscription.SubscriptionId).exec();
        //   }
        // }
        res.status(200).json({ message: "getSubscription", data: SubscriptionArr, subscriptionCount, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getSubscriptionWithSubscriberCountApi = getSubscriptionWithSubscriberCountApi;
const updateById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const SubscriptionObj = yield Subscription_model_1.Subscription.findById(req.params.id).lean().exec();
        if (!SubscriptionObj) {
            throw new Error("Subscription not found");
        }
        yield Subscription_model_1.Subscription.findByIdAndUpdate(req.params.id, req.body).exec();
        res.status(200).json({ message: "Subscription Updated", success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.updateById = updateById;
const deleteById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const SubscriptionObj = yield Subscription_model_1.Subscription.findByIdAndDelete(req.params.id).exec();
        if (!SubscriptionObj)
            throw { status: 400, message: "Subscription Not Found" };
        res.status(200).json({ message: "Subscription Deleted", success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.deleteById = deleteById;
const getById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let SubscriptionObj = yield Subscription_model_1.Subscription.findById(req.params.id).lean().exec();
        if (!SubscriptionObj)
            throw { status: 400, message: "Subscription Not Found" };
        res.status(200).json({ message: "Subscription Found", data: SubscriptionObj, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getById = getById;
