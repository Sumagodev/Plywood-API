"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userTicketsMessage_controller_1 = require("../controllers/userTicketsMessage.controller");
const router = express_1.default.Router();
router.post("/", userTicketsMessage_controller_1.CreateTicketMessage);
router.get("/getTicketMessage/:id", userTicketsMessage_controller_1.getUserTicketMessages);
exports.default = router;
