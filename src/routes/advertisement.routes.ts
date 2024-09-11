import express from "express";
import {
  addAdvertisementSubscription,
  deleteById,
  getById,
  getAdvertisementSubscription,
  updateById,
  getAdvertisementSubscriptionForHomepage,
} from "../controllers/advertisement.controller";

const router = express.Router();

router.post("/", addAdvertisementSubscription);
router.get("/", getAdvertisementSubscription);
router.get("/getForHomepage", getAdvertisementSubscriptionForHomepage);
router.get("/getById/:id", getById);
router.patch("/updateById/:id", updateById);
router.delete("/deleteById/:id", deleteById);

export default router;