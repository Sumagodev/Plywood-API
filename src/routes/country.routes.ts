import express from "express";
import {
  addCountry,
  deleteById,
  getById,
  getCountry,
  updateById,
} from "../controllers/country.controller";

const router = express.Router();

router.post("/", addCountry);
router.get("/", getCountry);
router.get("/getById/:id", getById);
router.patch("/updateById/:id", updateById);
router.delete("/deleteById/:id", deleteById);


export default router;
