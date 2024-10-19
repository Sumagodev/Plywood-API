"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const morgan_1 = __importDefault(require("morgan"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const moment_timezone_1 = __importDefault(require("moment-timezone"));
// Define the log directory and log file
const logDir = '/var/logs/plywood/';
const logFile = path_1.default.join(logDir, 'access.log');
// Create the log directory if it doesn't exist
fs_extra_1.default.ensureDirSync(logDir);
// Create a write stream for the log file
const accessLogStream = fs_extra_1.default.createWriteStream(logFile, { flags: 'a' });
// Custom token to format date in IST
morgan_1.default.token('date', function () {
    return (0, moment_timezone_1.default)().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
});
const loggerX = (0, morgan_1.default)(':date :method :url :status :res[content-length] - :response-time ms - Body: :req[body]', {
    stream: accessLogStream,
});
exports.default = loggerX;
