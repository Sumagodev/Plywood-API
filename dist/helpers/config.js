"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONFIG = void 0;
require("dotenv/config");
exports.CONFIG = {
    MONGOURI: process.env.MONGOURI ? process.env.MONGOURI : "",
    PORT: process.env.PORT ? process.env.PORT : 3000,
    JWT_ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_TOKEN_SECRET ? process.env.JWT_ACCESS_TOKEN_SECRET : "qwertyuiop",
    JWT_ACCESS_REFRESH_TOKEN_SECRET: process.env.JWT_ACCESS_REFRESH_TOKEN_SECRET ? process.env.JWT_ACCESS_REFRESH_TOKEN_SECRET : "qwertyuiopitkgkg",
};
