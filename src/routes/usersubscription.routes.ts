import express from "express";
import { buySubscription, getAllSubscriptionbyUserId, getById, getSubscription, getSubscriptionSubscribedbyUserId, phonepePaymentStatusCheck, sendMailById } from "../controllers/usersubsctiption.controller";

const router = express.Router();

router.post("/buySubscription", buySubscription);
router.get("/", getSubscription);
router.get("/getSubscriptionSubscribedbyUserId/:id", getSubscriptionSubscribedbyUserId);
router.get("/getAllSubscriptionbyUserId", getAllSubscriptionbyUserId);
router.get("/getByUserId/:id", getById);
router.get("/sendMailById/:id", sendMailById);
router.post("/phonepePaymentStatusCheck/:orderId", phonepePaymentStatusCheck);
router.post("/initiateJuspayPayment", phonepePaymentStatusCheck);
router.post("/handleJuspayResponse", phonepePaymentStatusCheck);



export default router;
