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
exports.SendVerificationSMS = exports.SendSms = void 0;
const axios_1 = __importDefault(require("axios"));
const SendSms = (mobile, otp) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let config = {
            method: "get",
            maxBodyLength: Infinity,
            url: `https://www.smsgatewayhub.com/api/mt/SendSMS?APIKey=L59wCvpzuEWiiRDYDNFxWQ&senderid=PLYBZR&channel=2&DCS=0&flashsms=0&number=91${mobile}&text=Your OTP for Registration/Login for PlywoodBazar is ${otp}&route=31&EntityId=1701168577184897884&dlttemplateid=1707171256091880039`,
            headers: {},
        };
        let { data: res } = yield (0, axios_1.default)(config);
        console.log(res, "=> SMS RESPONSE");
        if (res["ErrorCode"] == "000" && res["ErrorMessage"] == "Success") {
            return true;
        }
        return false;
    }
    catch (error) {
        console.log("SMS ERROR");
        return false;
    }
});
exports.SendSms = SendSms;
const SendVerificationSMS = (mobile, otp) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let config = {
            method: "get",
            maxBodyLength: Infinity,
            url: `https://www.smsgatewayhub.com/api/mt/SendSMS?APIKey=L59wCvpzuEWiiRDYDNFxWQ&senderid=PLYBZR&channel=2&DCS=0&flashsms=0&number=91${mobile}&text=${otp} is your phone number verification code for "Plywood Bazar.com".&route=31&EntityId=1701168577184897884&dlttemplateid=1707172526863185585`,
            headers: {},
        };
        let { data: res } = yield (0, axios_1.default)(config);
        console.log('==>', `https://www.smsgatewayhub.com/api/mt/SendSMS?APIKey=L59wCvpzuEWiiRDYDNFxWQ&senderid=PLYBZR&channel=2&DCS=0&flashsms=0&number=91${mobile}&text=${otp} is your phone number verification code for "Plywood Bazar.com".&route=31&EntityId=1701168577184897884&dlttemplateid=1707172526863185585`);
        console.log('==>', res);
        if (res["ErrorCode"] == "000" && res["ErrorMessage"] == "Success") {
            return true;
        }
        return false;
    }
    catch (error) {
        console.log("SMS ERROR");
        return false;
    }
});
exports.SendVerificationSMS = SendVerificationSMS;
