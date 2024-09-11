import express from "express";
import { CreateTicket, getById, getUserTicket } from "../controllers/userTickets.controller";

const router = express.Router();

router.post("/", CreateTicket);
router.get("/", getUserTicket);
router.get("/getByUserId/:id", getById);
router.delete("/deleteTicketById/:id", getById);


export default router;
