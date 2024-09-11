import express from "express";
import {
  addUserRequirement,
  getById,
  getUserRequirement,
  deleteById,
} from "../controllers/userRequirements.controller";

const router = express.Router();

router.post("/addUserRequirement", addUserRequirement);
router.get("/", getUserRequirement);
router.get("/getById/:id", getById);
router.delete("/deleteById/:id", deleteById);


export default router;
