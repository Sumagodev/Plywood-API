import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();


export const createPhonePaymentOrder = async (options: any) => {
  try {

    let obj = {
      "merchantId": `${process.env.PHONEPE_MERCHANT_ID}`,
      "merchantUserId": uuidv4().replace(/-/g, ""),
      "merchantTransactionId": `${options.orderId}`,
      "amount": options?.amount,
      "redirectUrl": options?.successUrl,
      "callbackUrl": options?.successUrl,
      "redirectMode": "POST",
      "mobileNumber": options.mobile,
      "paymentInstrument": {
        "type": "PAY_PAGE"
      }
    }


    console.log(obj, "objobj")
    let objJsonStr = JSON.stringify(obj);
    // console.log(objJsonStr, "objJsonStrobjJsonStr")

    let objJsonB64 = Buffer.from(objJsonStr).toString("base64");


    let hashStr = objJsonB64 + '/pg/v1/pay' + process.env.PHONEPE_SALT
    console.log(hashStr, "objJsonB64objJsonB64objJsonB64objJsonB64objJsonB64")

    let hash = crypto.createHash('SHA256').update(hashStr).digest('hex');
    const phonepeRHeader = {
      headers: { accept: 'application/json', 'Content-Type': 'application/json', 'X-VERIFY': hash + '###1' },
    };

    // console.log(phonepeRHeader, "phonepeRHeaderphonepeRHeaderphonepeRHeaderphonepeRHeaderphonepeRHeader")

    // let orderObj = await axios.post(process.env.PHONEPE_PROD_URL+'/pg/v1/pay',{
    //   request:objJsonB64
    // },phonepeRHeader);

    let data = JSON.stringify({
      "request": objJsonB64
    });

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: process.env.PHONEPE_PROD_URL + '/pg/v1/pay',
      headers: {
        'X-VERIFY': hash + '###1',
        'Content-Type': 'application/json'
      },
      data: data
    };
    console.log(config)

    const orderObj = await axios.request(config)
    return { sucess: true, data: orderObj?.data?.data };
  } catch (error: any) {
    console.error(error);
    console.log(error?.response?.data, "safsdfdfsdfsd")
    return { sucess: false, data: error?.response?.data };
  }
};



export const checkStatusPhonePaymentOrder = async (options: any) => {
  try {

    let merchantId = options?.merchantId
    let merchantTransactionId = options?.merchantTransactionId;
    console.log(options, "optionsoptionsoptions")
    if (!merchantId || !merchantTransactionId) {
      return { sucess: false, data: {} };
    }
    let hashStr = '/pg/v1/status/' + merchantId + '/' + merchantTransactionId + process.env.PHONEPE_SALT
    console.log(hashStr, "hashStrhashStrhashStr")
    let hash = crypto.createHash('SHA256').update(hashStr).digest('hex');
    const phonepeRHeader = {
      headers: { accept: 'application/json', 'Content-Type': 'application/json', 'X-VERIFY': hash + '###1', 'X-MERCHANT-ID': process.env.PHONEPE_MERCHANT_ID },
    };

    console.log(phonepeRHeader, "phonepeRHeaderphonepeRHeaderphonepeRHeaderphonepeRHeaderphonepeRHeader")

    // let orderObj = await axios.post(process.env.PHONEPE_PROD_URL+'/pg/v1/pay',{
    //   request:objJsonB64
    // },phonepeRHeader);



    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: process.env.PHONEPE_PROD_URL + '/pg/v1/status/' + merchantId + '/' + merchantTransactionId,
      headers: {
        'X-VERIFY': hash + '###1',
        'X-MERCHANT-ID': process.env.PHONEPE_MERCHANT_ID
      },
    };


    console.log(config)

    const orderObj = await axios.request(config)
    if (orderObj?.data && orderObj?.data?.code == 'PAYMENT_SUCCESS') {
      return { sucess: true, data: orderObj?.data?.data, message: 'Your payment is successful' };
    } else {
      return { sucess: false, data: {}, message: "Please Contact to Admin for payment is failed" };
    }

  } catch (error: any) {
    console.error(error);
    console.log(error?.response?.data, "safsdfdfsdfsd")

    return { sucess: false, data: error?.response?.data };
  }
};