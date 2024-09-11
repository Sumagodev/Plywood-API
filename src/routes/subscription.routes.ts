import express from "express";
import {

  addSubscription,
  deleteById,
  getById,
  getSubscription,
  getSubscriptionWithSubscriberCountApi,
  updateById,
} from "../controllers/subsctiption.controller";

const router = express.Router();

router.post("/", addSubscription);
router.get("/", getSubscription);
router.get("/getSubscriptionWithSubscriberCountApi", getSubscriptionWithSubscriberCountApi);
router.get("/getById/:id", getById);
router.patch("/updateById/:id", updateById);
router.delete("/deleteById/:id", deleteById);


export default router;
