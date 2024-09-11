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
exports.checkStatusPhonePaymentOrder = exports.createPhonePaymentOrder = void 0;
const uuid_1 = require("uuid");
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
const createPhonePaymentOrder = (options) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        let obj = {
            "merchantId": `${process.env.PHONEPE_MERCHANT_ID}`,
            "merchantUserId": (0, uuid_1.v4)().replace(/-/g, ""),
            "merchantTransactionId": `${options.orderId}`,
            "amount": options === null || options === void 0 ? void 0 : options.amount,
            "redirectUrl": options === null || options === void 0 ? void 0 : options.successUrl,
            "callbackUrl": options === null || options === void 0 ? void 0 : options.successUrl,
            "redirectMode": "POST",
            "mobileNumber": options.mobile,
            "paymentInstrument": {
                "type": "PAY_PAGE"
            }
        };
        console.log(obj, "objobj");
        let objJsonStr = JSON.stringify(obj);
        // console.log(objJsonStr, "objJsonStrobjJsonStr")
        let objJsonB64 = Buffer.from(objJsonStr).toString("base64");
        let hashStr = objJsonB64 + '/pg/v1/pay' + process.env.PHONEPE_SALT;
        console.log(hashStr, "objJsonB64objJsonB64objJsonB64objJsonB64objJsonB64");
        let hash = crypto_1.default.createHash('SHA256').update(hashStr).digest('hex');
        const phonepeRHeader = {
            headers: { accept: 'application/json', 'Content-Type': 'application/json', 'X-VERIFY': hash + '###1' },
        };
        // console.log(phonepeRHeader, "phonepeRHeaderphonepeRHeaderphonepeRHeaderphonepeRHeaderphonepeRHeader")
        // let orderObj = await axios.post(process.env.PHONEPE_PROD_URL+'/pg/v1/pay',{
        //   request:objJsonB64
        // },phonepeRHeader);
        let data = JSON.stringify({
            "request": objJsonB64
        });
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: process.env.PHONEPE_PROD_URL + '/pg/v1/pay',
            headers: {
                'X-VERIFY': hash + '###1',
                'Content-Type': 'application/json'
            },
            data: data
        };
        console.log(config);
        const orderObj = yield axios_1.default.request(config);
        return { sucess: true, data: (_a = orderObj === null || orderObj === void 0 ? void 0 : orderObj.data) === null || _a === void 0 ? void 0 : _a.data };
    }
    catch (error) {
        console.error(error);
        console.log((_b = error === null || error === void 0 ? void 0 : error.response) === null || _b === void 0 ? void 0 : _b.data, "safsdfdfsdfsd");
        return { sucess: false, data: (_c = error === null || error === void 0 ? void 0 : error.response) === null || _c === void 0 ? void 0 : _c.data };
    }
});
exports.createPhonePaymentOrder = createPhonePaymentOrder;
const checkStatusPhonePaymentOrder = (options) => __awaiter(void 0, void 0, void 0, function* () {
    var _d, _e, _f, _g;
    try {
        let merchantId = options === null || options === void 0 ? void 0 : options.merchantId;
        let merchantTransactionId = options === null || options === void 0 ? void 0 : options.merchantTransactionId;
        console.log(options, "optionsoptionsoptions");
        if (!merchantId || !merchantTransactionId) {
            return { sucess: false, data: {} };
        }
        let hashStr = '/pg/v1/status/' + merchantId + '/' + merchantTransactionId + process.env.PHONEPE_SALT;
        console.log(hashStr, "hashStrhashStrhashStr");
        let hash = crypto_1.default.createHash('SHA256').update(hashStr).digest('hex');
        const phonepeRHeader = {
            headers: { accept: 'application/json', 'Content-Type': 'application/json', 'X-VERIFY': hash + '###1', 'X-MERCHANT-ID': process.env.PHONEPE_MERCHANT_ID },
        };
        console.log(phonepeRHeader, "phonepeRHeaderphonepeRHeaderphonepeRHeaderphonepeRHeaderphonepeRHeader");
        // let orderObj = await axios.post(process.env.PHONEPE_PROD_URL+'/pg/v1/pay',{
        //   request:objJsonB64
        // },phonepeRHeader);
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: process.env.PHONEPE_PROD_URL + '/pg/v1/status/' + merchantId + '/' + merchantTransactionId,
            headers: {
                'X-VERIFY': hash + '###1',
                'X-MERCHANT-ID': process.env.PHONEPE_MERCHANT_ID
            },
        };
        console.log(config);
        const orderObj = yield axios_1.default.request(config);
        if ((orderObj === null || orderObj === void 0 ? void 0 : orderObj.data) && ((_d = orderObj === null || orderObj === void 0 ? void 0 : orderObj.data) === null || _d === void 0 ? void 0 : _d.code) == 'PAYMENT_SUCCESS') {
            return { sucess: true, data: (_e = orderObj === null || orderObj === void 0 ? void 0 : orderObj.data) === null || _e === void 0 ? void 0 : _e.data, message: 'Your payment is successful' };
        }
        else {
            return { sucess: false, data: {}, message: "Please Contact to Admin for payment is failed" };
        }
    }
    catch (error) {
        console.error(error);
        console.log((_f = error === null || error === void 0 ? void 0 : error.response) === null || _f === void 0 ? void 0 : _f.data, "safsdfdfsdfsd");
        return { sucess: false, data: (_g = error === null || error === void 0 ? void 0 : error.response) === null || _g === void 0 ? void 0 : _g.data };
    }
});
exports.checkStatusPhonePaymentOrder = checkStatusPhonePaymentOrder;
