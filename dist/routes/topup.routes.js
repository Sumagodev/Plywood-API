"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const topup_controller_1 = require("../controllers/topup.controller");
const router = express_1.default.Router();
router.post("/", topup_controller_1.addTopup);
router.get("/", topup_controller_1.getTopup);
router.get("/getTopupWithApi", topup_controller_1.getTopupWithSubscriberCountApi);
router.get("/getById/:id", topup_controller_1.getById);
router.patch("/updateById/:id", topup_controller_1.updateById);
router.delete("/deleteById/:id", topup_controller_1.deleteById);
exports.default = router;
