"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Blog_controller_1 = require("../controllers/Blog.controller");
const router = express_1.default.Router();
router.post("/", Blog_controller_1.addBlogs);
router.get("/", Blog_controller_1.getBlogs);
router.get("/getById/:id", Blog_controller_1.getById);
router.patch("/updateById/:id", Blog_controller_1.updateById);
router.delete("/deleteById/:id", Blog_controller_1.deleteById);
exports.default = router;
