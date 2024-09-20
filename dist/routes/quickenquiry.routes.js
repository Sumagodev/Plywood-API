"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const quickenqury_controller_1 = require("../controllers/quickenqury.controller");
const router = express_1.default.Router();
router.post("/addquickenquiry", quickenqury_controller_1.addquickenquiry);
router.get("/", quickenqury_controller_1.getquickenquiry);
router.get("/getById/:id", quickenqury_controller_1.getById);
router.delete("/deleteById/:id", quickenqury_controller_1.deleteById);
exports.default = router;
