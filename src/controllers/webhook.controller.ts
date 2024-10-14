import { NextFunction, Request, Response } from "express";
import { MongoClient } from 'mongodb';
import { Buffer } from 'buffer';  // To decode Base64
import dotenv from 'dotenv';  // To load environment variables
import { PaymentWebhook } from "../models/PaymentWebhook.model";

dotenv.config();  // Load environment variables from .env file
// Load expected credentials from environment variables (configured in your Dashboard)
const EXPECTED_USERNAME = process.env.USERNAME || 'yourUsername';
const EXPECTED_PASSWORD = process.env.PASSWORD || 'yourPassword';

const decodeBase64AuthHeader = (authHeader: string): { username: string, password: string } | null => {
    if (!authHeader.startsWith('Basic ')) {
        return null;
    }

    // Extract the Base64 encoded part
    const base64Credentials = authHeader.split(' ')[1];

    // Decode the Base64 string
    const decodedCredentials = Buffer.from(base64Credentials, 'base64').toString('utf8');

    // Split the decoded string into username and password
    const [username, password] = decodedCredentials.split(':');

    if (!username || !password) {
        return null;
    }

    return { username, password };
};

export const handleHdfcWebhook = async (req: Request, res: Response, next: NextFunction) => {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }

    // Step 2: Decode and verify the Authorization header
    const credentials = decodeBase64AuthHeader(authHeader);
    if (!credentials || credentials.username !== EXPECTED_USERNAME || credentials.password !== EXPECTED_PASSWORD) {
        return res.status(401).json({ message: 'Unauthorized: Invalid credentials' });
    }

    // Step 3: (Optional) Validate any custom headers
    const customHeaderValue = req.headers['customheadername1'];
    if (customHeaderValue && customHeaderValue !== 'expectedCustomValue') {
        return res.status(401).json({ message: 'Unauthorized: Invalid custom header' });
    }

    // Step 4: Retrieve the payload from the webhook request
    const payload = req.body;

    try {
        // Step 5: Create an instance of the PaymentWebhook model and save the payload to MongoDB
        const webhookData = new PaymentWebhook({
            payload: payload,  // assuming your model has a 'payload' field
        });

        // Save the data
        const result = await webhookData.save();

        // Check if the save operation returned a valid result
        if (!result || !result._id) {
            return res.status(500).json({
                message: 'Error: Webhook data was not saved correctly',
                error: 'No valid document ID returned from MongoDB',
            });
        }

        // Respond with a success message if save was successful
        res.status(200).json({
            message: 'Webhook data saved successfully',
            result: result,
        });
    } catch (error) {
        console.error('Error saving webhook data:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error });
    }
};
