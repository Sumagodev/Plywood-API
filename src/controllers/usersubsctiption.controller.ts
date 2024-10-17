import { NextFunction, Request, Response } from "express";
import { UserSubscription } from "../models/userSubscription.model";
import { User } from "../models/user.model";
import moment from "moment";
import { checkStatusPhonePaymentOrder, createPhonePaymentOrder } from "../helpers/phonepay";
import { Payment } from "../models/Payment.model";
import { sendMail } from "../helpers/mailer";
import { Country } from "../models/country.model";
import { State } from "../models/State.model";
import { City } from "../models/City.model";
import { postSpiCrmLead } from "../service/sipCrm.service";
import { getSubscriptionSequence } from "../helpers/constant";
import { Juspay,APIError} from "expresscheckout-nodejs";
import * as fs from 'fs';
import * as path from 'path';

import { hdfcConfig, juspayConfig } from "../helpers/hdfcConfig";
import { Subscription } from "../models/Subscription.model";
import { Types } from "mongoose";


export const buySubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let existsCheck: any = await UserSubscription.findOne({ userId: req?.user?.userId }).sort({ endDate: -1 }).exec();
    console.log(existsCheck, "existsCheck");
    let tempStartDate: any = new Date();
    let tempEndDate: any = new Date();

    if (req.body?.noOfMonth > 0) {
      if (existsCheck && existsCheck.endDate) {
        tempStartDate = new Date(existsCheck.endDate);
        tempEndDate = moment(existsCheck.endDate).add({ months: req.body?.noOfMonth });
      } else {
        tempEndDate = moment(tempEndDate).add({ months: req.body?.noOfMonth });
      }
    } else if (existsCheck && existsCheck.endDate) {
      tempEndDate = existsCheck.endDate;
    } else {
      tempEndDate = undefined;
    }

    let obj = {
      userId: req?.body?.userId,
      subscriptionId: req.body._id,
      name: req.body?.name,
      description: req.body?.description,
      price: req.body?.price,
      startDate: tempStartDate,
      numberOfSales: req?.body?.numberOfSales ? req?.body?.numberOfSales : 0,
      saleDays: req?.body?.saleDays ? req?.body?.saleDays : 0,
      numberOfAdvertisement: req?.body?.numberOfAdvertisement ? req?.body?.numberOfAdvertisement : 0,
      advertisementDays: req?.body?.advertisementDays ? req?.body?.advertisementDays : 0,
      isExpired: false,
      endDate: null,
    };

    if (tempEndDate) {
      obj.endDate = tempEndDate;
    }
    let userObj: any = await User.findById(req?.user?.userId).exec();
    if (!(userObj || userObj._id)) {
      throw new Error("Could not find user please contact admin !!!");
    }

    // Add GST

    obj.price = obj.price + Math.round(obj.price * 0.18);

    let options: any = {
      amount: obj.price * 100,
      currency: "INR",
      receipt: new Date().getTime(),
    };

    let paymentObj = {
      amount: obj.price,
      orderObj: obj, // razorpay
      paymentChk: 0,
    };

    let paymentObjResponse = await new Payment(paymentObj).save();

    options.orderId = paymentObjResponse._id;
    options.mobile = userObj?.phone;
    options.successUrl = `${process.env.BASE_URL}/usersubscription/phonepePaymentStatusCheck/` + paymentObjResponse._id;
    options.payfrom = req.body.patfrom;
    let phoResone = await createPhonePaymentOrder(options);
    console.log(phoResone, "phoResone");
    if (phoResone && !phoResone?.sucess) {
      throw new Error(`Phonepe is not working.Please Try Some another Payment Method`);
    }

    let orderPaymentObj: any = phoResone?.data;
    let obj1 = await Payment.findByIdAndUpdate(paymentObjResponse._id, {
      "gatwayPaymentObj": orderPaymentObj,
    })
      .lean()
      .exec();

    // await User.findByIdAndUpdate(req?.user?.userId, { $inc: { numberOfSales: obj.numberOfSales, saleDays: obj?.saleDays, numberOfAdvertisement: obj?.numberOfAdvertisement, advertisementDays: obj?.advertisementDays }, subscriptionEndDate: obj.endDate }).exec();
    // await new UserSubscription(obj).save()
    res.status(200).json({
      message: "UserSubscription Successfully Created",
      data: orderPaymentObj,
      orderId: paymentObjResponse._id,
      success: true,
    });
  } catch (err) {
    next(err);
  }
};

export const phonepePaymentStatusCheck = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.body, "-------------------------------------------------");

    // const userObj = await User.findById(req.user.userId).lean().exec();
    let orderObj: any = await Payment.findById(req.params.orderId).exec();
    if (!orderObj) throw new Error("Order Not Found");

    if (orderObj?.paymentChk == 1) {
      // throw new Error("Payment is already Done");
      console.log(req.body, "Payment is already Done");

      res.redirect(`${process.env.APP_URL}/Payment/${orderObj._id}?msg=Payment is already Done`);
      // res.json({ message: "Payment is already Done ", success: true, orderId: orderObj._id, data: orderObj });

      return;
    }
    let phoneObj = orderObj?.gatwayPaymentObj;
    let options = {
      merchantId: phoneObj?.merchantId,
      merchantTransactionId: phoneObj?.merchantTransactionId,
    };
    let checkPaymentStatus = await checkStatusPhonePaymentOrder(options);
    if (checkPaymentStatus && !checkPaymentStatus?.sucess) {
      throw new Error("Please Contact to Admin for payment is failed");
    }

    phoneObj.paymentInstrument = checkPaymentStatus?.data?.paymentInstrument;
    orderObj = await Payment.findByIdAndUpdate(req.params.orderId, {
      "paymentChk": 1,
      "gatwayPaymentObj": phoneObj,
    })
      .lean()
      .exec();

    let userObj: any = await User.findById(orderObj?.orderObj?.userId).exec();
    let patObj: any = orderObj?.orderObj;
    let totalSubscription = await UserSubscription.countDocuments({});
    let invoiceId = getSubscriptionSequence(totalSubscription + 1);
    patObj.orderId = invoiceId;


    await User.findByIdAndUpdate(orderObj?.orderObj?.userId, {
      $inc: {
        numberOfSales: patObj.numberOfSales,
        saleDays: patObj?.saleDays,
        numberOfAdvertisement: patObj?.numberOfAdvertisement,
        advertisementDays: patObj?.advertisementDays,
      },
      subscriptionEndDate: patObj.endDate,
    }).exec();
    orderObj = await new UserSubscription(patObj).save();
    let email = userObj?.email ? userObj?.email : userObj?.companyObj?.email;
    let name = userObj?.name;
    let orderId = orderObj?.orderId;
    let emailArr = [
      {
        name,
        email,
      },
    ];
    let customerTitle = `Subscription has been confirmed ${orderId}`;
    let adminTitle = `New Subscription ${orderId} -  ${name}`;
    orderObj.user = userObj;
    let obj3 = { ...orderObj };
    console.log(obj3);
    obj3.order_id = invoiceId;
    obj3.createdAtDate2 = new Date(orderObj.createdAt).toDateString();
    await sendMail(emailArr, orderObj._id, customerTitle, orderObj);
    let emailAr2 = [{ name: "Plywood Bazar", email: "admin@plywoodbazar.com" }];
    await sendMail(emailAr2, orderObj._id, adminTitle, orderObj);
    console.log("asdsadad", process.env.APP_URL);

    let crmObj = {
      PersonName: userObj?.name,
      MobileNo: userObj?.phone,
      EmailID: userObj?.email,
      CompanyName: `${userObj?.companyObj?.name}`,
      OfficeAddress: `${userObj?.address}`,
      MediumName: "Subscribed",
      CampaignName: orderObj?.name,
      Country: "",
      State: "",
      City: "",
      SourceName: "app",
      InitialRemarks: `Start Date  : ${orderObj?.startDate}, End Date : ${orderObj?.endDate}`,
    };
    if (req.body?.SourceName) {
      crmObj.SourceName = req.body?.SourceName;
    }
    if (userObj.countryId) {
      let countryObj = await Country.findById(userObj.countryId).exec();
      crmObj.Country = countryObj?.name ? countryObj?.name : "";
    }
    if (userObj.stateId) {
      let stateObj = await State.findById(userObj.stateId).exec();
      crmObj.State = stateObj?.name ? stateObj?.name : "";
    }
    if (userObj.cityId) {
      let cityObj = await City.findById(userObj.cityId).exec();
      crmObj.City = cityObj?.name ? cityObj?.name : "";
    }
    await postSpiCrmLead(crmObj);

    res.redirect(`${process.env.APP_URL}/Payment/${orderObj._id}`);
    // res.json({ message: "Payment Successfull", success: true, orderId: orderObj._id, data: phoneObj });
  } catch (err) {
    next(err);
  }
};
export const getSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // let SubscriptionArr: any = [];
    // let query: any = {}
    // console.log(req.query, "req.query.q")
    // if (req.query.q) {
    //     query.name = new RegExp(`${req.query.q}`, "i");
    // }
    // // if (req.query.SubscriptionId) {
    // //   query.SubscriptionId = req.query.SubscriptionId;
    // // }
    // SubscriptionArr = await UserSubscription.find(query).lean().exec();
    // // for (let UserSubscription of SubscriptionArr) {
    // //   if (UserSubscription.SubscriptionId) {
    // //     console.log(UserSubscription.SubscriptionId, "SubscriptionIdSubscriptionId")
    // //     UserSubscription.SubscriptionObj = await UserSubscription.findById(UserSubscription.SubscriptionId).exec();
    // //   }
    // // }

    res.status(200).json({ message: "getSubscription", success: true });
    // res.status(200).json({ message: "getSubscription", data: SubscriptionArr, success: true });
  } catch (err) {
    next(err);
  }
};

export const getSubscriptionSubscribedbyUserId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
    let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 1000;

    let pipeline: any = [
      {
        "$match": {
          "subscriptionId": "643e355aecef4e188270bb68",
        },
      },
      {
        "$addFields": {
          "id": {
            "$toObjectId": "$userId",
          },
        },
      },
      {
        "$lookup": {
          "from": "users",
          "localField": "id",
          "foreignField": "_id",
          "as": "usersArr",
        },
      },
      {
        "$project": {
          "_id": 1,
          "name": 1,
          "usersArr.name": 1,
          "usersArr.email": 1,
          "usersArr.phone": 1,
          "usersArr.whatsapp": 1,
          "usersArr.address": 1,
          "usersArr.numberOfSales": 1,
          "usersArr.saleDays": 1,
          "usersArr.advertisementDays": 1,
          "usersArr.numberOfAdvertisement": 1,
          "usersArr.subscriptionEndDate": 1,
          "usersArr.price": 1,
          "usersArr.startDate": 1,
          "usersArr.endDate": 1,
          "usersArr.createdAt": 1,
        },
      },
    ];
    let SubscriptionArr: any = [];

    pipeline.push(
      {
        "$skip": (pageValue - 1) * limitValue,
      },
      {
        "$limit": limitValue,
      }
    );
    // let query: any = {}
    // console.log(req.query, "req.query.q")
    // if (req.query.q) {
    //     query.name = new RegExp(`${req.query.q}`, "i");
    // }
    // // if (req.query.SubscriptionId) {
    // //   query.SubscriptionId = req.query.SubscriptionId;
    // // }
    SubscriptionArr = await UserSubscription.aggregate(pipeline).exec();
    // // for (let UserSubscription of SubscriptionArr) {
    // //   if (UserSubscription.SubscriptionId) {
    // //     console.log(UserSubscription.SubscriptionId, "SubscriptionIdSubscriptionId")
    // //     UserSubscription.SubscriptionObj = await UserSubscription.findById(UserSubscription.SubscriptionId).exec();
    // //   }
    // // }
    console.log(JSON.stringify(SubscriptionArr, null, 2), "SubscriptionArr");

    res.status(200).json({ message: "getSubscription", data: SubscriptionArr, success: true });
    // res.status(200).json({ message: "getSubscription", data: SubscriptionArr, success: true });
  } catch (err) {
    next(err);
  }
};

export const getAllSubscriptionbyUserId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let SubscriptionArr: any = [];
    // let query: any = {}
    // console.log(req.query, "req.query.q")
    // if (req.query.q) {
    //     query.name = new RegExp(`${req.query.q}`, "i");
    // }
    // // if (req.query.SubscriptionId) {
    // //   query.SubscriptionId = req.query.SubscriptionId;
    // // }
    console.log(req.query);
    let pageValue = req.query.currentPage ? parseInt(`${req.query.currentPage}`) : 1;
    let limitValue = req.query.rowsPerPage ? parseInt(`${req.query.rowsPerPage}`) : 10;
    const totalCount = await UserSubscription.find({
      $or: [{ userId: req.user?.userId }, { userId: req.query?.userId }],
    }).countDocuments();
    SubscriptionArr = await UserSubscription.find({
      $or: [{ userId: req.user?.userId }, { userId: req.query?.userId }],
    })
      .skip((pageValue - 1) * limitValue)
      .limit(limitValue)
      .lean()
      .sort({ endDate: -1 })
      .exec();
    // // for (let UserSubscription of SubscriptionArr) {
    // //   if (UserSubscription.SubscriptionId) {
    // //     console.log(UserSubscription.SubscriptionId, "SubscriptionIdSubscriptionId")
    // //     UserSubscription.SubscriptionObj = await UserSubscription.findById(UserSubscription.SubscriptionId).exec();
    // //   }
    // // }

    res
      .status(200)
      .json({ message: "getAllSubscriptionbyUserId", data: SubscriptionArr, totalCount: totalCount, success: true });
    // res.status(200).json({ message: "getSubscription", data: SubscriptionArr, success: true });
  } catch (err) {
    next(err);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // let SubscriptionObj: any = await UserSubscription.findById(req.params.id).lean().exec();
    // if (!SubscriptionObj) throw { status: 400, message: "UserSubscription Not Found" };
    res.status(200).json({ message: "UserSubscription Found", success: true });
    // res.status(200).json({ message: "UserSubscription Found", data: SubscriptionObj, success: true });
  } catch (err) {
    next(err);
  }
};

export const sendMailById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // let SubscriptionObj: any = await UserSubscription.findById(req.params.id).lean().exec();
    // if (!SubscriptionObj) throw { status: 400, message: "UserSubscription Not Found" };

    console.log(req.params.id, "req.params.idreq.params.idreq.params.id");
    let userOrderObj: any = await UserSubscription.findById(`${req.params.id}`).exec();
    if (!userOrderObj) throw new Error("Order Not Found");
    let userObj: any = await User.findById(userOrderObj?.userId).exec();
    let email = userObj?.email ? userObj?.email : userObj?.companyObj?.email;
    let name = userObj?.name;
    let orderId = userOrderObj?._id;
    let emailArr = [
      {
        name,
        email,
      },
    ];
    let customerTitle = `Subscription with ${orderId}`;
    userOrderObj.user = userObj;
    let obj3 = { ...userOrderObj };
    console.log(obj3);
    obj3.order_id = orderId;
    obj3.createdAtDate2 = new Date(userOrderObj.createdAt).toDateString();
    await sendMail(emailArr, userOrderObj._id, customerTitle, userOrderObj);
    let adminTitle = ` Subscription ${orderId} -  ${name}`;
    let emailAr2 = [{ name: "Plywood Bazar", email: "admin@plywoodbazar.com" }];
    await sendMail(emailAr2, userOrderObj._id, adminTitle, userOrderObj);
    res.status(200).json({ message: "Mail Send Successfully ", success: true });
    // res.status(200).json({ message: "UserSubscription Found", data: SubscriptionObj, success: true });
  } catch (err) {
    next(err);
  }
};



// export const initiateJuspayPaymentForSubcription = async (req: Request, res: Response, next: NextFunction) => {


//   console.log('yyyyy',req.body);
//   console.log('yyyyy',req.user);


//     let existsCheck: any = await UserSubscription.findOne({ userId: req?.user?.userId }).sort({ endDate: -1 }).exec();
//     console.log(existsCheck, "existsCheck");
//     let tempStartDate: any = new Date();
//     let tempEndDate: any = new Date();

//     if (req.body?.noOfMonth > 0) {
//       if (existsCheck && existsCheck.endDate) {
//         tempStartDate = new Date(existsCheck.endDate);
//         tempEndDate = moment(existsCheck.endDate).add({ months: req.body?.noOfMonth });
//       } else {
//         tempEndDate = moment(tempEndDate).add({ months: req.body?.noOfMonth });
//       }
//     } else if (existsCheck && existsCheck.endDate) {
//       tempEndDate = existsCheck.endDate;
//     } else {
//       tempEndDate = undefined;
//     }

//     let obj = {
//       userId: req?.user?.userId,
//       subscriptionId: req.body._id,
//       name: req.body?.name,
//       description: req.body?.description,
//       price: req.body?.price,
//       startDate: tempStartDate,
//       numberOfSales: req?.body?.numberOfSales ? req?.body?.numberOfSales : 0,
//       saleDays: req?.body?.saleDays ? req?.body?.saleDays : 0,
//       numberOfAdvertisement: req?.body?.numberOfAdvertisement ? req?.body?.numberOfAdvertisement : 0,
//       advertisementDays: req?.body?.advertisementDays ? req?.body?.advertisementDays : 0,
//       isExpired: false,
//       endDate: null,
//     };

//     if (tempEndDate) {
//       obj.endDate = tempEndDate;
//     }
//     let userObj: any = await User.findById(req?.user?.userId).exec();
//     if (!(userObj || userObj._id)) {
//       throw new Error("Could not find user please contact admin !!!");
//     }

//     // Add GST

//     obj.price = obj.price + Math.round(obj.price * 0.18);

//     let options: any = {
//       amount: obj.price * 100,
//       currency: "INR",
//       receipt: new Date().getTime(),
//     };

//     let paymentObj = {
//       amount: obj.price,
//       orderObj: obj, // razorpay
//       paymentChk: 0,
//     };

//     let paymentObjResponse = await new Payment(paymentObj).save();

//     options.orderId = paymentObjResponse._id;
//     options.mobile = 'userObj?.phone';
//     options.userId = 'userObj._id';
//     options.email = 'userObj.email';
//     options.subscriptionId = existsCheck._id;
//     options.successUrl = `${process.env.BASE_URL}/usersubscription/phonepePaymentStatusCheck/` + paymentObjResponse._id;
//     options.payfrom = req.body.patfrom;
    




//   const paymentPageClientId=hdfcConfig.PAYMENT_PAGE_CLIENT_ID;
//   const orderId = `order_${Date.now()}`
//   const amount = 1 + Math.random() * 100 | 0

//     // makes return url
//     const returnUrl = `${req.protocol}://${req.hostname}:${process.env.PORT}/usersubscription/handleJuspayPaymentForSubcription`
//     //const returnUrl='https://api.plywoodbazar.com/test/usersubscription/handleJuspayPaymentForSubcription'


//     try {
//         const sessionResponse = await juspayConfig.orderSession.create({
//             order_id: options.orderId,
//             amount: options.amount,
//             payment_page_client_id: paymentPageClientId,                    // [required] shared with you, in config.json
//             customer_id: options.userId,                       // [optional] your customer id here
//             action: 'paymentPage',                                          // [optional] default is paymentPage
//             return_url: returnUrl,                                          // [optional] default is value given from dashboard
//             customer_phone: options.mobile,                                          // [optional] default is value given from dashboard
//             customer_email: options.email,                                          // [optional] default is value given from dashboard
//             currency: 'INR',
//             description:'',
//             udf6:options.subscriptionId                                                 // [optional] default is INR
//         })

        
//     if (sessionResponse && !sessionResponse?.sucess) {
//       throw new Error(`Payment system in not working try again`);
//     }

//     let orderPaymentObj: any = sessionResponse?.data;
//     let obj1 = await Payment.findByIdAndUpdate(paymentObjResponse._id, {
//       "gatwayPaymentObj": orderPaymentObj,
//     })
//       .lean()
//       .exec();
//         // removes http field from response, typically you won't send entire structure as response
//         return res.json(makeJuspayResponse(sessionResponse))
//     } catch (error) {
//         if (error instanceof APIError) {
//             // handle errors comming from juspay's api
//             return res.json(makeError(error.message))
//         }
//         console.log(error,'zzzzzzzzzz')
//         return res.json(makeError())
//     }
// }

export const initiateJuspayPaymentForSubcription = async (req: Request, res: Response, next: NextFunction) => {


  if (!Types.ObjectId.isValid(req.body._id)) {
    // Handle the invalid ObjectId case
    return  res.status(400).json({result:false,"message":"Invalid Subscription Id"})
  }

  if (!req?.user?.userId) {
    // Handle the invalid ObjectId case
    return  res.status(404).json({result:false,"message":"Unauthorized request"})
}

    let existsCheck: any = await UserSubscription.findOne({ userId: req?.user?.userId }).sort({ endDate: -1 }).exec();
    console.log(existsCheck, "existsCheck");
    let tempStartDate: any = new Date();
    let tempEndDate: any = new Date();

    if (req.body?.noOfMonth > 0) {
      if (existsCheck && existsCheck.endDate) {
        tempStartDate = new Date(existsCheck.endDate);
        tempEndDate = moment(existsCheck.endDate).add({ months: req.body?.noOfMonth });
      } else {
        tempEndDate = moment(tempEndDate).add({ months: req.body?.noOfMonth });
      }
    } else if (existsCheck && existsCheck.endDate) {
      tempEndDate = existsCheck.endDate;
    } else {
      tempEndDate = undefined;
    }

    let checkSubscription: any = await Subscription
    .findById(req.body._id)   // Find by ObjectId directly
    .exec();

    if(!checkSubscription)
    {
      return  res.status(400).json({result:false,"message":"Subscription not found"})
    }

    let obj = {
            userId: req?.user?.userId,
            subscriptionId: req.body._id,
            name: checkSubscription?.name,
            description: req.body?.description,
            price: checkSubscription.price,
            startDate: tempStartDate,
            numberOfSales: checkSubscription?.numberOfSales,
            saleDays: checkSubscription?.saleDays,
            numberOfAdvertisement: checkSubscription.numberOfAdvertisement,
            advertisementDays:checkSubscription.advertisementDays,
            isExpired: false,
            endDate: null,
          };
      
          if (tempEndDate) {
            obj.endDate = tempEndDate;
          }
          let userObj: any = await User.findById(req?.user?.userId).exec();
          if (!(userObj || userObj._id)) {
            throw new Error("Could not find user please contact admin !!!");
          }
      
          // Add GST
      
          obj.price = obj.price + Math.round(obj.price * 0.18);
      
          let options: any = {
            amount: obj.price,
            currency: "INR",
            receipt: new Date().getTime(),
          };
      
          let paymentObj = {
            amount: obj.price,
            orderObj: obj, // razorpay
            paymentChk: 0,
          };


          let paymentObjResponse = await new Payment(paymentObj).save();

              options.orderId = paymentObjResponse._id;
              options.mobile = userObj?.phone;
              options.userId = userObj._id.toString();
              options.email = userObj.email;
              options.subscriptionId = existsCheck._id;
              options.successUrl = `${process.env.BASE_URL}/usersubscription/phonepePaymentStatusCheck/` + paymentObjResponse._id;
              options.payfrom = req.body.patfrom;
              console.log('xoptions',options)

  // makes return url
  const paymentPageClientId=hdfcConfig.PAYMENT_PAGE_CLIENT_ID;
  const orderId = `order_${Date.now()}`
  const amount = 1 + Math.random() * 100 | 0

    // makes return url
    const returnUrl = `${process.env.BASE_URL}/usersubscription/handleJuspayPaymentForSubcription`
  try {
      const sessionResponse = await juspayConfig.orderSession.create({
          order_id: orderId,
          amount: options.amount,
          payment_page_client_id: paymentPageClientId,                    // [required] shared with you, in config.json
          customer_id: options.userId,                       // [optional] your customer id here
          action: 'paymentPage',                                          // [optional] default is paymentPage
          return_url: returnUrl,                                          // [optional] default is value given from dashboard
          currency: 'INR',
          customer_phone:options.email,                                                 // [optional] default is INR
          customer_email:options.mobile,
          udf6:options.subscriptionId                                                 // [optional] default is INR
      })

      let orderPaymentObj: any = sessionResponse;
      let obj1 = await Payment.findByIdAndUpdate(paymentObjResponse._id, {
        "gatwayPaymentObj": orderPaymentObj,
      })
        .lean()
        .exec();

        console.log('upadtedx',obj1);
        sessionResponse.orderIdx=paymentObjResponse._id;
      // removes http field from response, typically you won't send entire structure as response
      return res.json(makeJuspayResponse(sessionResponse))
  } catch (error) {
      if (error instanceof APIError) {
          // handle errors comming from juspay's api
          return res.json(makeError(error.message))
      }
      return res.json(makeError())
  }
  }

export const handleJuspayPaymentForSubcription = async (req: Request, res: Response, next: NextFunction) => {

  const orderId: string | undefined = req.body.order_id || req.body.orderId;

  if (orderId === undefined) {
      return res.status(400).json(makeError('order_id not present or cannot be empty'));
  }

   // const userObj = await User.findById(req.user.userId).lean().exec();
   //let orderObj: any = await Payment.findById({orderIdx}).exec();
  

   let orderObj : any = await Payment.findOne({ 'gatwayPaymentObj.order_id': orderId }).exec();
  
   console.log('qazxc',orderObj)

   if (!orderObj) {
    return res.status(400).json(makeError('order not found'));
   }

   if (orderObj?.paymentChk == 1) {
     // throw new Error("Payment is already Done");
     console.log(req.body, "Payment is already Done");

     res.redirect(`${process.env.APP_URL}/Payment/${orderObj._id}?msg=Payment is already Done`);
     // res.json({ message: "Payment is already Done ", success: true, orderId: orderObj._id, data: orderObj });
     return;
   }

  try {
      // Call Juspay API to get order status
      const statusResponse = await juspayConfig.order.status(orderId);
      const orderStatus: string = statusResponse.status;
      console.log('qwerty',statusResponse)
      let message: string = '';
      let obj1 = await Payment.findByIdAndUpdate(orderObj._id, {
        "statusResponse": statusResponse,
      })
        .lean()
        .exec();

      if(orderStatus === "PENDING") {
        message = "order payment pending";
        res.redirect(`${process.env.APP_URL}/Payment/${orderObj._id}?result=error&message=${encodeURIComponent(message)}&orderId=${statusResponse.order_id}&orderStatus=${orderStatus}&txn_id=${statusResponse.txn_id}&effective_amount=${statusResponse.effective_amount}&txn_uuid=${statusResponse.txn_uuid}&type=subscription`)
    }
    
    if(orderStatus === "PENDING_VBV") {
        message = "order payment pending";
        res.redirect(`${process.env.APP_URL}/Payment/${orderObj._id}?result=error&message=${encodeURIComponent(message)}&orderId=${statusResponse.order_id}&orderStatus=${orderStatus}&txn_id=${statusResponse.txn_id}&effective_amount=${statusResponse.effective_amount}&txn_uuid=${statusResponse.txn_uuid}&type=subscription`);
    }
    
    if(orderStatus === "AUTHORIZATION_FAILED") {
        message = "order payment authorization failed";
        res.redirect(`${process.env.APP_URL}/Payment/${orderObj._id}?result=error&message=${encodeURIComponent(message)}&orderId=${statusResponse.order_id}&orderStatus=${orderStatus}&txn_id=${statusResponse.txn_id}&effective_amount=${statusResponse.effective_amount}&txn_uuid=${statusResponse.txn_uuid}&type=subscription`);
    }
    
    if(orderStatus === "AUTHENTICATION_FAILED") {
        message = "order payment authentication failed";
        res.redirect(`${process.env.APP_URL}/Payment/${orderObj._id}?result=error&message=${encodeURIComponent(message)}&orderId=${statusResponse.order_id}&orderStatus=${orderStatus}&txn_id=${statusResponse.txn_id}&effective_amount=${statusResponse.effective_amount}&txn_uuid=${statusResponse.txn_uuid}&type=subscription`);
    }
      let orderIdForBlock=orderId
      if(orderStatus==="CHARGED"){

        const updatedPayment = await Payment.findOneAndUpdate(
          { 'gatwayPaymentObj.order_id': orderIdForBlock }, // Find payment by order_id in gatwayPaymentObj
          { $set: {  "paymentChk": 1,
            "gatwayPaymentObj": statusResponse}
           }, // Update order_id
          { new: true } // Return the updated document
        ).exec();
    
        if (updatedPayment) {
          console.log('Updated Payment:', updatedPayment);
        } else {
          console.log('No payment found with the given order_id.');
        }
        

          orderObj=updatedPayment
          console.log(orderObj,'zxcv')
          console.log(orderObj?.orderObj?.userId,'zxcv')

         let userObj: any = await User.findById(orderObj?.orderObj?.userId).exec();

        let patObj: any = orderObj?.orderObj;
        console.log(orderObj?.orderObj?.userId,'patObj')
        let totalSubscription = await UserSubscription.countDocuments({});
        console.log(totalSubscription,'totalSubscription')

        let invoiceId = getSubscriptionSequence(totalSubscription + 1);
        patObj.orderId = invoiceId;
    
    
        await User.findByIdAndUpdate(orderObj?.orderObj?.userId, {
          $inc: {
            numberOfSales: patObj.numberOfSales,
            saleDays: patObj?.saleDays,
            numberOfAdvertisement: patObj?.numberOfAdvertisement,
            advertisementDays: patObj?.advertisementDays,
          },
          subscriptionEndDate: patObj.endDate,
        }).exec();
        orderObj = await new UserSubscription(patObj).save();
        let email = userObj?.email ? userObj?.email : userObj?.companyObj?.email;
        let name = userObj?.name;
        let orderId = orderObj?.orderId;
        let emailArr = [
          {
            name,
            email,
          },
        ];
        let customerTitle = `Subscription has been confirmed ${orderId}`;
        let adminTitle = `New Subscription ${orderId} -  ${name}`;
        orderObj.user = userObj;
        let obj3 = { ...orderObj };
        console.log(obj3);
        obj3.order_id = invoiceId;
        obj3.createdAtDate2 = new Date(orderObj.createdAt).toDateString();
        await sendMail(emailArr, orderObj._id, customerTitle, orderObj);
        let emailAr2 = [{ name: "Plywood Bazar", email: "admin@plywoodbazar.com" }];
        await sendMail(emailAr2, orderObj._id, adminTitle, orderObj);
        console.log("asdsadad", process.env.APP_URL);
    
        let crmObj = {
          PersonName: userObj?.name,
          MobileNo: userObj?.phone,
          EmailID: userObj?.email,
          CompanyName: `${userObj?.companyObj?.name}`,
          OfficeAddress: `${userObj?.address}`,
          MediumName: "Subscribed",
          CampaignName: orderObj?.name,
          Country: "",
          State: "",
          City: "",
          SourceName: "app",
          InitialRemarks: `Start Date  : ${orderObj?.startDate}, End Date : ${orderObj?.endDate}`,
        };
        if (req.body?.SourceName) {
          crmObj.SourceName = req.body?.SourceName;
        }
        if (userObj.countryId) {
          let countryObj = await Country.findById(userObj.countryId).exec();
          crmObj.Country = countryObj?.name ? countryObj?.name : "";
        }
        if (userObj.stateId) {
          let stateObj = await State.findById(userObj.stateId).exec();
          crmObj.State = stateObj?.name ? stateObj?.name : "";
        }
        if (userObj.cityId) {
          let cityObj = await City.findById(userObj.cityId).exec();
          crmObj.City = cityObj?.name ? cityObj?.name : "";
        }
        await postSpiCrmLead(crmObj);
        res.redirect(`${process.env.APP_URL}/Payment/${orderObj._id}?orderStatus=${orderStatus}&txn_id=${statusResponse.txn_id}&effective_amount=${statusResponse.effective_amount}&txn_uuid=${statusResponse.txn_uuid}&type=subscription&orderId=${statusResponse.order_id}`);
      }
      
      // Remove unnecessary fields from the response
      //return res.send(makeJuspayResponse(statusResponse));
  } catch (error) {
      if (error instanceof APIError) {
          // Handle Juspay API errors
          return res.json(makeError(error.message));
      }
      console.log(error,'zzzzzzzzzz')
      return res.json(makeError());
  }

}
// Utility functions
function makeError(message?: string) {
  return {
      message: message || 'Something went wrong'
  };
}
function makeJuspayResponse(successRspFromJuspay: Record<string, any>) {
  if (!successRspFromJuspay) return successRspFromJuspay;
  if (successRspFromJuspay.http !== undefined) delete successRspFromJuspay.http;
  return successRspFromJuspay;
}