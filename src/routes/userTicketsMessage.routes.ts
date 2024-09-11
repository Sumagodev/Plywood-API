import express from "express";
import { CreateTicketMessage, getUserTicketMessages } from "../controllers/userTicketsMessage.controller";

const router = express.Router();

router.post("/", CreateTicketMessage);
router.get("/getTicketMessage/:id", getUserTicketMessages);


export default router;
