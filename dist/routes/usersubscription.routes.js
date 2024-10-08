"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const usersubsctiption_controller_1 = require("../controllers/usersubsctiption.controller");
const router = express_1.default.Router();
router.post("/buySubscription", usersubsctiption_controller_1.buySubscription);
router.get("/", usersubsctiption_controller_1.getSubscription);
router.get("/getSubscriptionSubscribedbyUserId/:id", usersubsctiption_controller_1.getSubscriptionSubscribedbyUserId);
router.get("/getAllSubscriptionbyUserId", usersubsctiption_controller_1.getAllSubscriptionbyUserId);
router.get("/getByUserId/:id", usersubsctiption_controller_1.getById);
router.get("/sendMailById/:id", usersubsctiption_controller_1.sendMailById);
router.post("/phonepePaymentStatusCheck/:orderId", usersubsctiption_controller_1.phonepePaymentStatusCheck);
router.post("/initiateJuspayPayment", usersubsctiption_controller_1.phonepePaymentStatusCheck);
router.post("/handleJuspayResponse", usersubsctiption_controller_1.phonepePaymentStatusCheck);
exports.default = router;
