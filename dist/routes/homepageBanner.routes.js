"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const homepageBanners_controller_1 = require("../controllers/homepageBanners.controller");
const router = express_1.default.Router();
router.post("/", homepageBanners_controller_1.CreateHomepageBanners);
router.get("/getHomePageBanners", homepageBanners_controller_1.getHomepageBanners);
router.get("/getById/:id", homepageBanners_controller_1.getById);
router.patch("/updateById/:id", homepageBanners_controller_1.UpdateHomepageBanners);
router.delete("/deleteById/:id", homepageBanners_controller_1.deleteById);
exports.default = router;
