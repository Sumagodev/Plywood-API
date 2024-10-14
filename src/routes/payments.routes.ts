import express from "express";
import {
    handleHdfcWebhook,
    verifyPayment
} from "../controllers/payments.controller";

const router = express.Router();

router.post("/handleHdfcWebhook", handleHdfcWebhook);
router.post("/verifyPayment", verifyPayment);


export default router;
