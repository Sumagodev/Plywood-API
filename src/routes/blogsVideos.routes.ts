import express from "express";
import {
  addBlogVideo,
  deleteById,
  getBlogVideo,
  getById,
  updateById
} from "../controllers/BlogVideo.controller";

const router = express.Router();

router.post("/", addBlogVideo);
router.get("/", getBlogVideo);
router.get("/getById/:id", getById);
router.patch("/updateById/:id", updateById);
router.delete("/deleteById/:id", deleteById);


export default router;
