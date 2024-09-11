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
exports.getById = exports.deleteById = exports.updateById = exports.getTopupWithSubscriberCountApi = exports.getTopup = exports.addTopup = void 0;
const Topup_model_1 = require("../models/Topup.model");
const addTopup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.body);
        const TopupNameCheck = yield Topup_model_1.Topup.findOne({
            name: new RegExp(`^${req.body.name}$`, "i"),
        }).exec();
        if (TopupNameCheck)
            throw new Error("Entry Already exist please change name ");
        const newEntry = new Topup_model_1.Topup(req.body).save();
        if (!newEntry) {
            throw new Error("Unable to create Topup");
        }
        res.status(200).json({ message: "Topup purchased successfully", success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.addTopup = addTopup;
const getTopup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let TopupArr = [];
        let query = {};
        console.log(req.query, "req.query.q");
        if (req.query.q) {
            query.name = new RegExp(`${req.query.q}`, "i");
        }
        // if (req.query.TopupId) {
        //   query.TopupId = req.query.TopupId;
        // }
        if (req.query.role) {
            query.role = req.query.role;
        }
        let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
        let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 10;
        let TopupCount = yield Topup_model_1.Topup.find(query).countDocuments();
        TopupArr = yield Topup_model_1.Topup.find(query).skip((pageValue - 1) * limitValue).limit(limitValue).lean().exec();
        // for (let Topup of TopupArr) {
        //   if (Topup.TopupId) {
        //     console.log(Topup.TopupId, "TopupIdTopupId")
        //     Topup.TopupObj = await Topup.findById(Topup.TopupId).exec();
        //   }
        // }
        res.status(200).json({ message: "getTopup", data: TopupArr, TopupCount, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getTopup = getTopup;
const getTopupWithSubscriberCountApi = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
                    'from': 'userTopups',
                    'localField': 'id',
                    'foreignField': 'TopupId',
                    'as': 'usersArr'
                }
            }, {
                '$project': {
                    'name': 1,
                    'description': 1,
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
        let TopupArr = [];
        let query = {};
        console.log(req.query, "req.query.q");
        if (req.query.q) {
            query.name = new RegExp(`${req.query.q}`, "i");
        }
        // if (req.query.TopupId) {
        //   query.TopupId = req.query.TopupId;
        // }
        let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
        let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 10;
        pipeLine.push({
            '$skip': ((pageValue - 1) * limitValue),
        });
        pipeLine.push({
            '$limit': limitValue,
        });
        let TopupCount = yield Topup_model_1.Topup.find(query).countDocuments();
        TopupArr = yield Topup_model_1.Topup.aggregate(pipeLine);
        // for (let Topup of TopupArr) {
        //   if (Topup.TopupId) {
        //     console.log(Topup.TopupId, "TopupIdTopupId")
        //     Topup.TopupObj = await Topup.findById(Topup.TopupId).exec();
        //   }
        // }
        res.status(200).json({ message: "getTopup", data: TopupArr, TopupCount, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getTopupWithSubscriberCountApi = getTopupWithSubscriberCountApi;
const updateById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const TopupObj = yield Topup_model_1.Topup.findById(req.params.id).lean().exec();
        if (!TopupObj) {
            throw new Error("Topup not found");
        }
        yield Topup_model_1.Topup.findByIdAndUpdate(req.params.id, req.body).exec();
        res.status(200).json({ message: "Topup Updated", success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.updateById = updateById;
const deleteById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const TopupObj = yield Topup_model_1.Topup.findByIdAndDelete(req.params.id).exec();
        if (!TopupObj)
            throw { status: 400, message: "Topup Not Found" };
        res.status(200).json({ message: "Topup Deleted", success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.deleteById = deleteById;
const getById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let TopupObj = yield Topup_model_1.Topup.findById(req.params.id).lean().exec();
        if (!TopupObj)
            throw { status: 400, message: "Topup Not Found" };
        res.status(200).json({ message: "Topup Found", data: TopupObj, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getById = getById;
