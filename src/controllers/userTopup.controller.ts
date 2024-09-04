import { NextFunction, Request, Response } from "express";
import { UserTopup } from "../models/userTopup.model";
import { User } from "../models/user.model";
import moment from "moment";
import { Payment } from "../models/Payment.model";
import { checkStatusPhonePaymentOrder, createPhonePaymentOrder } from "../helpers/phonepay";
import { sendMail } from "../helpers/mailer";
import { getTopUpOrderIdSequence } from "../helpers/constant";
export const buyTopup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.body, req.user);

    let existsCheck: any = await UserTopup.findOne({ userId: req?.user?.userId }).sort({ endDate: -1 }).exec();
    console.log(existsCheck, "existsCheck");
    let userObj: any = await User.findOne({ userId: req?.user?.userId }).exec();
    if (!(userObj || userObj._id)) {
      throw new Error("Could not find user please contact admin !!!");
    }
    let obj = {
      userId: req?.user?.userId,
      subscriptionId: req.body._id,
      name: req.body?.name,
      description: req.body?.description,
      price: req.body?.price,
      numberOfSales: req?.body?.numberOfSales ? req?.body?.numberOfSales : 0,
      saleDays: req?.body?.saleDays ? req?.body?.saleDays : 0,
      numberOfAdvertisement: req?.body?.numberOfAdvertisement ? req?.body?.numberOfAdvertisement : 0,
      advertisementDays: req?.body?.advertisementDays ? req?.body?.advertisementDays : 0,
      isExpired: false,
      endDate: null,
    };

    // Add GST
    obj.price = obj.price + Math.round(obj.price * 0.18);

    await User.findByIdAndUpdate(req?.user?.userId, {
      $inc: {
        numberOfSales: obj.numberOfSales,
        saleDays: obj?.saleDays,
        numberOfAdvertisement: obj?.numberOfAdvertisement,
        advertisementDays: obj?.advertisementDays,
      },
    }).exec();
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
    options.successUrl = `${process.env.BASE_URL}/userTopup/phonepePaymentStatusCheck/` + paymentObjResponse._id;
    options.payfrom = req.body.patfrom;
    let phoResone = await createPhonePaymentOrder(options);
    if (phoResone && !phoResone?.sucess) {
      throw new Error(`Phonepe is not working.Please Try Some another Payment Method`);
    }
    let orderPaymentObj: any = phoResone?.data;
    let obj1 = await Payment.findByIdAndUpdate(paymentObjResponse._id, {
      "gatwayPaymentObj": orderPaymentObj,
    })
      .lean()
      .exec();

    res.status(200).json({
      message: "UserTopup Successfully Created",
      data: orderPaymentObj,
      orderId: paymentObjResponse._id,
      success: true,
    });
  } catch (err) {
    next(err);
  }
};

export const phonepePaymentTopUpStatusCheck = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.body, "-------------------------------------------------");

    // const userObj = await User.findById(req.user.userId).lean().exec();
    let orderObj: any = await Payment.findById(req.params.orderId).exec();
    if (!orderObj) throw new Error("Order Not Found");
    if (orderObj?.paymentChk == 1) {
      // throw new Error("Payment is already Done");
      res.json({ message: "Payment is already Done ", success: true, orderId: orderObj._id, data: orderObj });
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
    let patObj = orderObj?.orderObj;
    let totalSubscription = await UserTopup.countDocuments({});
    let invoiceId = getTopUpOrderIdSequence(totalSubscription + 1);
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

    orderObj = await new UserTopup(patObj).save();

    let email = userObj?.email ? userObj?.email : userObj?.companyObj?.email;
    let name = userObj?.name;
    let orderId = orderObj?.orderId;
    let emailArr = [
      {
        name,
        email,
      },
    ];
    let customerTitle = `Topup has been confirmed ${orderId}`;
    let adminTitle = `New Topup ${orderId} -  ${name}`;

    let obj3 = { ...orderObj };
    console.log(obj3);
    obj3.order_id = orderId;
    obj3.createdAtDate2 = new Date(orderObj.createdAt).toDateString();
    await sendMail(emailArr, orderObj._id, customerTitle, orderObj);
    let emailAr2 = [{ name: "Plywood Bazar", email: "admin@plywoodbazar.com" }];
    await sendMail(emailAr2, orderObj._id, adminTitle, orderObj);
    console.log("asdsadad", process.env.APP_URL);
    res.redirect(`${process.env.APP_URL}/Payment/${orderObj._id}`);
    // res.json({ message: "Payment Successfull", success: true, orderId: orderObj._id, data: phoneObj });
  } catch (err) {
    next(err);
  }
};

export const getTopup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // let TopupArr: any = [];
    // let query: any = {}
    // console.log(req.query, "req.query.q")
    // if (req.query.q) {
    //     query.name = new RegExp(`${req.query.q}`, "i");
    // }
    // // if (req.query.TopupId) {
    // //   query.TopupId = req.query.TopupId;
    // // }
    // TopupArr = await UserTopup.find(query).lean().exec();
    // // for (let UserTopup of TopupArr) {
    // //   if (UserTopup.TopupId) {
    // //     console.log(UserTopup.TopupId, "TopupIdTopupId")
    // //     UserTopup.TopupObj = await UserTopup.findById(UserTopup.TopupId).exec();
    // //   }
    // // }

    res.status(200).json({ message: "getTopup", success: true });
    // res.status(200).json({ message: "getTopup", data: TopupArr, success: true });
  } catch (err) {
    next(err);
  }
};

export const getTopupSubscribedbyUserId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
    let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 1000;

    let pipeline: any = [
      {
        "$match": {
          "TopupId": "643e355aecef4e188270bb68",
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
          "usersArr.TopupEndDate": 1,
          "usersArr.price": 1,
          "usersArr.startDate": 1,
          "usersArr.endDate": 1,
          "usersArr.createdAt": 1,
        },
      },
    ];
    let TopupArr: any = [];

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
    // // if (req.query.TopupId) {
    // //   query.TopupId = req.query.TopupId;
    // // }
    TopupArr = await UserTopup.aggregate(pipeline).exec();
    // // for (let UserTopup of TopupArr) {
    // //   if (UserTopup.TopupId) {
    // //     console.log(UserTopup.TopupId, "TopupIdTopupId")
    // //     UserTopup.TopupObj = await UserTopup.findById(UserTopup.TopupId).exec();
    // //   }
    // // }
    console.log(JSON.stringify(TopupArr, null, 2), "TopupArr");

    res.status(200).json({ message: "getTopup", data: TopupArr, success: true });
    // res.status(200).json({ message: "getTopup", data: TopupArr, success: true });
  } catch (err) {
    next(err);
  }
};

export const getAllTopupbyUserId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let TopupArr: any = [];
    // let query: any = {}
    // console.log(req.query, "req.query.q")
    // if (req.query.q) {
    //     query.name = new RegExp(`${req.query.q}`, "i");
    // }
    // // if (req.query.TopupId) {
    // //   query.TopupId = req.query.TopupId;
    // // }
    console.log(req.query);
    let pageValue = req.query.currentPage ? parseInt(`${req.query.currentPage}`) : 1;
    let limitValue = req.query.rowsPerPage ? parseInt(`${req.query.rowsPerPage}`) : 10;
    const totalCount = await UserTopup.find({
      $or: [{ userId: req.user?.userId }, { userId: req.query?.userId }],
    }).countDocuments();
    TopupArr = await UserTopup.find({ $or: [{ userId: req.user?.userId }, { userId: req.query?.userId }] })
      .skip((pageValue - 1) * limitValue)
      .limit(limitValue)
      .lean()
      .sort({ endDate: -1 })
      .exec();
    // // for (let UserTopup of TopupArr) {
    // //   if (UserTopup.TopupId) {
    // //     console.log(UserTopup.TopupId, "TopupIdTopupId")
    // //     UserTopup.TopupObj = await UserTopup.findById(UserTopup.TopupId).exec();
    // //   }
    // // }

    res.status(200).json({ message: "getAllTopupbyUserId", data: TopupArr, totalCount: totalCount, success: true });
    // res.status(200).json({ message: "getTopup", data: TopupArr, success: true });
  } catch (err) {
    next(err);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // let TopupObj: any = await UserTopup.findById(req.params.id).lean().exec();
    // if (!TopupObj) throw { status: 400, message: "UserTopup Not Found" };
    res.status(200).json({ message: "UserTopup Found", success: true });
    // res.status(200).json({ message: "UserTopup Found", data: TopupObj, success: true });
  } catch (err) {
    next(err);
  }
};
