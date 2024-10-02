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
exports.getUserNotificationCount = exports.getUserNotifications = exports.updateReadStatus = void 0;
const Notifications_model_1 = require("../models/Notifications.model");
const updateReadStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, notificationId } = req.body;
        // Validate userId
        if (!userId || typeof userId !== 'string') {
            return res.status(400).json({ message: "Invalid userId", success: false });
        }
        // Validate notificationId
        if (!notificationId || typeof notificationId !== 'string') {
            return res.status(400).json({ message: "Invalid notificationId", success: false });
        }
        // Check if notification exists
        const notification = yield Notifications_model_1.Notifications.findOne({ _id: notificationId, userId });
        if (!notification) {
            return res.status(404).json({ message: "Notification not found", success: false });
        }
        // Update notification to set isRead to true
        notification.isRead = true;
        yield notification.save();
        // Return success response
        res.status(200).json({ message: "Notification marked as read", success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.updateReadStatus = updateReadStatus;
const getUserNotifications = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let ProductArr = [];
        let query = {};
        if (req.query.userId) {
            query.userId = req.query.userId;
        }
        if (req.query.isRead != undefined && req.query.isRead) {
            query.isRead = req.query.isRead;
        }
        let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
        let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 1000;
        ProductArr = yield Notifications_model_1.Notifications.find(query)
            .skip((pageValue - 1) * limitValue)
            .limit(limitValue)
            .sort({ createdAt: -1 })
            .exec();
        let totalElements = yield Notifications_model_1.Notifications.find(query).count().exec();
        console.log(totalElements, ProductArr === null || ProductArr === void 0 ? void 0 : ProductArr.length);
        res.status(200).json({ message: "getProduct", data: ProductArr, totalElements: totalElements, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getUserNotifications = getUserNotifications;
const getUserNotificationCount = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let ProductArr = [];
        let query = {};
        if (req.query.userId) {
            query.userId = req.query.userId;
        }
        // Always include isRead: false in the count query
        const countQuery = Object.assign(Object.assign({}, query), { isRead: false });
        if (req.query.isRead !== undefined) {
            query.isRead = req.query.isRead;
        }
        let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
        let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 1000;
        ProductArr = yield Notifications_model_1.Notifications.find(query)
            .skip((pageValue - 1) * limitValue)
            .limit(limitValue)
            .sort({ createdAt: -1 })
            .exec();
        // Count only unread notifications
        let totalElements = yield Notifications_model_1.Notifications.countDocuments(countQuery).exec();
        console.log(totalElements, ProductArr === null || ProductArr === void 0 ? void 0 : ProductArr.length);
        res.status(200).json({
            message: "getProduct",
            data: ProductArr,
            totalElements: totalElements,
            success: true,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.getUserNotificationCount = getUserNotificationCount;
