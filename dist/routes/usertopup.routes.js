"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userTopup_controller_1 = require("../controllers/userTopup.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
router.post("/buyTopup", auth_middleware_1.authorizeJwt, userTopup_controller_1.buyTopup);
router.post("/phonepePaymentStatusCheck/:orderId", userTopup_controller_1.phonepePaymentTopUpStatusCheck);
router.get("/", userTopup_controller_1.getTopup);
router.get("/getTopupSubscribedbyUserId/:id", userTopup_controller_1.getTopupSubscribedbyUserId);
router.get("/getAllTopupbyUserId", userTopup_controller_1.getAllTopupbyUserId);
router.get("/getByUserId/:id", userTopup_controller_1.getById);
router.post("/initiateJuspayPaymentForTopup", auth_middleware_1.authorizeJwt, userTopup_controller_1.initiateJuspayPaymentForTopup);
router.post("/handleJuspayPaymentForTopup", userTopup_controller_1.handleJuspayPaymentForTopup);
exports.default = router;
