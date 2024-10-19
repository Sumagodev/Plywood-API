import express from 'express';
import morgan from 'morgan';
import fs from 'fs-extra';
import path from 'path';

// Define the log directory and log file
const logDir = '/var/logs/plywood/';
const logFile = path.join(logDir, 'access.log');

// Create the log directory if it doesn't exist
fs.ensureDirSync(logDir);

// Create a write stream for the log file
const accessLogStream = fs.createWriteStream(logFile, { flags: 'a' });

const loggerX = morgan(':date[iso] :method :url :status :res[content-length] - :response-time ms - Body: :req[body]', {
    stream: accessLogStream,
});

export default loggerX;
