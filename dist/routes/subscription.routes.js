"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const subsctiption_controller_1 = require("../controllers/subsctiption.controller");
const router = express_1.default.Router();
router.post("/", subsctiption_controller_1.addSubscription);
router.get("/", subsctiption_controller_1.getSubscription);
router.get("/getSubscriptionWithSubscriberCountApi", subsctiption_controller_1.getSubscriptionWithSubscriberCountApi);
router.get("/getById/:id", subsctiption_controller_1.getById);
router.patch("/updateById/:id", subsctiption_controller_1.updateById);
router.delete("/deleteById/:id", subsctiption_controller_1.deleteById);
exports.default = router;
