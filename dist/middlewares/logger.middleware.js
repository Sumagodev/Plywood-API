"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
const winston_1 = __importDefault(require("winston"));
require("winston-daily-rotate-file");
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
// Define the log directory
const logDir = '/var/logs/plywood/';
// Create the log directory if it doesn't exist
fs_extra_1.default.ensureDirSync(logDir);
// Create a transport for daily rotating logs
const transport = new winston_1.default.transports.DailyRotateFile({
    filename: path_1.default.join(logDir, 'access-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level: 'info', // Log level
});
// Create a logger instance
const logger = winston_1.default.createLogger({
    format: winston_1.default.format.combine(winston_1.default.format.timestamp({
        format: () => (0, moment_timezone_1.default)().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'), // Set IST format
    }), winston_1.default.format.printf(({ timestamp, level, message }) => {
        return `${timestamp} [${level}] ${message}`;
    })),
    transports: [
        transport,
        new winston_1.default.transports.Console(), // Optional: log to console as well
    ],
});
// Middleware function to log requests
const requestLogger = (req, res, next) => {
    const logMessage = `${req.method} ${req.url} - Body: ${JSON.stringify(req.body)}`;
    logger.info(logMessage);
    next();
};
exports.requestLogger = requestLogger;
