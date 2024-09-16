"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const lead_controller_1 = require("../controllers/lead.controller");
// import {
//   addSubscription,
//   deleteById,
//   getById,
//   getSubscription,
//   updateById,
// } from "../controllers/subsctiption.controller";
const router = express_1.default.Router();
router.post("/", lead_controller_1.addLead);
router.get("/", lead_controller_1.getLead);
router.get("/getLeadsForAdmin", lead_controller_1.getLeadsForAdmin);
router.get("/getLeadsBycreatedById/:id", lead_controller_1.getLeadsBycreatedById);
router.get("/getById/:id", lead_controller_1.getById);
router.patch("/updateById/:id", lead_controller_1.updateById);
router.delete("/deleteById/:id", lead_controller_1.deleteById);
exports.default = router;
