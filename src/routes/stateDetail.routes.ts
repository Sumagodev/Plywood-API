import express from "express";
import {
  addStateDetail, getStateDetail, updateStateDetail, deleteStateDetail, getAllStateDetails
} from "../controllers/StateDetail.controller";

const router = express.Router();



router.post("/stateDetail", addStateDetail);
router.get("/stateDetail/:id", getStateDetail);
router.put("/stateDetail/:id", updateStateDetail);
router.delete("/stateDetail/:id", deleteStateDetail);
router.get("/stateDetails", getAllStateDetails);

export default router;
