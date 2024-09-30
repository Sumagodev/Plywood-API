import express from "express";
import {
  addVendorReview,
  deleteById,
  getById,
  getVendorReview,
  updateById,
} from "../controllers/vendorReview.controller";

const router = express.Router();

router.post("/", addVendorReview);

router.get("/getReviewForVendors", getVendorReview);

router.get("/getById/:id", getById);


router.patch("/updateById/:id", updateById);
router.delete("/deleteById/:id", deleteById);


export default router;
