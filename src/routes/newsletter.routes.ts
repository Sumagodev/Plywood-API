import express from "express";
import { addNewsLetter, deleteNewsLetterById, getAllNewsLetter } from "../controllers/newsletter.controller";


const router = express.Router();



router.post("/", addNewsLetter);
router.get("/", getAllNewsLetter);
router.delete("/deleteNewsLetterById", deleteNewsLetterById);



export default router;