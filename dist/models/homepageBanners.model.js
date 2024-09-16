"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomepageBanners = void 0;
const mongoose_1 = require("mongoose");
const homepageBanners = new mongoose_1.Schema({
    image: String,
}, { timestamps: true });
exports.HomepageBanners = (0, mongoose_1.model)("homepageBanners", homepageBanners);
