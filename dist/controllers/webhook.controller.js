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
exports.handleHdfcWebhook = void 0;
const buffer_1 = require("buffer"); // To decode Base64
const dotenv_1 = __importDefault(require("dotenv")); // To load environment variables
const PaymentWebhook_model_1 = require("../models/PaymentWebhook.model");
dotenv_1.default.config(); // Load environment variables from .env file
// Load expected credentials from environment variables (configured in your Dashboard)
const EXPECTED_USERNAME = process.env.USERNAME || 'yourUsername';
const EXPECTED_PASSWORD = process.env.PASSWORD || 'yourPassword';
const decodeBase64AuthHeader = (authHeader) => {
    if (!authHeader.startsWith('Basic ')) {
        return null;
    }
    // Extract the Base64 encoded part
    const base64Credentials = authHeader.split(' ')[1];
    // Decode the Base64 string
    const decodedCredentials = buffer_1.Buffer.from(base64Credentials, 'base64').toString('utf8');
    // Split the decoded string into username and password
    const [username, password] = decodedCredentials.split(':');
    if (!username || !password) {
        return null;
    }
    return { username, password };
};
const handleHdfcWebhook = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        const webhookData = new PaymentWebhook_model_1.PaymentWebhook({
            payload: payload, // assuming your model has a 'payload' field
        });
        // Save the data
        const result = yield webhookData.save();
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
    }
    catch (error) {
        console.error('Error saving webhook data:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error });
    }
});
exports.handleHdfcWebhook = handleHdfcWebhook;
