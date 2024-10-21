import { NextFunction, Request, Response } from "express";
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { error } from "console";
export const createFilesHashes = async (req: Request, res: Response,next: NextFunction) => {
    try{
        const { filePaths }: { filePaths: string[] } = req.body;

  if (!Array.isArray(filePaths) || filePaths.length === 0) {
    return res.status(400).json({ error: 'Please provide a list of file paths.' });
  }

  const result: { filePath: string; hash?: string; error?: string }[] = [];

  for (const filePath of filePaths) {
    try {
      const fullPath = path.resolve(filePath);
      if (!fs.existsSync(fullPath)) {
        result.push({ filePath, error: 'File does not exist' });
        continue;
      }

      const hash = await generateFileHash(fullPath);
      result.push({ filePath, hash });

      // Save each hash to a separate file
      saveHashToFile(fullPath, hash);

    } catch (error: any) {
      result.push({ filePath, error: error.message });
    }
  }

  return res.json(result);
    }catch(err)
    {
        next(err)
    }
};

// Function to generate SHA-256 hash of a file
const generateFileHash = (filePath: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const stream = fs.createReadStream(filePath);
  
      stream.on('data', (data) => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', (err) => reject(err));
    });
  };
  
  // Function to save hash in a separate log file for each file
  const saveHashToFile = (filePath: string, hash: string): void => {
    const logDir = '/var/logs/plywood';
  
    // Create filename from the original file's name and timestamp
    const fileName = path.basename(filePath);
    const logFileName = `${fileName}_${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
    const logFilePath = path.join(logDir, logFileName);
  
    const logContent = `Date: ${new Date().toISOString()}\nFilename: ${filePath}\nHash: ${hash}\n`;
  
    // Write log content to a new file
    fs.writeFile(logFilePath, logContent, (err) => {
      if (err) {
        console.error(`Error writing to log file ${logFileName}:`, err);
      } else {
        console.log(`Hash saved to ${logFilePath}`);
      }
    });
  };
