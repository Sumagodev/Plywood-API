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
exports.fcmMulticastNotify = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const plywoodbazar_86c65_firebase_adminsdk_tvcb6_43ef393b0d_json_1 = __importDefault(require("./plywoodbazar-86c65-firebase-adminsdk-tvcb6-43ef393b0d.json"));
// var serviceAccount = require('./plywoodbazar-86c65-firebase-adminsdk-tvcb6-43ef393b0d.json')
firebase_admin_1.default.initializeApp({
    credential: firebase_admin_1.default.credential.cert(plywoodbazar_86c65_firebase_adminsdk_tvcb6_43ef393b0d_json_1.default),
});
const fcmMulticastNotify = (notificationObj) => __awaiter(void 0, void 0, void 0, function* () {
    //notificationData is an object with 2 parameters title and content
    console.log(notificationObj, "NOTIFICATION OBJ");
    if (notificationObj) {
        if (notificationObj.tokens.length) {
            notificationObj.android = { priority: "high" };
            const val = yield firebase_admin_1.default.messaging().sendEachForMulticast(notificationObj);
            console.log(val, "val2");
            return val;
        }
    }
    return 0;
});
exports.fcmMulticastNotify = fcmMulticastNotify;
