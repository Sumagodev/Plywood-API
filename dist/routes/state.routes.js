"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const state_controller_1 = require("../controllers/state.controller");
const router = express_1.default.Router();
router.post("/", state_controller_1.addState);
router.get("/", state_controller_1.getState);
router.get("/getById/:id", state_controller_1.getById);
router.patch("/updateById/:id", state_controller_1.updateById);
router.delete("/deleteById/:id", state_controller_1.deleteById);
exports.default = router;
