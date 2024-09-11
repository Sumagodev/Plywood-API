"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const websiteData_controller_1 = require("../controllers/websiteData.controller");
const router = express_1.default.Router();
router.post("/", websiteData_controller_1.CreateWebsiteData);
router.get("/", websiteData_controller_1.getWebsiteData);
exports.default = router;
