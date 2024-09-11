import express from "express";
import { CreateHomepageBanners, UpdateHomepageBanners, deleteById, getHomepageBanners, getById } from "../controllers/homepageBanners.controller";


const router = express.Router();

router.post("/", CreateHomepageBanners);
router.get("/getHomePageBanners", getHomepageBanners);
router.get("/getById/:id", getById);
router.patch("/updateById/:id", UpdateHomepageBanners);
router.delete("/deleteById/:id", deleteById);


export default router;
