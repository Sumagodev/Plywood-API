import express from "express";
import { updateReadStatus } from "../controllers/notification.controller";


const router = express.Router();



router.post("/updateReadStatus", updateReadStatus);


export default router;