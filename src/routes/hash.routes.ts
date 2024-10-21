import express from "express";
import { createFilesHashes } from "../controllers/hash.controller";

const router = express.Router();

router.post("/create", createFilesHashes);

export default router;
