"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const payments_controller_1 = require("../controllers/payments.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
router.post("/handleHdfcWebhook", payments_controller_1.handleHdfcWebhook);
router.post("/verifyPayment", auth_middleware_1.authorizeJwt, payments_controller_1.verifyPayment);
exports.default = router;
