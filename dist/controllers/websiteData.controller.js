"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWebsiteData = exports.CreateWebsiteData = void 0;
const fileSystem_1 = require("../helpers/fileSystem");
const websitedata_model_1 = require("../models/websitedata.model");
const CreateWebsiteData = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let existsCheck = yield websitedata_model_1.WebsiteData.findOne({}).exec();
        if (existsCheck) {
            if (req.body.image && req.body.image.includes("base64")) {
                let temp = yield (0, fileSystem_1.storeFileAndReturnNameBase64)(req.body.image);
                yield websitedata_model_1.WebsiteData.findOneAndUpdate({}, { shopImage: temp }).exec();
                res.status(200).json({ message: "Updated", success: true });
            }
        }
        else {
            if (req.body.image && req.body.image.includes("base64")) {
                let temp = yield (0, fileSystem_1.storeFileAndReturnNameBase64)(req.body.image);
                yield new websitedata_model_1.WebsiteData({ shopImage: temp }).save();
                res.status(200).json({ message: "Added", success: true });
            }
        }
    }
    catch (err) {
        next(err);
    }
});
exports.CreateWebsiteData = CreateWebsiteData;
const getWebsiteData = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let websiteDataObj = yield websitedata_model_1.WebsiteData.findOne({}).exec();
        console.log(websiteDataObj, "websiteDataObj");
        res.status(200).json({ message: "getUserTicket", data: websiteDataObj, success: true });
        // res.status(200).json({ message: "getUserTicket", data: UserTicketArr, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getWebsiteData = getWebsiteData;
