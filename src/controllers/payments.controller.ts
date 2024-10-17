import { NextFunction, Request, Response } from "express";
import { MongoClient } from 'mongodb';
import { Buffer } from 'buffer';  // To decode Base64
import dotenv from 'dotenv';  // To load environment variables
import { PaymentWebhook } from "../models/PaymentWebhook.model";
import { juspayConfig } from "../helpers/hdfcConfig";
import { Payment } from "../models/Payment.model";
import { User } from "../models/user.model";

dotenv.config();  // Load environment variables from .env file
// Load expected credentials from environment variables (configured in your Dashboard)
const EXPECTED_USERNAME = process.env.WEBHOOK_USER_NAME 
const EXPECTED_PASSWORD = process.env.WEBHOOK_PASSWORD;
const decodeBase64AuthHeader = (authHeader: string) => {
  if (!authHeader.startsWith('Basic ')) {
    throw new Error('Authorization header must start with "Basic "');
  }
  
  const base64Credentials = authHeader.split(' ')[1]; // Remove 'Basic' prefix
  const decodedCredentials = Buffer.from(base64Credentials, 'base64').toString('ascii').trim(); // Decode and trim
  const [username, password] = decodedCredentials.split(':').map((str) => str.trim()); // Split into username and password
  
  return { username, password };
};

export const handleHdfcWebhook = async (req: Request, res: Response, next: NextFunction) => {

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
            return res.status(200).json({
                message: 'Webhook data saved successfully',
                result: true,
            });
        } catch (error) {
            console.error('Error saving webhook data:', error);
            return res.status(500).json({ message: 'Internal Server Error', error: error });
        }
    } else {
        // Respond with unauthorized if the credentials do not match
        return res.status(401).json({ 
            message: 'Unauthorized: Invalid credentials', 
            result: {
                usernameMatch: credentials.username === EXPECTED_USERNAME, 
                passwordMatch: credentials.password === EXPECTED_PASSWORD
            } 
        });
    }
};


export const verifyPayment = async (req: Request, res: Response, next: NextFunction) => {

    try {

      let existsCheck: any = await User.findOne({ userId: req?.user?.userId }).sort({ endDate: -1 }).exec();
      console.log(existsCheck, "existsCheck");
      let userObj: any = await User.findOne({ userId: req?.user?.userId }).exec();
      if (!(userObj || userObj._id)) {
        throw new Error("Could not find user please contact admin !!!");
      }
  
        const orderId: string | undefined = req.body.order_id || req.body.orderId;

        if (orderId === undefined) {
//            return res.status(400).json(makeError('order_id not present or cannot be empty'));
            return res.status(400).json({result:  false,message:'order id not present or cannot be empty'});
        }
         let paymentObj : any = await Payment.findOne({ 'gatwayPaymentObj.order_id': orderId }).exec();      
         if (!paymentObj) {
          return res.status(400).json({result:  false,message:'order not found'});
         }

         if(paymentObj && paymentObj?.statusResponse){

            
            if(paymentObj?.statusResponse?.status==='CHARGED')    
            {
                return res.status(200).json({
                    result:  true,
                    message: "Order payment successful",
                    orderId: orderId,
                    orderStatus: paymentObj?.statusResponse?.status,
                    txn_id: paymentObj?.statusResponse?.txn_id,
                    effective_amount: paymentObj?.statusResponse?.effective_amount,
                    txn_uuid: paymentObj?.statusResponse?.txn_uuid,
                    date_created:paymentObj?.statusResponse.date_created,
                    last_updated:paymentObj?.statusResponse.last_updated,
                    customer_email:paymentObj?.statusResponse.customer_email,
                    customer_phone:paymentObj?.statusResponse.customer_phone,
                    customer_id:paymentObj?.statusResponse.customer_id,
                    status:paymentObj?.statusResponse.status,
                  });
            }
         }
         
        const statusResponse = await juspayConfig.order.status(orderId);
        const orderStatus = statusResponse.status;
    
        // Log the response for debugging
        console.log('Payment Status Response:', statusResponse);
    
        // Update payment in the database with the status response
        const updatedPayment = await Payment.findByIdAndUpdate(paymentObj._id, {
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
          result: orderStatus === "CHARGED" ? true: false,
          message: message,
          orderId: orderId,
                    orderStatus: paymentObj?.statusResponse?.status,
                    txn_id: paymentObj?.statusResponse?.txn_id,
                    effective_amount: paymentObj?.statusResponse?.effective_amount,
                    txn_uuid: paymentObj?.statusResponse?.txn_uuid,
                    date_created:paymentObj?.statusResponse?.date_created,
                    last_updated:paymentObj?.statusResponse?.last_updated,
                    customer_email:paymentObj?.statusResponse?.customer_email,
                    customer_phone:paymentObj?.statusResponse?.customer_phone,
                    customer_id:paymentObj?.statusResponse?.customer_id,
                    status:paymentObj?.statusResponse?.status,
        });
    
      } catch (error) {
        console.error('Error verifying and saving payment:', error);
        // Handle the error case with a response
        return res.status(500).json({
          result: false,
          message: "Internal Server Error",
          error: error,
        });
      }
};
function makeError(message?: string) {
    return {
        message: message || 'Something went wrong'
    };
  }
  


