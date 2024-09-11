import express from "express";
import {
  buyTopup,
  getAllTopupbyUserId,
  getById,
  getTopup,
  getTopupSubscribedbyUserId,
  phonepePaymentTopUpStatusCheck,
} from "../controllers/userTopup.controller";
import { authorizeJwt } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/buyTopup", authorizeJwt, buyTopup);
router.post("/phonepePaymentStatusCheck/:orderId", phonepePaymentTopUpStatusCheck);
router.get("/", getTopup);
router.get("/getTopupSubscribedbyUserId/:id", getTopupSubscribedbyUserId);
router.get("/getAllTopupbyUserId", getAllTopupbyUserId);
router.get("/getByUserId/:id", getById);

export default router;
