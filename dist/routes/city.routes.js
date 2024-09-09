"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const city_controller_1 = require("../controllers/city.controller");
const router = express_1.default.Router();
router.post("/", city_controller_1.addCity);
router.get("/", city_controller_1.getCity);
router.get("/getById/:id", city_controller_1.getById);
router.patch("/updateById/:id", city_controller_1.updateById);
router.post("/importCities", city_controller_1.importCities);
router.delete("/deleteById/:id", city_controller_1.deleteById);
exports.default = router;
