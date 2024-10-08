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
exports.getUnreadNotificationsCount = exports.updateReadStatusNew = exports.getUserNotificationsController = exports.getNotificationsForUser = exports.getUserNotificationCount = exports.getUserNotifications = exports.updateReadStatus = void 0;
const Notifications_model_1 = require("../models/Notifications.model");
const mongoose_1 = require("mongoose"); // Import Types from mongoose
const NotificationReadStatus_model_1 = require("../models/NotificationReadStatus.model");
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
        // Ensure that userId is provided in the request body
        if (!req.body.userId) {
            return res.status(400).json({
                message: "User ID is required",
                success: false,
            });
        }
        const userId = new mongoose_1.Types.ObjectId(req.body.userId);
        // Construct the query for unread notifications by userId
        const countQuery = {
            userId: userId,
            isRead: false,
        };
        // Count unread notifications
        let totalUnreadCount = yield Notifications_model_1.Notifications.countDocuments(countQuery).exec();
        res.status(200).json({
            message: "Unread notification count retrieved successfully",
            totalUnreadCount: totalUnreadCount,
            success: true,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.getUserNotificationCount = getUserNotificationCount;
// The function to get notifications for a user
const getNotificationsForUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    // Fetch notifications for the specific user
    const userNotifications = yield Notifications_model_1.Notifications.find({ userId }).lean();
    // Fetch notifications that reach "all" and are not read
    const allNotifications = yield Notifications_model_1.Notifications.find({ reach: "all" }).lean();
    // Fetch read statuses for this user
    const readStatuses = yield NotificationReadStatus_model_1.NotificationReadStatus.find({ userId }).lean();
    // Create a map of notificationId to readAt date for quick lookup
    const readStatusMap = new Map(readStatuses.map(status => [status.notificationId.toString(), status.readAt]));
    // Combine user-specific notifications with notifications for all users
    const combinedNotifications = [...userNotifications, ...allNotifications];
    // Add isRead property and return the notifications
    return combinedNotifications.map(notification => (Object.assign(Object.assign({}, notification), { isRead: readStatusMap.has(notification._id.toString()), readAt: readStatusMap.get(notification._id.toString()) // Optional: get the read timestamp
     })))
        .filter(notification => !notification.isRead)
        .sort((a, b) => b.lastAccessTime.getTime() - a.lastAccessTime.getTime()); // Sort in descending order based on `createdAt`
});
exports.getNotificationsForUser = getNotificationsForUser;
const getNotificationsForUserPaginated = (userId, page = 1, pageSize = 10) => __awaiter(void 0, void 0, void 0, function* () {
    // Fetch read statuses for this user
    const readStatuses = yield NotificationReadStatus_model_1.NotificationReadStatus.find({ userId }).lean();
    // Create a set of read notification IDs for faster lookups
    const readNotificationIds = new Set(readStatuses.map((status) => status.notificationId.toString()));
    // Query to fetch unread notifications (both user-specific and "all" reach) directly from DB
    const query = {
        $or: [
            { userId },
            { reach: 'all' }, // Fetch notifications with reach to "all"
        ],
        _id: { $nin: [...readNotificationIds] }, // Exclude already read notifications
    };
    // Calculate total unread notifications for pagination
    const totalItems = yield Notifications_model_1.Notifications.countDocuments(query);
    // Calculate total pages
    const totalPages = Math.ceil(totalItems / pageSize);
    // Adjust the current page if it's out of range
    const adjustedPage = Math.max(1, Math.min(page, totalPages));
    // Fetch paginated unread notifications directly from the database
    const paginatedNotifications = yield Notifications_model_1.Notifications.find(query)
        .sort({ lastAccessTime: -1 }) // Sort by last access time in descending order
        .skip((adjustedPage - 1) * pageSize) // Skip to the correct page
        .limit(pageSize) // Limit results to pageSize
        .lean(); // Return plain JS objects
    // Return paginated results
    return {
        items: paginatedNotifications,
        currentPage: adjustedPage,
        totalPages: totalPages,
        pageSize: pageSize,
        totalItems: totalItems,
    };
});
const getUserNotificationsController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.body.userId; // Assume you're sending userId in the request body
        if (!req.body.userId) {
            return res.status(400).json({
                message: "User ID is required",
                success: false,
            });
        }
        // Call the function to get notifications
        const notifications = yield (0, exports.getNotificationsForUser)(userId);
        // Return the response with notifications
        res.status(200).json({
            message: "Notifications retrieved successfully",
            data: notifications,
            success: true,
        });
    }
    catch (error) {
        next(error); // Pass the error to your global error handler
    }
});
exports.getUserNotificationsController = getUserNotificationsController;
const updateReadStatusNew = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, notificationId } = req.body;
        if (!userId || !notificationId) {
            return res.status(400).json({ message: "userId and notificationId are required." });
        }
        // Convert notificationId to ObjectId
        const notificationObjectId = new mongoose_1.Types.ObjectId(notificationId);
        // Find the read status for this user and notification
        const existingStatus = yield NotificationReadStatus_model_1.NotificationReadStatus.findOne({ userId, notificationId: notificationObjectId });
        if (existingStatus) {
            // If the read status already exists, update it
            existingStatus.readAt = new Date(); // Update the read timestamp
            yield existingStatus.save();
        }
        else {
            // If it does not exist, create a new read status
            const newStatus = new NotificationReadStatus_model_1.NotificationReadStatus({
                notificationId: notificationObjectId,
                userId: new mongoose_1.Types.ObjectId(userId),
                readAt: new Date() // Set the current timestamp
            });
            yield newStatus.save();
        }
        res.status(200).json({ message: "Read status updated successfully." });
    }
    catch (error) {
        console.error("Error updating read status:", error);
        next(error); // Pass the error to the global error handler
    }
});
exports.updateReadStatusNew = updateReadStatusNew;
// Function to get the unread notification count for a user
const getUnreadNotificationsCount = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.body.userId;
        if (!userId) {
            return res.status(400).json({ message: "User ID is required", success: false });
        }
        // Get the notifications that are either specific to the user or for all users
        const userSpecificNotifications = yield Notifications_model_1.Notifications.find({ userId }).lean();
        const globalNotifications = yield Notifications_model_1.Notifications.find({ reach: "all" }).lean();
        // Fetch the read statuses for this user
        const readStatuses = yield NotificationReadStatus_model_1.NotificationReadStatus.find({ userId }).lean();
        // Create a map of notificationId to easily check which notifications have been read
        const readStatusMap = new Map(readStatuses.map(status => [status.notificationId.toString(), status.readAt]));
        // Combine all the notifications (user-specific + global)
        const combinedNotifications = [...userSpecificNotifications, ...globalNotifications];
        // Count the notifications that are not read (i.e., not present in the readStatusMap)
        const unreadCount = combinedNotifications.filter(notification => !readStatusMap.has(notification._id.toString())).length;
        // Return the count in the response
        res.status(200).json({
            message: "Unread notification count retrieved successfully",
            unreadCount,
            success: true,
        });
    }
    catch (error) {
        console.error("Error fetching unread notifications count:", error);
        next(error); // Pass the error to the global error handler
    }
});
exports.getUnreadNotificationsCount = getUnreadNotificationsCount;
