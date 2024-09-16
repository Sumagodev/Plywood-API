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
exports.setUserAndUserObj = exports.authorizeJwt = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../helpers/config");
const user_model_1 = require("../models/user.model");
const authorizeJwt = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log(req.headers)
    const authorization = req.headers["authorization"];
    const token = authorization && authorization.split("Bearer ")[1];
    if (!token)
        return res.status(401).json({ message: "Invalid Token" });
    try {
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, config_1.CONFIG.JWT_ACCESS_TOKEN_SECRET);
        // Add user from payload
        req.user = decoded;
        if (req.user) {
            const userObj = yield user_model_1.User.findById(decoded.userId).exec();
            if (userObj) {
                req.user.userObj = userObj;
            }
        }
        next();
    }
    catch (e) {
        console.error(e);
        res.status(401).json({ message: "Token is not valid" });
    }
});
exports.authorizeJwt = authorizeJwt;
const setUserAndUserObj = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log(req.headers);
    const authorization = req.headers["authorization"];
    if (authorization) {
        const token = authorization && authorization.split("Bearer ")[1];
        if (token) {
            try {
                // Verify token
                const decoded = jsonwebtoken_1.default.verify(token, config_1.CONFIG.JWT_ACCESS_TOKEN_SECRET);
                // Add user from payload
                if (decoded) {
                    req.user = decoded;
                }
                if (req.user) {
                    req.user.userObj = yield user_model_1.User.findById(decoded.userId).exec();
                }
            }
            catch (e) {
                console.error(e);
                // return res.status(401).json({ message: "Invalid Token" });
            }
        }
    }
    next();
});
exports.setUserAndUserObj = setUserAndUserObj;
