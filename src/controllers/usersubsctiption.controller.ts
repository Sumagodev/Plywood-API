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
      userId: req?.user?.userId,
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


    console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxpatObj',patObj)


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
    console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxorderObj',orderObj)
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
