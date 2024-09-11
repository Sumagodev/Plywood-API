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
exports.sendMail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const smtp_transport_1 = __importDefault(require("nodemailer/lib/smtp-transport"));
const url = process.env.FRONTEND_BASE_URL;
// const fs = require('fs')
const sendMail = (email, message) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(email);
        // create reusable transporter object using the default SMTP transport
        // let emailSettingsObj = await EmailSettings.findOne().exec()
        // send mail with defined transport object
        let transporterObj = nodemailer_1.default.createTransport(new smtp_transport_1.default({
            host: 'smtp.gmail.com',
            port: 465,
            secure: false,
            logger: true,
            debug: true,
            ignoreTLS: true,
            auth: {
                user: "seniorab404@gmail.com",
                pass: "zjegdeypusvdbjen",
            },
        }));
        console.log(transporterObj);
        const transporter = nodemailer_1.default.createTransport(transporterObj);
        // console.log(transporter, "transporter")
        let obj = {
            from: 'seniorab404@gmail.com',
            to: email,
            subject: "You have recieved otp to login to PlywoodBazar",
            text: `Your otp is ${message}`, // plain text body
            // html: `LinkedIn account is not logged in please login now <a href="${linkedLoginUrl}">${linkedLoginUrl}</a>`, // plain text body
        };
        console.log(obj, "ASDF");
        let temp = yield transporter.sendMail(obj, function (error, info) {
            if (error) {
                console.log(error, "err");
            }
            else {
                console.log('Email sent: ' + info.response);
            }
        });
        ;
        console.log(temp);
        return true;
    }
    catch (error) {
        console.error(error);
        return false;
    }
});
exports.sendMail = sendMail;
