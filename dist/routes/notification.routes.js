"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const notification_controller_1 = require("../controllers/notification.controller");
const router = express_1.default.Router();
router.post("/updateReadStatus", notification_controller_1.updateReadStatus);
router.post("/getNotificationCount", notification_controller_1.getUserNotificationCount);
router.post("/getAllNotifications", notification_controller_1.getUserNotificationsController);
router.post("/upadateRead", notification_controller_1.updateReadStatusNew);
router.post("/getUnreadNotificationsCount", notification_controller_1.getUnreadNotificationsCount);
exports.default = router;
