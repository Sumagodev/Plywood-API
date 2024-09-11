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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postSpiCrmLead = void 0;
const axios_1 = __importDefault(require("axios"));
const USERNAME = "plywood1009877";
const PASSWORD = "14755";
const generateSpiCrmToken = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let config = {
            method: "get",
            url: `http://sipapi.kit19.com/Enquiry/TokenGuidOPR?UserName=${USERNAME}&Mode=Get`,
        };
        let { data: res } = yield axios_1.default.request(config);
        console.log(res, "SPICRMLEAD TOKEN =>");
        if ((res === null || res === void 0 ? void 0 : res.Status) && (res === null || res === void 0 ? void 0 : res.Status) == 1 && (res === null || res === void 0 ? void 0 : res.Details) != "") {
            return res === null || res === void 0 ? void 0 : res.Details;
        }
        return "";
    }
    catch (error) {
        console.error(error);
        return "";
    }
});
const postSpiCrmLead = (obj) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let data = {
            Username: USERNAME,
            Password: PASSWORD,
            SourceName: "app",
        };
        if (obj.PersonName) {
            data.PersonName = obj.PersonName;
        }
        if (obj.CompanyName) {
            data.PersonName = obj.CompanyName;
        }
        if (obj.SourceName) {
            data.SourceName = obj.SourceName;
        }
        if (obj.CompanyName) {
            data.CompanyName = obj.CompanyName;
        }
        if (obj.MobileNo) {
            data.MobileNo = obj.MobileNo;
            data.CountryCode = "+91";
        }
        if (obj.EmailID) {
            data.EmailID = obj.EmailID;
        }
        if (obj.City) {
            data.City = obj.City;
        }
        if (obj.State) {
            data.State = obj.State;
        }
        if (obj.PinCode) {
            data.PinCode = obj.PinCode;
        }
        if (obj.ResidentialAddress) {
            data.ResidentialAddress = obj.ResidentialAddress;
        }
        if (obj.SourceName) {
            data.SourceName = obj.SourceName;
        }
        if (obj.MediumName) {
            data.MediumName = obj.MediumName;
        }
        if (obj.CampaignName) {
            data.CampaignName = obj.CampaignName;
        }
        if (obj.InitialRemarks) {
            data.InitialRemarks = obj.InitialRemarks;
        }
        console.log(data, "datadatadata");
        let token = yield generateSpiCrmToken();
        console.log(token, "SPICRMLEAD token =>");
        if (!token) {
            return false;
        }
        let config = {
            method: "post",
            maxBodyLength: Infinity,
            url: `http://sipapi.kit19.com/Enquiry/${token}/AddEnquiryAPI`,
            headers: {
                "Content-Type": "application/json",
            },
            data: JSON.stringify(data),
        };
        let { data: res } = yield axios_1.default.request(config);
        console.log(res, "SPICRMLEAD =>");
        if ((res === null || res === void 0 ? void 0 : res.Status) && (res === null || res === void 0 ? void 0 : res.Status) == 0 && (res === null || res === void 0 ? void 0 : res.Message) == "Success") {
            return res === null || res === void 0 ? void 0 : res.Details;
        }
        return true;
    }
    catch (error) {
        console.error(error);
        return false;
    }
});
exports.postSpiCrmLead = postSpiCrmLead;
