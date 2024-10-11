import express from "express";
import {
  buyTopup,
  getAllTopupbyUserId,
  getById,
  getTopup,
  getTopupSubscribedbyUserId,
  phonepePaymentTopUpStatusCheck,
  handleJuspayPaymentForTopup,
  initiateJuspayPaymentForTopup
} from "../controllers/userTopup.controller";
import { authorizeJwt } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/buyTopup", authorizeJwt, buyTopup);
router.post("/phonepePaymentStatusCheck/:orderId", phonepePaymentTopUpStatusCheck);
router.get("/", getTopup);
router.get("/getTopupSubscribedbyUserId/:id", getTopupSubscribedbyUserId);
router.get("/getAllTopupbyUserId", getAllTopupbyUserId);
router.get("/getByUserId/:id", getById);


router.post("/initiateJuspayPaymentForTopup",authorizeJwt, initiateJuspayPaymentForTopup);
router.post("/handleJuspayPaymentForTopup", handleJuspayPaymentForTopup);


export default router;
