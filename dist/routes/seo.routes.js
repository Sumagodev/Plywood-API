"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Seo_controller_1 = require("../controllers/Seo.controller");
const router = express_1.default.Router();
router.post("/", Seo_controller_1.addSeo);
router.get("/", Seo_controller_1.getSeo);
router.get("/getById/:id", Seo_controller_1.getById);
router.patch("/updateById/:id", Seo_controller_1.updateById);
router.delete("/deleteById/:id", Seo_controller_1.deleteById);
exports.default = router;
