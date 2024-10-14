import express from "express";
import {
    handleHdfcWebhook
} from "../controllers/webhook.controller";

const router = express.Router();

router.post("/handleHdfcWebhook", handleHdfcWebhook);


export default router;
