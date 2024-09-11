"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const country_controller_1 = require("../controllers/country.controller");
const router = express_1.default.Router();
router.post("/", country_controller_1.addCountry);
router.get("/", country_controller_1.getCountry);
router.get("/getById/:id", country_controller_1.getById);
router.patch("/updateById/:id", country_controller_1.updateById);
router.delete("/deleteById/:id", country_controller_1.deleteById);
exports.default = router;
