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
exports.adminSeeder = void 0;
const bcrypt_1 = require("../helpers/bcrypt");
const constant_1 = require("../helpers/constant");
const user_model_1 = require("../models/user.model");
const adminSeeder = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const encryptedPassword = yield (0, bcrypt_1.encryptPassword)("admin@1234");
        const adminExist = yield user_model_1.User.findOne({ role: constant_1.ROLES.ADMIN }).exec();
        if (adminExist) {
            console.log("EXISTING ADMIN", adminExist.email);
            return "Admin already exists";
        }
        console.log("CREATEING user");
        yield new user_model_1.User({
            name: "Admin",
            email: "admin@admin.com",
            password: encryptedPassword,
            role: constant_1.ROLES.ADMIN,
            approved: true,
        }).save();
    }
    catch (error) {
        console.error(error);
    }
});
exports.adminSeeder = adminSeeder;
