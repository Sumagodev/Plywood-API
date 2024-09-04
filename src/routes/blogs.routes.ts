import express from "express";
import {
  addBlogs,
  deleteById,
  getBlogs,
  getById,
  updateById
} from "../controllers/Blog.controller";

const router = express.Router();

router.post("/", addBlogs);
router.get("/", getBlogs);
router.get("/getById/:id", getById);
router.patch("/updateById/:id", updateById);
router.delete("/deleteById/:id", deleteById);


export default router;
