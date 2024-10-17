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
const EXPECTED_USERNAME = process.env.WEBHOOK_USER_NAME;
const EXPECTED_PASSWORD = process.env.WEBHOOK_PASSWORD;
const decodeBase64AuthHeader = (authHeader) => {
    if (!authHeader.startsWith('Basic ')) {
        throw new Error('Authorization header must start with "Basic "');
    }
    const base64Credentials = authHeader.split(' ')[1]; // Remove 'Basic' prefix
    const decodedCredentials = buffer_1.Buffer.from(base64Credentials, 'base64').toString('ascii').trim(); // Decode and trim
    const [username, password] = decodedCredentials.split(':').map((str) => str.trim()); // Split into username and password
    return { username, password };
};
const handleHdfcWebhook = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }
    // Step 2: Decode and verify the Authorization header
    const credentials = decodeBase64AuthHeader(authHeader);
    // Compare decoded credentials with the expected values
    if (credentials.username === EXPECTED_USERNAME && credentials.password === EXPECTED_PASSWORD) {
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
            return res.status(200).json({
                message: 'Webhook data saved successfully',
                result: true,
            });
        }
        catch (error) {
            console.error('Error saving webhook data:', error);
            return res.status(500).json({ message: 'Internal Server Error', error: error });
        }
    }
    else {
        // Respond with unauthorized if the credentials do not match
        return res.status(401).json({
            message: 'Unauthorized: Invalid credentials',
            result: {
                usernameMatch: credentials.username === EXPECTED_USERNAME,
                passwordMatch: credentials.password === EXPECTED_PASSWORD
            }
        });
    }
});
exports.handleHdfcWebhook = handleHdfcWebhook;
const verifyPayment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
    try {
        let existsCheck = yield user_model_1.User.findOne({ userId: (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.userId }).sort({ endDate: -1 }).exec();
        console.log(existsCheck, "existsCheck");
        let userObj = yield user_model_1.User.findOne({ userId: (_b = req === null || req === void 0 ? void 0 : req.user) === null || _b === void 0 ? void 0 : _b.userId }).exec();
        if (!(userObj || userObj._id)) {
            throw new Error("Could not find user please contact admin !!!");
        }
        const orderId = req.body.order_id || req.body.orderId;
        if (orderId === undefined) {
            //            return res.status(400).json(makeError('order_id not present or cannot be empty'));
            return res.status(400).json({ result: false, message: 'order id not present or cannot be empty' });
        }
        let paymentObj = yield Payment_model_1.Payment.findOne({ 'gatwayPaymentObj.order_id': orderId }).exec();
        if (!paymentObj) {
            return res.status(400).json({ result: false, message: 'order not found' });
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
        let statusCode = 500; // Default status code for success
        // Handle different order statuses
        switch (orderStatus) {
            case "NEW":
                message = "Newly created order. This is the status if transaction is not triggered for an order.";
                statusCode = 202; // Accepted but pending
                break;
            case "PENDING":
            case "PENDING_VBV":
                message = "Order payment pending. Authentication is in progress.";
                statusCode = 202; // Accepted but pending
                break;
            case "CHARGED":
                message = "Order payment successful. Display order confirmation page to the user.";
                statusCode = 200; // OK
                break;
            case "AUTHENTICATION_FAILED":
                message = "Order payment authentication failed. Allow user to retry payment.";
                statusCode = 401; // Unauthorized because authentication failed
                break;
            case "AUTHORIZATION_FAILED":
                message = "Order payment authorization failed. Allow user to retry payment.";
                statusCode = 400; // Bad request as the authorization failed
                break;
            case "AUTHORIZING":
                message = "Transaction status is pending from bank. Show pending screen to customers.";
                statusCode = 202; // Accepted but pending
                break;
            case "STARTED":
                message = "Transaction is pending. SmarteGateway system isn't able to find a gateway to process a transaction.";
                statusCode = 503; // Service Unavailable for integration error
                break;
            case "AUTO_REFUNDED":
                message = "Transaction is automatically refunded. Display the refund status to the user.";
                statusCode = 200; // OK, but handle refund logic
                break;
            case "PARTIAL_CHARGED":
                message = "The charged amount is less than the effective order amount. Display this status to the user.";
                statusCode = 206; // Partial Content for partial charge
                break;
            default:
                message = `Payment status: ${orderStatus}`;
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
            date_created: (_m = paymentObj === null || paymentObj === void 0 ? void 0 : paymentObj.statusResponse) === null || _m === void 0 ? void 0 : _m.date_created,
            last_updated: (_o = paymentObj === null || paymentObj === void 0 ? void 0 : paymentObj.statusResponse) === null || _o === void 0 ? void 0 : _o.last_updated,
            customer_email: (_p = paymentObj === null || paymentObj === void 0 ? void 0 : paymentObj.statusResponse) === null || _p === void 0 ? void 0 : _p.customer_email,
            customer_phone: (_q = paymentObj === null || paymentObj === void 0 ? void 0 : paymentObj.statusResponse) === null || _q === void 0 ? void 0 : _q.customer_phone,
            customer_id: (_r = paymentObj === null || paymentObj === void 0 ? void 0 : paymentObj.statusResponse) === null || _r === void 0 ? void 0 : _r.customer_id,
            status: (_s = paymentObj === null || paymentObj === void 0 ? void 0 : paymentObj.statusResponse) === null || _s === void 0 ? void 0 : _s.status,
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
