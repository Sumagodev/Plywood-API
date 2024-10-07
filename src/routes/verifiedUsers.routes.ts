import express from "express";
import {
  addVerifiedUser,
  getById,
  getVerifiedUser,
  deleteById,
} from "../controllers/verifiedUsers.controller";

const router = express.Router();

router.post("/addquickenquiry", addVerifiedUser);
router.get("/getVerifiedUser", getVerifiedUser);
router.get("/getById/:id", getById);
router.delete("/deleteById/:id", deleteById);


export default router;
