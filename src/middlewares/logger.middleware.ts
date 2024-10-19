import express from 'express';
import winston from 'winston';
import 'winston-daily-rotate-file';
import moment from 'moment-timezone';
import fs from 'fs-extra';
import path from 'path';

// Define the log directory
const logDir = '/var/logs/plywood/';

// Create the log directory if it doesn't exist
fs.ensureDirSync(logDir);

// Create a transport for daily rotating logs
const transport = new winston.transports.DailyRotateFile({
    filename: path.join(logDir, 'access-%DATE%.log'), // Log file name pattern
    datePattern: 'YYYY-MM-DD', // Log file date pattern
    zippedArchive: true, // Compress rotated logs
    maxSize: '20m', // Max size for a log file before rotating
    maxFiles: '14d', // Keep logs for 14 days
    level: 'info', // Log level
});

// Create a logger instance
const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp({
            format: () => moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'), // Set IST format
        }),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level}] ${message}`;
        })
    ),
    transports: [
        transport,
        new winston.transports.Console(), // Optional: log to console as well
    ],
});

// Middleware function to log requests
const requestLogger = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const logMessage = `${req.method} ${req.url} - Body: ${JSON.stringify(req.body)}`;
    logger.info(logMessage);
    next();
};

export { requestLogger };
