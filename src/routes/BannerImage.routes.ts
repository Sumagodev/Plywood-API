import express from "express";
import {
  createBannerImage
} from "../controllers/BannerImage.controller";

const router = express.Router();

router.post("/", createBannerImage);


export default router;