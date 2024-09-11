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
exports.SendBrevoMail = void 0;
const axios = require('axios');
const SendBrevoMail = (subject, to, htmlContent) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let data = JSON.stringify({
            sender: {
                "name": "Touch925",
                "email": "yogesh@ebslon.com"
            },
            to,
            subject,
            htmlContent
        });
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://api.brevo.com/v3/smtp/email',
            headers: {
                'accept': 'application/json',
                'api-key': `${process.env.BREVO_API_KEY}`,
                'content-type': 'application/json'
            },
            data: data
        };
        let { data: res } = yield axios(config);
        console.log(res, "ResposenFrom Brevo");
        if (res.messageId) {
            return true;
        }
    }
    catch (error) {
        console.log("BREVAMAIL => ", error);
        return false;
    }
});
exports.SendBrevoMail = SendBrevoMail;
