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
exports.deleteById = exports.getById = exports.getUserTicket = exports.CreateTicket = void 0;
const UserTickets_model_1 = require("../models/UserTickets.model");
const CreateTicket = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield new UserTickets_model_1.UserTickets(req.body).save();
        res.status(200).json({ message: "User Ticket Successfully Created", success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.CreateTicket = CreateTicket;
const getUserTicket = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let query = {};
        if (req.query.userId) {
            query = Object.assign(Object.assign({}, query), { userId: req.query.userId });
        }
        let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
        let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 1000;
        let userTicketArr = yield UserTickets_model_1.UserTickets.find(query).skip(((pageValue - 1) * limitValue)).limit(limitValue).sort({ createdAt: -1 }).populate("userId").exec();
        let totalElements = yield UserTickets_model_1.UserTickets.find(query).count().exec();
        console.log(userTicketArr);
        res.status(200).json({ message: "getUserTicket", data: userTicketArr, totalElements: totalElements, success: true });
        // res.status(200).json({ message: "getUserTicket", data: UserTicketArr, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getUserTicket = getUserTicket;
const getById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let UserTicketObj = yield UserTickets_model_1.UserTickets.findById(req.params.id).lean().exec();
        if (!UserTicketObj)
            throw { status: 400, message: "User Ticket Not Found" };
        res.status(200).json({ message: "UserTickets Found", data: UserTicketObj, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getById = getById;
const deleteById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const TopupObj = yield UserTickets_model_1.UserTickets.findByIdAndDelete(req.params.id).exec();
        if (!TopupObj)
            throw { status: 400, message: "Ticket Not Found" };
        res.status(200).json({ message: "Ticket Deleted", success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.deleteById = deleteById;
