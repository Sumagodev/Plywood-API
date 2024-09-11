import express from "express";
import { CreateWebsiteData, getWebsiteData } from "../controllers/websiteData.controller";

const router = express.Router();

router.post("/", CreateWebsiteData);
router.get("/", getWebsiteData);

export default router;
