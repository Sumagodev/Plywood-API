"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userTickets_controller_1 = require("../controllers/userTickets.controller");
const router = express_1.default.Router();
router.post("/", userTickets_controller_1.CreateTicket);
router.get("/", userTickets_controller_1.getUserTicket);
router.get("/getByUserId/:id", userTickets_controller_1.getById);
router.delete("/deleteTicketById/:id", userTickets_controller_1.getById);
exports.default = router;
