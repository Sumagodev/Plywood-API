"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const category_controller_1 = require("../controllers/category.controller");
const router = express_1.default.Router();
router.post("/addCategory", category_controller_1.addCategory);
router.get("/getCategory", category_controller_1.getCategory);
router.get("/getChildCategory", category_controller_1.getCategory);
router.get("/getById/:id", category_controller_1.getById);
router.get("/getNameBySlug/:id", category_controller_1.getNameBySlug);
router.patch("/updateById/:id", category_controller_1.updateById);
router.delete("/deleteById/:id", category_controller_1.deleteById);
router.get("/getNestedCategories", category_controller_1.getNestedCategory);
exports.default = router;
