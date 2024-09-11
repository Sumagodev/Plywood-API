import express from "express";
import { indexGet } from "../controllers/index.contoller";

const router = express.Router();

router.get("/", indexGet);

export default router;
