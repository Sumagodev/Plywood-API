"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const verifiedUsers_controller_1 = require("../controllers/verifiedUsers.controller");
const router = express_1.default.Router();
router.post("/addquickenquiry", verifiedUsers_controller_1.addVerifiedUser);
router.get("/getVerifiedUser", verifiedUsers_controller_1.getVerifiedUser);
router.get("/getById/:id", verifiedUsers_controller_1.getById);
router.delete("/deleteById/:id", verifiedUsers_controller_1.deleteById);
exports.default = router;
