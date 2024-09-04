import express from "express";
import {
  addCity,
  deleteById,
  getById,
  getCity,
  importCities,
  updateById,
} from "../controllers/city.controller";

const router = express.Router();

router.post("/", addCity);
router.get("/", getCity);
router.get("/getById/:id", getById);
router.patch("/updateById/:id", updateById);
router.post("/importCities", importCities);
router.delete("/deleteById/:id", deleteById);


export default router;
