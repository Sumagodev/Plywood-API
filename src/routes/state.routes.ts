import express from "express";
import {
  addState,
  deleteById,
  getById,
  getState,
  updateById,
} from "../controllers/state.controller";

const router = express.Router();

router.post("/", addState);
router.get("/", getState);
router.get("/getById/:id", getById);
router.patch("/updateById/:id", updateById);
router.delete("/deleteById/:id", deleteById);


export default router;
