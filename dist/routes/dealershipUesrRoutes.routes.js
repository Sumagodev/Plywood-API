"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const applyfordealership_controller_1 = require("../controllers/applyfordealership.controller");
const router = express_1.default.Router();
router.post('/applyForDealershipOpportunitiy', applyfordealership_controller_1.createApplication);
router.get('/getapplyForDealershipOpportunitiy', applyfordealership_controller_1.getApplications); // You can pass dealershipOwnerId or userId as query parameters
router.get('/applications/:id', applyfordealership_controller_1.getApplicationById);
router.put('/applications/:id', applyfordealership_controller_1.updateApplication);
router.delete('/applications/:id', applyfordealership_controller_1.deleteApplication);
router.get("/getApplicationsByOwnerId/:id", applyfordealership_controller_1.getDealershipApplicationByOwnerId);
exports.default = router;
