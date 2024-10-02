import express from "express";
import { getUserNotificationCount, updateReadStatus } from "../controllers/notification.controller";


const router = express.Router();

router.post("/updateReadStatus", updateReadStatus);
router.post("/getNotificationCount", getUserNotificationCount);



export default router;