import express from "express";
import { getUserNotificationCount, updateReadStatus } from "../controllers/notification.controller";


const router = express.Router();

router.post("/updateReadStatus", updateReadStatus);
router.get("/getNotificationCount", getUserNotificationCount);



export default router;