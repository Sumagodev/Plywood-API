import express from "express";
import {
    handleHdfcWebhook,
    verifyPayment
} from "../controllers/payments.controller";
import { authorizeJwt } from "../middlewares/auth.middleware";
const router = express.Router();

router.post("/handleHdfcWebhook", handleHdfcWebhook);
router.post("/verifyPayment", authorizeJwt,verifyPayment);


export default router;
