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
exports.getById = exports.deleteById = exports.updateById = exports.getState = exports.addState = void 0;
const State_model_1 = require("../models/State.model");
const country_model_1 = require("../models/country.model");
const addState = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.body);
        const StateNameCheck = yield State_model_1.State.findOne({
            name: new RegExp(`^${req.body.name}$`, "i"),
        }).exec();
        if (StateNameCheck)
            throw new Error("Entry Already exist please change brand name ");
        const newEntry = new State_model_1.State(req.body).save();
        if (!newEntry) {
            throw new Error("Unable to create State");
        }
        res.status(200).json({ message: "State Successfully Created", success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.addState = addState;
const getState = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let StateArr = [];
        let query = {};
        if (req.query.status) {
            query.status = req.query.status;
        }
        if (req.query.countryId) {
            query.countryId = req.query.countryId;
        }
        if (req.query.q) {
            query = Object.assign(Object.assign({}, query), { name: new RegExp(`${req.query.q}`, "i") });
        }
        let stateCount = yield State_model_1.State.find(query).countDocuments();
        let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
        let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 1000;
        StateArr = yield State_model_1.State.find(query)
            .skip((pageValue - 1) * limitValue)
            .limit(limitValue)
            .sort({ name: 1 })
            .lean()
            .exec();
        // for (let state of StateArr) {
        //   if (state.countryId) {
        //     console.log(state.countryId, "countryIdcountryId")
        //     state.countryObj = await Country.findById(state.countryId).exec();
        //   }
        // }
        res.status(200).json({ message: "getState", data: StateArr, totalPages: stateCount, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getState = getState;
const updateById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const StateObj = yield State_model_1.State.findById(req.params.id).lean().exec();
        if (!StateObj) {
            throw new Error(" State not found");
        }
        yield State_model_1.State.findByIdAndUpdate(req.params.id, req.body).exec();
        res.status(200).json({ message: "State Updated", success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.updateById = updateById;
const deleteById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const StateObj = yield State_model_1.State.findByIdAndDelete(req.params.id).exec();
        if (!StateObj)
            throw { status: 400, message: "State Not Found" };
        res.status(200).json({ message: "State Deleted", success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.deleteById = deleteById;
const getById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let StateObj = yield State_model_1.State.findById(req.params.id).lean().exec();
        if (!StateObj)
            throw { status: 400, message: "State Not Found" };
        if (StateObj.countryId) {
            console.log(StateObj.countryId, "countryIdcountryId");
            StateObj.countryObj = yield country_model_1.Country.findById(StateObj.countryId).exec();
        }
        res.status(200).json({ message: "State Found", data: StateObj, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getById = getById;
