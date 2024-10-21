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
exports.createFilesHashes = void 0;
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const createFilesHashes = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { filePaths } = req.body;
        if (!Array.isArray(filePaths) || filePaths.length === 0) {
            return res.status(400).json({ error: 'Please provide a list of file paths.' });
        }
        const result = [];
        for (const filePath of filePaths) {
            try {
                const fullPath = path_1.default.resolve(filePath);
                if (!fs_1.default.existsSync(fullPath)) {
                    result.push({ filePath, error: 'File does not exist' });
                    continue;
                }
                const hash = yield generateFileHash(fullPath);
                result.push({ filePath, hash });
                // Save each hash to a separate file
                saveHashToFile(fullPath, hash);
            }
            catch (error) {
                result.push({ filePath, error: error.message });
            }
        }
        return res.json(result);
    }
    catch (err) {
        next(err);
    }
});
exports.createFilesHashes = createFilesHashes;
// Function to generate SHA-256 hash of a file
const generateFileHash = (filePath) => {
    return new Promise((resolve, reject) => {
        const hash = crypto_1.default.createHash('sha256');
        const stream = fs_1.default.createReadStream(filePath);
        stream.on('data', (data) => hash.update(data));
        stream.on('end', () => resolve(hash.digest('hex')));
        stream.on('error', (err) => reject(err));
    });
};
// Function to save hash in a separate log file for each file
const saveHashToFile = (filePath, hash) => {
    const logDir = '/var/logs/plywood';
    // Create filename from the original file's name and timestamp
    const fileName = path_1.default.basename(filePath);
    const logFileName = `${fileName}_${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
    const logFilePath = path_1.default.join(logDir, logFileName);
    const logContent = `Date: ${new Date().toISOString()}\nFilename: ${filePath}\nHash: ${hash}\n`;
    // Write log content to a new file
    fs_1.default.writeFile(logFilePath, logContent, (err) => {
        if (err) {
            console.error(`Error writing to log file ${logFileName}:`, err);
        }
        else {
            console.log(`Hash saved to ${logFilePath}`);
        }
    });
};
