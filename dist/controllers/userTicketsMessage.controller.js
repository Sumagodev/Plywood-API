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
exports.getUserTicketMessages = exports.CreateTicketMessage = void 0;
const UserTickets_model_1 = require("../models/UserTickets.model");
const userTicketMessages_model_1 = require("../models/userTicketMessages.model");
const CreateTicketMessage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield new userTicketMessages_model_1.UserTicketsMessage(req.body).save();
        res.status(200).json({ message: "Your message is successfully sent to us , we will get back to you with a solution as soon as possible", success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.CreateTicketMessage = CreateTicketMessage;
const getUserTicketMessages = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let query = {};
        let userTicketObj = yield UserTickets_model_1.UserTickets.findById(req.params.id).lean().exec();
        if (!userTicketObj) {
            throw new Error("Lead not found !!!");
        }
        let ticketMessageArr = yield userTicketMessages_model_1.UserTicketsMessage.find({ userTicketsId: userTicketObj === null || userTicketObj === void 0 ? void 0 : userTicketObj._id }).exec();
        if (ticketMessageArr) {
            userTicketObj.ticketMessageArr = ticketMessageArr;
        }
        res.status(200).json({ message: "getUserTicket", data: userTicketObj, success: true });
        // res.status(200).json({ message: "getUserTicket", data: UserTicketArr, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getUserTicketMessages = getUserTicketMessages;
