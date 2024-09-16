"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const BlogVideo_controller_1 = require("../controllers/BlogVideo.controller");
const router = express_1.default.Router();
router.post("/", BlogVideo_controller_1.addBlogVideo);
router.get("/", BlogVideo_controller_1.getBlogVideo);
router.get("/getById/:id", BlogVideo_controller_1.getById);
router.patch("/updateById/:id", BlogVideo_controller_1.updateById);
router.delete("/deleteById/:id", BlogVideo_controller_1.deleteById);
exports.default = router;
