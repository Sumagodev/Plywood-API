"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userRequirements_controller_1 = require("../controllers/userRequirements.controller");
const router = express_1.default.Router();
router.post("/addUserRequirement", userRequirements_controller_1.addUserRequirement);
router.get("/", userRequirements_controller_1.getUserRequirement);
router.get("/getById/:id", userRequirements_controller_1.getById);
router.delete("/deleteById/:id", userRequirements_controller_1.deleteById);
exports.default = router;
