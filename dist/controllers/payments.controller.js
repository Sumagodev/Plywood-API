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
exports.verifyPayment = exports.handleHdfcWebhook = void 0;
const buffer_1 = require("buffer"); // To decode Base64
const dotenv_1 = __importDefault(require("dotenv")); // To load environment variables
const PaymentWebhook_model_1 = require("../models/PaymentWebhook.model");
const hdfcConfig_1 = require("../helpers/hdfcConfig");
const Payment_model_1 = require("../models/Payment.model");
const user_model_1 = require("../models/user.model");
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
    console.log();
    // Step 2: Decode and verify the Authorization header
    const credentials = decodeBase64AuthHeader(authHeader);
    console.log(authHeader, 'authHeader');
    console.log(credentials, 'credentials');
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
const verifyPayment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    try {
        let existsCheck = yield user_model_1.User.findOne({ userId: (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.userId }).sort({ endDate: -1 }).exec();
        console.log(existsCheck, "existsCheck");
        let userObj = yield user_model_1.User.findOne({ userId: (_b = req === null || req === void 0 ? void 0 : req.user) === null || _b === void 0 ? void 0 : _b.userId }).exec();
        if (!(userObj || userObj._id)) {
            throw new Error("Could not find user please contact admin !!!");
        }
        const orderId = req.body.order_id || req.body.orderId;
        if (orderId === undefined) {
            return res.status(400).json(makeError('order_id not present or cannot be empty'));
        }
        let paymentObj = yield Payment_model_1.Payment.findOne({ 'gatwayPaymentObj.order_id': orderId }).exec();
        if (!paymentObj) {
            return res.status(400).json(makeError('order not found'));
        }
        if (paymentObj && (paymentObj === null || paymentObj === void 0 ? void 0 : paymentObj.statusResponse)) {
            if (((_c = paymentObj === null || paymentObj === void 0 ? void 0 : paymentObj.statusResponse) === null || _c === void 0 ? void 0 : _c.status) === 'CHARGED') {
                return res.status(200).json({
                    result: true,
                    message: "Order payment successful",
                    orderId: orderId,
                    orderStatus: (_d = paymentObj === null || paymentObj === void 0 ? void 0 : paymentObj.statusResponse) === null || _d === void 0 ? void 0 : _d.status,
                    txn_id: (_e = paymentObj === null || paymentObj === void 0 ? void 0 : paymentObj.statusResponse) === null || _e === void 0 ? void 0 : _e.txn_id,
                    effective_amount: (_f = paymentObj === null || paymentObj === void 0 ? void 0 : paymentObj.statusResponse) === null || _f === void 0 ? void 0 : _f.effective_amount,
                    txn_uuid: (_g = paymentObj === null || paymentObj === void 0 ? void 0 : paymentObj.statusResponse) === null || _g === void 0 ? void 0 : _g.txn_uuid,
                    date_created: paymentObj === null || paymentObj === void 0 ? void 0 : paymentObj.statusResponse.date_created,
                    last_updated: paymentObj === null || paymentObj === void 0 ? void 0 : paymentObj.statusResponse.last_updated,
                    customer_email: paymentObj === null || paymentObj === void 0 ? void 0 : paymentObj.statusResponse.customer_email,
                    customer_phone: paymentObj === null || paymentObj === void 0 ? void 0 : paymentObj.statusResponse.customer_phone,
                    customer_id: paymentObj === null || paymentObj === void 0 ? void 0 : paymentObj.statusResponse.customer_id,
                    status: paymentObj === null || paymentObj === void 0 ? void 0 : paymentObj.statusResponse.status,
                });
            }
        }
        const statusResponse = yield hdfcConfig_1.juspayConfig.order.status(orderId);
        const orderStatus = statusResponse.status;
        // Log the response for debugging
        console.log('Payment Status Response:', statusResponse);
        // Update payment in the database with the status response
        const updatedPayment = yield Payment_model_1.Payment.findByIdAndUpdate(paymentObj._id, {
            statusResponse: statusResponse,
        }).lean().exec();
        // Initialize message and response variables
        let message = '';
        let statusCode = 200; // Default status code for success
        // Handle different order statuses
        switch (orderStatus) {
            case "PENDING":
            case "PENDING_VBV":
                message = "Order payment pending";
                statusCode = 202; // Accepted but pending
                break;
            case "AUTHORIZATION_FAILED":
                message = "Order payment authorization failed";
                statusCode = 400; // Bad request as the authorization failed
                break;
            case "AUTHENTICATION_FAILED":
                message = "Order payment authentication failed";
                statusCode = 401; // Unauthorized because authentication failed
                break;
            case "CHARGED":
                message = "Order payment successful";
                statusCode = 200; // OK
                break;
            default:
                message = `payment status ${orderStatus}`;
                statusCode = 500; // Internal server error for unknown status
                break;
        }
        // Return JSON response with status and payment details
        return res.status(statusCode).json({
            result: orderStatus === "CHARGED" ? true : false,
            message: message,
            orderId: orderId,
            orderStatus: (_h = paymentObj === null || paymentObj === void 0 ? void 0 : paymentObj.statusResponse) === null || _h === void 0 ? void 0 : _h.status,
            txn_id: (_j = paymentObj === null || paymentObj === void 0 ? void 0 : paymentObj.statusResponse) === null || _j === void 0 ? void 0 : _j.txn_id,
            effective_amount: (_k = paymentObj === null || paymentObj === void 0 ? void 0 : paymentObj.statusResponse) === null || _k === void 0 ? void 0 : _k.effective_amount,
            txn_uuid: (_l = paymentObj === null || paymentObj === void 0 ? void 0 : paymentObj.statusResponse) === null || _l === void 0 ? void 0 : _l.txn_uuid,
            date_created: paymentObj === null || paymentObj === void 0 ? void 0 : paymentObj.statusResponse.date_created,
            last_updated: paymentObj === null || paymentObj === void 0 ? void 0 : paymentObj.statusResponse.last_updated,
            customer_email: paymentObj === null || paymentObj === void 0 ? void 0 : paymentObj.statusResponse.customer_email,
            customer_phone: paymentObj === null || paymentObj === void 0 ? void 0 : paymentObj.statusResponse.customer_phone,
            customer_id: paymentObj === null || paymentObj === void 0 ? void 0 : paymentObj.statusResponse.customer_id,
            status: paymentObj === null || paymentObj === void 0 ? void 0 : paymentObj.statusResponse.status,
        });
    }
    catch (error) {
        console.error('Error verifying and saving payment:', error);
        // Handle the error case with a response
        return res.status(500).json({
            result: false,
            message: "Internal Server Error",
            error: error,
        });
    }
});
exports.verifyPayment = verifyPayment;
function makeError(message) {
    return {
        message: message || 'Something went wrong'
    };
}
