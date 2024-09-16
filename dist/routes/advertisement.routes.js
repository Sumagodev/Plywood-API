"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const advertisement_controller_1 = require("../controllers/advertisement.controller");
const router = express_1.default.Router();
router.post("/", advertisement_controller_1.addAdvertisementSubscription);
router.get("/", advertisement_controller_1.getAdvertisementSubscription);
router.get("/getForHomepage", advertisement_controller_1.getAdvertisementSubscriptionForHomepage);
router.get("/getById/:id", advertisement_controller_1.getById);
router.patch("/updateById/:id", advertisement_controller_1.updateById);
router.delete("/deleteById/:id", advertisement_controller_1.deleteById);
exports.default = router;
