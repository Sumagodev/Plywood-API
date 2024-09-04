import express from "express";
import {
  addCategory,
  deleteById,
  getById,
  getCategory,
  getNameBySlug,
  getNestedCategory,
  updateById,
} from "../controllers/category.controller";

const router = express.Router();

router.post("/addCategory", addCategory);

router.get("/getCategory", getCategory);

router.get("/getChildCategory", getCategory);
router.get("/getById/:id", getById);
router.get("/getNameBySlug/:id", getNameBySlug);

router.patch("/updateById/:id", updateById);

router.delete("/deleteById/:id", deleteById);

router.get("/getNestedCategories", getNestedCategory);

export default router;
