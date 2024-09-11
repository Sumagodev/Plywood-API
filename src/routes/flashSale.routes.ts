import express from "express";
import { addFlashSale, getFlashSale, deleteById, getById, updateById, getAllFlashSales } from "../controllers/flashSale.controller";


const router = express.Router();

router.post("/", addFlashSale);
router.get("/getFlashSalesByUserId/:id", getFlashSale);
router.get("/getFlashSales", getAllFlashSales);
router.get("/getById/:id", getById);
router.patch("/updateById/:id", updateById);
router.delete("/deleteById/:id", deleteById);


export default router;
