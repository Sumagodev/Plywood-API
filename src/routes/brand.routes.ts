import express from "express";
import {
  addBrand,
  deleteById,
  getById,
  getBrand,
  updateById,
} from "../controllers/brand.controller";

const router = express.Router();

router.post("/", addBrand);
router.get("/", getBrand);
router.get("/getById/:id", getById);
router.patch("/updateById/:id", updateById);
router.delete("/deleteById/:id", deleteById);


export default router;
