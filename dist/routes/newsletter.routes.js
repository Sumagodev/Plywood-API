"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const newsletter_controller_1 = require("../controllers/newsletter.controller");
const router = express_1.default.Router();
router.post("/", newsletter_controller_1.addNewsLetter);
router.get("/", newsletter_controller_1.getAllNewsLetter);
router.delete("/deleteNewsLetterById", newsletter_controller_1.deleteNewsLetterById);
exports.default = router;
