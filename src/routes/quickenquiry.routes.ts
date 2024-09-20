import express from "express";
import {
  addquickenquiry,
  getById,
  getquickenquiry,
  deleteById,
} from "../controllers/quickenqury.controller";

const router = express.Router();

router.post("/addquickenquiry", addquickenquiry);
router.get("/", getquickenquiry);
router.get("/getById/:id", getById);
router.delete("/deleteById/:id", deleteById);


export default router;
