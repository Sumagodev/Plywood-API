"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const productReview_controller_1 = require("../controllers/productReview.controller");
const router = express_1.default.Router();
router.post("/", productReview_controller_1.addProductReview);
router.get("/getReviewForProduct", productReview_controller_1.getProductReview);
router.get("/getById/:id", productReview_controller_1.getById);
router.patch("/updateById/:id", productReview_controller_1.updateById);
router.delete("/deleteById/:id", productReview_controller_1.deleteById);
exports.default = router;
