import express from "express";
import {
  addProductReview,
  deleteById,
  getById,
  getProductReview,
  updateById,
} from "../controllers/productReview.controller";

const router = express.Router();

router.post("/", addProductReview);
router.get("/getReviewForProduct", getProductReview);
router.get("/getById/:id", getById);
router.patch("/updateById/:id", updateById);
router.delete("/deleteById/:id", deleteById);


export default router;
