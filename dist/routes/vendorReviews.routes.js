"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const vendorReview_controller_1 = require("../controllers/vendorReview.controller");
const router = express_1.default.Router();
router.post("/", vendorReview_controller_1.addVendorReview);
router.get("/getReviewForVendors", vendorReview_controller_1.getVendorReview);
router.get("/getById/:id", vendorReview_controller_1.getById);
router.patch("/updateById/:id", vendorReview_controller_1.updateById);
router.delete("/deleteById/:id", vendorReview_controller_1.deleteById);
exports.default = router;
