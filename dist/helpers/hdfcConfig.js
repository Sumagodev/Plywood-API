"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.juspayConfig = exports.hdfcConfig = void 0;
const expresscheckout_nodejs_1 = require("expresscheckout-nodejs");
const fs = __importStar(require("fs"));
// Import JSON config file
const config_json_1 = __importDefault(require("../config.json"));
require("dotenv/config");
// Type assertion for config to ensure it matches our interface
const typedConfig = config_json_1.default;
// Read public and private keys from file system
const publicKey = fs.readFileSync(typedConfig.PUBLIC_KEY_PATH, 'utf8');
const privateKey = fs.readFileSync(typedConfig.PRIVATE_KEY_PATH, 'utf8');
// Use the PAYMENT_PAGE_CLIENT_ID for your operations
const paymentPageClientId = typedConfig.PAYMENT_PAGE_CLIENT_ID;
const SANDBOX_BASE_URL = process.env.SANDBOX_BASE_URL;
const PRODUCTION_BASE_URL = process.env.PRODUCTION_BASE_URL;
// Example instantiation of Juspay
const myJuspayConfig = new expresscheckout_nodejs_1.Juspay({
    merchantId: typedConfig.MERCHANT_ID,
    baseUrl: SANDBOX_BASE_URL,
    jweAuth: {
        keyId: typedConfig.KEY_UUID,
        publicKey,
        privateKey
    }
});
exports.hdfcConfig = typedConfig;
exports.juspayConfig = myJuspayConfig; // Exporting the Juspay instance
