"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const StateDetail_controller_1 = require("../controllers/StateDetail.controller");
const router = express_1.default.Router();
router.post("/stateDetail", StateDetail_controller_1.addStateDetail);
router.get("/stateDetail/:id", StateDetail_controller_1.getStateDetail);
router.put("/stateDetail/:id", StateDetail_controller_1.updateStateDetail);
router.delete("/stateDetail/:id", StateDetail_controller_1.deleteStateDetail);
router.get("/stateDetails", StateDetail_controller_1.getAllStateDetails);
exports.default = router;
