import express from "express";
import {
  addSeo,
  deleteById,
  getSeo,
  getById,
  updateById
} from "../controllers/Seo.controller";

const router = express.Router();

router.post("/", addSeo);
router.get("/", getSeo);
router.get("/getById/:id", getById);
router.patch("/updateById/:id", updateById);
router.delete("/deleteById/:id", deleteById);


export default router;
