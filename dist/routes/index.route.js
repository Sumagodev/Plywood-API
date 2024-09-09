"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const index_contoller_1 = require("../controllers/index.contoller");
const router = express_1.default.Router();
router.get("/", index_contoller_1.indexGet);
exports.default = router;
