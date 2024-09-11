"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const brand_controller_1 = require("../controllers/brand.controller");
const router = express_1.default.Router();
router.post("/", brand_controller_1.addBrand);
router.get("/", brand_controller_1.getBrand);
router.get("/getById/:id", brand_controller_1.getById);
router.patch("/updateById/:id", brand_controller_1.updateById);
router.delete("/deleteById/:id", brand_controller_1.deleteById);
exports.default = router;
