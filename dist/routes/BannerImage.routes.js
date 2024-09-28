"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const BannerImage_controller_1 = require("../controllers/BannerImage.controller");
const router = express_1.default.Router();
// Routes for banner images
router.post("/postbanner", BannerImage_controller_1.createBannerImage); // Create a banner image
router.get("/getbanner", BannerImage_controller_1.getAllBannerImages); // Get all banner images
router.get("/getbannerby/:id", BannerImage_controller_1.getBannerImageById); // Get a banner image by ID
router.put("/updatebanner/:id", BannerImage_controller_1.updateBannerImage); // Update a banner image by ID
router.delete("/deletebanner/:id", BannerImage_controller_1.deleteBannerImage); // Delete a banner image by ID
exports.default = router;
