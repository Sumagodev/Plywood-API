import express from "express";
import { getNotificationsForUser, getUserNotificationCount, updateReadStatus, updateReadStatusNew ,getUserNotificationsController} from "../controllers/notification.controller";


const router = express.Router();

router.post("/updateReadStatus", updateReadStatus);
router.post("/getNotificationCount", getUserNotificationCount);
router.post("/getAllNotifications", getUserNotificationsController);
router.post("/upadateRead", updateReadStatusNew);



export default router;