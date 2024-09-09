"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const flashSale_controller_1 = require("../controllers/flashSale.controller");
const router = express_1.default.Router();
router.post("/", flashSale_controller_1.addFlashSale);
router.get("/getFlashSalesByUserId/:id", flashSale_controller_1.getFlashSale);
router.get("/getFlashSales", flashSale_controller_1.getAllFlashSales);
router.get("/getById/:id", flashSale_controller_1.getById);
router.patch("/updateById/:id", flashSale_controller_1.updateById);
router.delete("/deleteById/:id", flashSale_controller_1.deleteById);
exports.default = router;
