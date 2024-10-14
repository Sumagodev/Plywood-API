// app.post('/handleJuspayResponse', async (req, res) => {
//     const orderId = req.body.order_id || req.body.orderId;

//     if (!orderId) {
//         return res.json(makeError('order_id not present or cannot be empty'));
//     }

//     try {
//         const statusResponse = await juspay.order.status(orderId);
//         const orderStatus = statusResponse.status;
//         let redirectUrl = '';

//         switch (orderStatus) {
//             case "CHARGED":
//                 // Payment was successful, redirect to order confirmation page
//                 redirectUrl = /order-confirmation?orderId=${orderId}&status=success;
//                 break;
//             case "PENDING":
//             case "PENDING_VBV":
//                 // Payment is still pending, redirect to a page showing pending status
//                 redirectUrl = /payment-pending?orderId=${orderId}&status=pending;
//                 break;
//             case "AUTHORIZATION_FAILED":
//             case "AUTHENTICATION_FAILED":
//                 // Payment failed, redirect to a payment failed page
//                 redirectUrl = /payment-failed?orderId=${orderId}&status=failed;
//                 break;
//             default:
//                 // Any other status, redirect to a generic error or status page
//                 redirectUrl = /payment-error?orderId=${orderId}&status=${orderStatus};
//                 break;
//         }

//         // Perform the redirection based on the payment status
//         return res.redirect(redirectUrl);
//     } catch (error) {
//         if (error instanceof APIError) {
//             // Handle errors coming from Juspay's API
//             return res.json(makeError(error.message));
//         }
//         return res.json(makeError());
//     }
// });